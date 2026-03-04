export const dynamic = 'force-dynamic';
// app/api/wa/onboarding/complete/route.ts
// Receives Embedded Signup callback, validates state, exchanges token (stubbed), subscribes webhooks.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { waOnboardingCompleteRequestSchema } from "@/lib/wa_tools/schemas";
import { verifyAndParseState } from "@/lib/wa_tools/state";
import { exchangeCodeForToken, subscribeToWabaWebhooks } from "@/lib/wa_tools/meta_stub";
import { classifyMetaError } from "@/lib/wa_tools/classifyError";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    const parsed = waOnboardingCompleteRequestSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid request", issues: parsed.error.issues },
            { status: 400 }
        );
    }

    const { state, waba_id, phone_number_id, code } = parsed.data;
    const secret = process.env.WA_STATE_SIGNING_SECRET!;
    const stateResult = verifyAndParseState(state, secret);

    if (!stateResult.ok) {
        return NextResponse.json({ error: "Invalid state", reason: stateResult.reason }, { status: 403 });
    }

    const { payload } = stateResult;

    // Verify session exists and is in the right state
    const session = await prisma.onboardingSession.findUnique({
        where: { id: payload.session_id },
    });

    if (!session || session.stateNonce !== payload.nonce) {
        return NextResponse.json({ error: "Session not found or nonce mismatch" }, { status: 403 });
    }

    // Update session with received IDs
    await prisma.onboardingSession.update({
        where: { id: session.id },
        data: {
            status: "callback_received",
            wabaId: waba_id,
            phoneNumberId: phone_number_id,
        },
    });

    try {
        // Step 1: Exchange code for token
        const tokenResult = await exchangeCodeForToken(code);

        await prisma.onboardingSession.update({
            where: { id: session.id },
            data: { status: "token_exchanged" },
        });

        // Step 2: Subscribe to WABA webhooks
        await subscribeToWabaWebhooks(waba_id, tokenResult.access_token);

        await prisma.onboardingSession.update({
            where: { id: session.id },
            data: { status: "webhooks_subscribed" },
        });

        // Step 3: Create WhatsApp account + credentials
        const accountId = uuidv4();
        const connectionStatus =
            session.modeRequested === "coexistence" ? "connected_coexistence" : "connected_api_only";

        await prisma.whatsAppAccount.create({
            data: {
                id: accountId,
                orgId: session.orgId,
                agentUserId: session.agentUserId,
                wabaId: waba_id,
                phoneNumberId: phone_number_id,
                status: connectionStatus,
            },
        });

        await prisma.whatsAppCredential.create({
            data: {
                whatsappAccountId: accountId,
                accessTokenCiphertext: tokenResult.access_token, // TODO: encrypt at rest
                tokenKind: "system_user",
            },
        });

        // Finalize session
        await prisma.onboardingSession.update({
            where: { id: session.id },
            data: { status: connectionStatus },
        });

        return NextResponse.json({
            ok: true,
            session_id: session.id,
            status: connectionStatus,
            account_id: accountId,
        });
    } catch (err: unknown) {
        const errorPayload = err instanceof Error ? { message: err.message } : {};
        const envelope = classifyMetaError(undefined, (err as Error)?.message, errorPayload);

        await prisma.onboardingSession.update({
            where: { id: session.id },
            data: {
                status: "failed",
                errorClass: envelope.class,
                errorJson: JSON.stringify(envelope),
            },
        });

        return NextResponse.json({
            ok: false,
            session_id: session.id,
            status: "failed",
            error: envelope,
        });
    }
}
