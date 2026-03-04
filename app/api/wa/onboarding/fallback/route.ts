export const dynamic = 'force-dynamic';
// app/api/wa/onboarding/fallback/route.ts
// Marks coexistence failure and creates a new API-only onboarding session.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { waOnboardingFallbackRequestSchema } from "@/lib/wa_tools/schemas";
import { signState, type StatePayload } from "@/lib/wa_tools/state";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    const parsed = waOnboardingFallbackRequestSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid request", issues: parsed.error.issues },
            { status: 400 }
        );
    }

    const originalSession = await prisma.onboardingSession.findUnique({
        where: { id: parsed.data.session_id },
    });

    if (!originalSession) {
        return NextResponse.json({ error: "Original session not found" }, { status: 404 });
    }

    // Create new API-only session
    const newSessionId = uuidv4();
    const nonce = crypto.randomBytes(16).toString("hex");
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 15 * 60;

    await prisma.onboardingSession.create({
        data: {
            id: newSessionId,
            orgId: originalSession.orgId,
            agentUserId: originalSession.agentUserId,
            modeRequested: "api_only",
            status: "launching_api_only",
            stateNonce: nonce,
            stateIssuedAt: new Date(iat * 1000),
            stateExpiresAt: new Date(exp * 1000),
        },
    });

    const payload: StatePayload = {
        v: 1,
        session_id: newSessionId,
        org_id: originalSession.orgId,
        agent_user_id: originalSession.agentUserId,
        nonce,
        iat,
        exp,
    };

    const secret = process.env.WA_STATE_SIGNING_SECRET!;
    const state = signState(payload, secret);

    return NextResponse.json({
        session_id: newSessionId,
        mode_requested: "api_only" as const,
        state,
        expires_at: new Date(exp * 1000).toISOString(),
    });
}
