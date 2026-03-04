export const dynamic = 'force-dynamic';
// app/api/wa/conversations/[id]/tracking/route.ts
// POST — Toggle tracking mode (off <-> tracked)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const trackingSchema = z.object({
    tracking_mode: z.enum(["off", "tracked"]),
});

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const parsed = trackingSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid request", issues: parsed.error.issues },
            { status: 400 }
        );
    }

    const conversation = await prisma.whatsAppConversation.findUnique({
        where: { id },
    });

    if (!conversation) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    await prisma.whatsAppConversation.update({
        where: { id },
        data: { trackingMode: parsed.data.tracking_mode },
    });

    return NextResponse.json({
        ok: true,
        conversation_id: id,
        tracking_mode: parsed.data.tracking_mode,
    });
}
