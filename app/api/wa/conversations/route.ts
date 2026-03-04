export const dynamic = 'force-dynamic';
// app/api/wa/conversations/route.ts
// GET — List conversations for the authenticated agent.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    // TODO: Replace with real auth
    const agentUserId = "agent_demo";

    const conversations = await prisma.whatsAppConversation.findMany({
        where: { agentUserId },
        orderBy: { lastMessageAt: "desc" },
        include: {
            _count: {
                select: { messageIndex: true },
            },
        },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = conversations.map((c: any) => ({
        id: c.id,
        wa_contact_id: c.waContactId,
        lead_id: c.leadId,
        tracking_mode: c.trackingMode,
        last_message_at: c.lastMessageAt?.toISOString() ?? null,
        message_count: c._count.messageIndex,
    }));

    return NextResponse.json({ conversations: result });
}
