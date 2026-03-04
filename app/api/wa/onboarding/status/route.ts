export const dynamic = 'force-dynamic';
// app/api/wa/onboarding/status/route.ts
// Polls onboarding session status for the UI wizard.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
        return NextResponse.json({ error: "session_id required" }, { status: 400 });
    }

    const session = await prisma.onboardingSession.findUnique({
        where: { id: sessionId },
    });

    if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
        session_id: session.id,
        status: session.status,
        mode_requested: session.modeRequested,
        waba_id: session.wabaId,
        phone_number_id: session.phoneNumberId,
        error: session.errorJson ? JSON.parse(session.errorJson) : null,
    });
}
