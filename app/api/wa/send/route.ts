export const dynamic = 'force-dynamic';
// app/api/wa/send/route.ts
// POST — Send a WhatsApp message via Cloud API

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { conversation_id, message } = body;

        if (!conversation_id || !message) {
            return NextResponse.json(
                { ok: false, error: "Missing conversation_id or message" },
                { status: 400 }
            );
        }

        // Look up the conversation
        const conversation = await prisma.whatsAppConversation.findUnique({
            where: { id: conversation_id },
            include: {
                account: {
                    include: { credential: true },
                },
            },
        });

        if (!conversation) {
            return NextResponse.json(
                { ok: false, error: "Conversation not found" },
                { status: 404 }
            );
        }

        const account = conversation.account;
        const credential = account.credential;

        if (!credential) {
            return NextResponse.json(
                { ok: false, error: "No access token found for this WhatsApp account" },
                { status: 400 }
            );
        }

        // Send message via Meta Cloud API
        const version = process.env.META_GRAPH_VERSION ?? "v21.0";
        const url = `https://graph.facebook.com/${version}/${account.phoneNumberId}/messages`;

        const metaRes = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${credential.accessTokenCiphertext}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: conversation.waContactId,
                type: "text",
                text: { body: message },
            }),
        });

        const metaData = await metaRes.json();

        if (!metaRes.ok) {
            console.error("[SEND] Meta API error:", metaData);
            return NextResponse.json(
                { ok: false, error: "Failed to send message", meta_error: metaData },
                { status: 500 }
            );
        }

        const metaMessageId = metaData.messages?.[0]?.id || `outbound_${Date.now()}`;

        // Store outbound message in DB
        const msgId = uuidv4();
        await prisma.whatsAppMessage.create({
            data: {
                id: msgId,
                orgId: account.orgId,
                agentUserId: account.agentUserId,
                conversationId: conversation.id,
                metaMessageId: metaMessageId,
                ts: new Date(),
                msgType: "text",
                text: message,
                rawPayload: JSON.stringify({ direction: "outbound", meta_response: metaData }),
            },
        });

        // Update conversation timestamp
        await prisma.whatsAppConversation.update({
            where: { id: conversation.id },
            data: { lastMessageAt: new Date() },
        });

        console.log("[SEND] Message sent:", {
            conversationId: conversation.id,
            metaMessageId,
            to: conversation.waContactId,
        });

        return NextResponse.json({
            ok: true,
            message_id: msgId,
            meta_message_id: metaMessageId,
        });
    } catch (err) {
        console.error("[SEND] Error:", err);
        return NextResponse.json(
            { ok: false, error: (err as Error).message },
            { status: 500 }
        );
    }
}
