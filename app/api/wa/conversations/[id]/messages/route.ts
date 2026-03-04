export const dynamic = 'force-dynamic';
// app/api/wa/conversations/[id]/messages/route.ts
// GET — Return messages (only if tracking is on, else 403)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const conversation = await prisma.whatsAppConversation.findUnique({
        where: { id },
    });

    if (!conversation) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (conversation.trackingMode === "off") {
        return NextResponse.json(
            {
                error: "Tracking is off for this conversation",
                hint: "Enable tracking to view message content",
            },
            { status: 403 }
        );
    }

    const messages = await prisma.whatsAppMessage.findMany({
        where: { conversationId: id },
        orderBy: { ts: "asc" },
    });

    return NextResponse.json({
        conversation_id: id,
        tracking_mode: conversation.trackingMode,
        messages: messages.map((m: { id: string; msgType: string; text: string | null; ts: Date; metaMessageId: string }) => ({
            id: m.id,
            direction: "inbound",
            type: m.msgType,
            text: m.text,
            timestamp: m.ts.toISOString(),
            meta_message_id: m.metaMessageId,
        })),
    });
}
