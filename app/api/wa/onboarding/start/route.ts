export const dynamic = 'force-dynamic';
// app/api/wa/onboarding/start/route.ts
// Creates an onboarding session and returns signed state for Embedded Signup.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { waOnboardingStartRequestSchema } from "@/lib/wa_tools/schemas";
import { signState, type StatePayload } from "@/lib/wa_tools/state";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    // TODO: Replace with real auth — must resolve org_id + agent_user_id
    const orgId = "org_demo";
    const agentUserId = "agent_demo";

    const body = await req.json().catch(() => null);
    const parsed = waOnboardingStartRequestSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid request", issues: parsed.error.issues },
            { status: 400 }
        );
    }

    const mode = parsed.data.mode_requested;
    const sessionId = uuidv4();
    const nonce = crypto.randomBytes(16).toString("hex");
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 15 * 60; // 15 minutes

    // Create session in DB
    await prisma.onboardingSession.create({
        data: {
            id: sessionId,
            orgId,
            agentUserId,
            modeRequested: mode,
            status: mode === "coexistence" ? "launching_coexistence" : "launching_api_only",
            stateNonce: nonce,
            stateIssuedAt: new Date(iat * 1000),
            stateExpiresAt: new Date(exp * 1000),
        },
    });

    // Sign state
    const payload: StatePayload = {
        v: 1,
        session_id: sessionId,
        org_id: orgId,
        agent_user_id: agentUserId,
        nonce,
        iat,
        exp,
    };

    const secret = process.env.WA_STATE_SIGNING_SECRET!;
    const state = signState(payload, secret);

    return NextResponse.json({
        session_id: sessionId,
        mode_requested: mode,
        state,
        expires_at: new Date(exp * 1000).toISOString(),
    });
}
