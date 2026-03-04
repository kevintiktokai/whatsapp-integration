export const dynamic = 'force-dynamic';
// app/api/wa/connect/route.ts
// Direct connection route — registers a WhatsApp Business number using provided credentials.
// Skips the Embedded Signup flow for users who already have their token + IDs.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

interface ConnectRequest {
    access_token: string;
    phone_number_id: string;
    waba_id: string;
}

/**
 * Validate the access token by calling Meta Graph API.
 * Returns phone number details if valid.
 */
async function validateWithMeta(phoneNumberId: string, accessToken: string) {
    const version = process.env.META_GRAPH_VERSION ?? "v21.0";
    const url = `https://graph.facebook.com/${version}/${phoneNumberId}?access_token=${accessToken}`;

    const res = await fetch(url);
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return { valid: false, error: body };
    }

    const data = await res.json();
    return { valid: true, data };
}

/**
 * Subscribe the app to the WABA's webhooks.
 */
async function subscribeWebhooks(wabaId: string, accessToken: string) {
    const version = process.env.META_GRAPH_VERSION ?? "v21.0";
    const url = `https://graph.facebook.com/${version}/${wabaId}/subscribed_apps`;
    const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return { success: false, error: body };
    }

    return { success: true };
}

export async function POST(req: NextRequest) {
    try {
        const body: ConnectRequest = await req.json();

        // Validate required fields
        if (!body.access_token || !body.phone_number_id || !body.waba_id) {
            return NextResponse.json(
                { ok: false, error: "Missing required fields: access_token, phone_number_id, waba_id" },
                { status: 400 }
            );
        }

        // Check if this phone number is already connected
        const existing = await prisma.whatsAppAccount.findUnique({
            where: { phoneNumberId: body.phone_number_id },
        });

        if (existing) {
            return NextResponse.json(
                { ok: false, error: "This phone number is already connected", account_id: existing.id },
                { status: 409 }
            );
        }

        // Validate the access token against Meta Graph API
        const validation = await validateWithMeta(body.phone_number_id, body.access_token);

        if (!validation.valid) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "Invalid access token or phone number ID. Please check your credentials.",
                    meta_error: validation.error,
                },
                { status: 401 }
            );
        }

        // Extract display phone number from Meta response
        const displayPhoneNumber = validation.data?.display_phone_number || null;

        // Subscribe to WABA webhooks
        const webhookResult = await subscribeWebhooks(body.waba_id, body.access_token);
        if (!webhookResult.success) {
            console.warn("[CONNECT] Webhook subscription failed:", webhookResult.error);
            // Continue anyway — the connection itself is valid
        }

        // TODO: Replace with real auth — must resolve org_id + agent_user_id
        const orgId = "org_demo";
        const agentUserId = "agent_demo";

        // Create the WhatsApp account
        const accountId = uuidv4();
        await prisma.whatsAppAccount.create({
            data: {
                id: accountId,
                orgId,
                agentUserId,
                wabaId: body.waba_id,
                phoneNumberId: body.phone_number_id,
                displayPhoneNumber,
                status: "connected_api_only",
            },
        });

        // Store the access token
        await prisma.whatsAppCredential.create({
            data: {
                whatsappAccountId: accountId,
                accessTokenCiphertext: body.access_token, // TODO: encrypt at rest
                tokenKind: "long_lived",
            },
        });

        console.log("[CONNECT] WhatsApp account connected:", {
            accountId,
            phoneNumberId: body.phone_number_id,
            wabaId: body.waba_id,
            displayPhoneNumber,
            webhookSubscribed: webhookResult.success,
        });

        return NextResponse.json({
            ok: true,
            account_id: accountId,
            phone_number_id: body.phone_number_id,
            waba_id: body.waba_id,
            display_phone_number: displayPhoneNumber,
            status: "connected_api_only",
            webhook_subscribed: webhookResult.success,
        });
    } catch (err) {
        console.error("[CONNECT] Error:", err);
        return NextResponse.json(
            { ok: false, error: (err as Error).message || "An unexpected error occurred" },
            { status: 500 }
        );
    }
}

/**
 * GET — List all connected WhatsApp accounts.
 */
export async function GET() {
    try {
        const accounts = await prisma.whatsAppAccount.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                wabaId: true,
                phoneNumberId: true,
                displayPhoneNumber: true,
                status: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ ok: true, accounts });
    } catch (err) {
        console.error("[CONNECT] List error:", err);
        return NextResponse.json(
            { ok: false, error: (err as Error).message },
            { status: 500 }
        );
    }
}
