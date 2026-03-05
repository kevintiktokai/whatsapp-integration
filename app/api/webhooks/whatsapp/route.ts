export const dynamic = 'force-dynamic';
// app/api/webhooks/whatsapp/route.ts
// Central webhook endpoint: GET (verification) + POST (inbound ingestion)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractWebhookData } from "@/lib/wa_tools/extract";
import { shouldStoreBody, shouldStoreIndex } from "@/lib/wa_tools/policy";
import { v4 as uuidv4 } from "uuid";

/**
 * GET — Meta webhook verification handshake.
 * Meta sends hub.mode, hub.verify_token, hub.challenge as query params.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const verifyToken = process.env.WA_WEBHOOK_VERIFY_TOKEN;

    if (mode === "subscribe" && token === verifyToken && challenge) {
        console.log("[WEBHOOK] Verification succeeded");
        return new NextResponse(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
    }

    console.warn("[WEBHOOK] Verification failed", { mode, tokenMatch: token === verifyToken });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/**
 * POST — Inbound message/status ingestion.
 * Always return 200 to prevent Meta retry storms.
 */
export async function POST(req: NextRequest) {
    const requestId = uuidv4();

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        console.warn("[WEBHOOK] Malformed body", { requestId });
        return NextResponse.json({ ok: true }, { status: 200 });
    }

    const extraction = extractWebhookData(body);

    if (!extraction.phoneNumberId) {
        console.warn("[WEBHOOK] No phone_number_id found", { requestId });
        return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Look up account by phone_number_id
    const account = await prisma.whatsAppAccount.findUnique({
        where: { phoneNumberId: extraction.phoneNumberId },
    });

    if (!account) {
        console.warn("[WEBHOOK] Unknown phone_number_id", {
            requestId,
            phoneNumberId: extraction.phoneNumberId,
        });
        return NextResponse.json({ ok: true }, { status: 200 });
    }

    let dedupSkips = 0;
    let trackedStoreCount = 0;
    let trackingOffCount = 0;

    for (const msg of extraction.messages) {
        // Idempotency check
        const existing = await prisma.whatsAppMessageIndex.findUnique({
            where: { metaMessageId: msg.metaMessageId },
        });
        if (existing) {
            dedupSkips++;
            continue;
        }

        // Upsert conversation
        let conversation = await prisma.whatsAppConversation.findUnique({
            where: {
                whatsappAccountId_waContactId: {
                    whatsappAccountId: account.id,
                    waContactId: msg.waContactId,
                },
            },
        });

        if (!conversation) {
            conversation = await prisma.whatsAppConversation.create({
                data: {
                    id: uuidv4(),
                    orgId: account.orgId,
                    agentUserId: account.agentUserId,
                    whatsappAccountId: account.id,
                    waContactId: msg.waContactId,
                    trackingMode: "tracked",
                    lastMessageAt: new Date(parseInt(msg.timestamp) * 1000 || Date.now()),
                },
            });
        } else {
            await prisma.whatsAppConversation.update({
                where: { id: conversation.id },
                data: { lastMessageAt: new Date(parseInt(msg.timestamp) * 1000 || Date.now()) },
            });
        }

        // Always store message index (metadata)
        if (shouldStoreIndex()) {
            await prisma.whatsAppMessageIndex.create({
                data: {
                    id: uuidv4(),
                    orgId: account.orgId,
                    agentUserId: account.agentUserId,
                    whatsappAccountId: account.id,
                    conversationId: conversation.id,
                    metaMessageId: msg.metaMessageId,
                    direction: "inbound",
                    ts: new Date(parseInt(msg.timestamp) * 1000 || Date.now()),
                    msgType: msg.type,
                },
            });
        }

        // Store body ONLY if tracked
        if (shouldStoreBody(conversation.trackingMode as "off" | "tracked")) {
            await prisma.whatsAppMessage.create({
                data: {
                    id: uuidv4(),
                    orgId: account.orgId,
                    agentUserId: account.agentUserId,
                    conversationId: conversation.id,
                    metaMessageId: msg.metaMessageId,
                    ts: new Date(parseInt(msg.timestamp) * 1000 || Date.now()),
                    msgType: msg.type,
                    text: msg.textBody,
                    rawPayload: JSON.stringify(msg),
                },
            });
            trackedStoreCount++;
        } else {
            trackingOffCount++;
        }
    }

    console.log("[WEBHOOK] Processed", {
        requestId,
        phoneNumberId: extraction.phoneNumberId,
        accountId: account.id,
        messagesReceived: extraction.messages.length,
        dedupSkips,
        trackedStoreCount,
        trackingOffCount,
        statusCount: extraction.statuses.length,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
}
