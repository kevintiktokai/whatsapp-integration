// lib/wa_tools/extract.ts
// Parse webhook payload, extract routing keys safely.

import { waWebhookPayloadSchema } from "./schemas";

export interface ExtractedMessage {
    phoneNumberId: string;
    waContactId: string;
    metaMessageId: string;
    timestamp: string;
    type: string;
    textBody: string | null;
    contactName: string | null;
}

export interface ExtractedStatus {
    phoneNumberId: string;
    statusId: string;
    status: string;
    timestamp: string;
    recipientId: string;
}

export interface WebhookExtraction {
    phoneNumberId: string | null;
    messages: ExtractedMessage[];
    statuses: ExtractedStatus[];
}

export function extractWebhookData(payload: unknown): WebhookExtraction {
    const parsed = waWebhookPayloadSchema.safeParse(payload);
    if (!parsed.success) {
        return { phoneNumberId: null, messages: [], statuses: [] };
    }

    const data = parsed.data;
    const messages: ExtractedMessage[] = [];
    const statuses: ExtractedStatus[] = [];
    let phoneNumberId: string | null = null;

    for (const entry of data.entry ?? []) {
        for (const change of entry.changes ?? []) {
            const value = change.value;
            if (!value) continue;

            const pnId = value.metadata?.phone_number_id;
            if (pnId) phoneNumberId = pnId;

            const contacts = value.contacts ?? [];
            const contactMap: Record<string, string> = {};
            for (const c of contacts) {
                if (c.wa_id) {
                    contactMap[c.wa_id] = c.profile?.name ?? "";
                }
            }

            for (const msg of value.messages ?? []) {
                if (!msg.id || !msg.from || !pnId) continue;
                messages.push({
                    phoneNumberId: pnId,
                    waContactId: msg.from,
                    metaMessageId: msg.id,
                    timestamp: msg.timestamp ?? new Date().toISOString(),
                    type: msg.type ?? "unknown",
                    textBody: msg.text?.body ?? null,
                    contactName: contactMap[msg.from] ?? null,
                });
            }

            for (const st of value.statuses ?? []) {
                if (!st.id || !pnId) continue;
                statuses.push({
                    phoneNumberId: pnId,
                    statusId: st.id,
                    status: st.status ?? "unknown",
                    timestamp: st.timestamp ?? new Date().toISOString(),
                    recipientId: st.recipient_id ?? "",
                });
            }
        }
    }

    return { phoneNumberId, messages, statuses };
}
