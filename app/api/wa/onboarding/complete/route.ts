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

    const { state, waba_id: frontend_waba_id, phone_number_id: frontend_phone_id, code } = parsed.data;
    const secret = process.env.WA_STATE_SIGNING_SECRET || "default_secret";

    // Try to find an onboarding session if state was passed and valid
    let session = null;
    if (state && state !== "session_state") {
        const stateResult = verifyAndParseState(state, secret);
        if (stateResult.ok) {
            session = await prisma.onboardingSession.findUnique({
                where: { id: stateResult.payload.session_id },
            });
        }
    }

    try {
        // Step 1: Exchange code for token (AND dynamically fetch WABA ID / Phone Number ID)
        const tokenResult = await exchangeCodeForToken(code);

        // Use the dynamically fetched IDs from the token exchange if available, otherwise fallback to frontend
        const waba_id = tokenResult.waba_id || frontend_waba_id;
        const phone_number_id = tokenResult.phone_number_id || frontend_phone_id;

        if (!waba_id || !phone_number_id || waba_id.includes("extract_from") || phone_number_id.includes("extract_from")) {
            throw new Error(`Could not determine IDs from Meta token response. WABA ID: ${waba_id || 'null'}, Phone ID: ${phone_number_id || 'null'}. Ensure your FB App has permissions to the business account and phone numbers.`);
        }

        if (session) {
            await prisma.onboardingSession.update({
                where: { id: session.id },
                data: { status: "token_exchanged", wabaId: waba_id, phoneNumberId: phone_number_id },
            });
        }

        // Step 2: Subscribe to WABA webhooks
        await subscribeToWabaWebhooks(waba_id, tokenResult.access_token);

        if (session) {
            await prisma.onboardingSession.update({
                where: { id: session.id },
                data: { status: "webhooks_subscribed" },
            });
        }

        // Step 3: Create WhatsApp account + credentials
        const accountId = uuidv4();
        const connectionStatus = session?.modeRequested === "coexistence" ? "connected_coexistence" : "connected_api_only";

        const orgId = session?.orgId ?? "default_org";
        const agentUserId = session?.agentUserId ?? "default_agent";

        await prisma.whatsAppAccount.create({
            data: {
                id: accountId,
                orgId: orgId,
                agentUserId: agentUserId,
                wabaId: waba_id,
                phoneNumberId: phone_number_id, // Could use tokenResult.display_phone_number elsewhere if needed
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

        // Finalize session if it exists
        if (session) {
            await prisma.onboardingSession.update({
                where: { id: session.id },
                data: { status: connectionStatus },
            });
        }

        return NextResponse.json({
            ok: true,
            session_id: session?.id || "direct_flow",
            status: connectionStatus,
            account_id: accountId,
        });
    } catch (err: unknown) {
        const errorPayload = err instanceof Error ? { message: err.message } : {};
        const envelope = classifyMetaError(undefined, (err as Error)?.message, errorPayload);

        if (session) {
            await prisma.onboardingSession.update({
                where: { id: session.id },
                data: {
                    status: "failed",
                    errorClass: envelope.class,
                    errorJson: JSON.stringify(envelope),
                },
            });
        }

        return NextResponse.json({
            ok: false,
            status: "failed",
            error: envelope.display_title + ": " + envelope.display_body,
            details: envelope
        });
    }
}
