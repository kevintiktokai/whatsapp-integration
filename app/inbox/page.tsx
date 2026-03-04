"use client";
// app/inbox/page.tsx
// Conversation list with tracking badges

import { useEffect, useState } from "react";

interface Conversation {
    id: string;
    wa_contact_id: string;
    lead_id: string | null;
    tracking_mode: string;
    last_message_at: string | null;
    message_count: number;
}

export default function Inbox() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/wa/conversations")
            .then((r) => r.json())
            .then((data) => {
                setConversations(data.conversations ?? []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="container">
            <div className="page-header">
                <h1>💬 Inbox</h1>
                <p>Your WhatsApp conversations. Enable tracking to view and store messages.</p>
            </div>

            {loading ? (
                <p style={{ color: "var(--text-muted)" }}>Loading conversations...</p>
            ) : conversations.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", marginBottom: "1rem" }}>
                        No conversations yet
                    </p>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                        Connect your WhatsApp number and start receiving messages.
                    </p>
                    <a href="/settings/whatsapp" className="btn btn-primary">
                        Connect WhatsApp
                    </a>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {conversations.map((c) => (
                        <a key={c.id} href={`/inbox/${c.id}`} className="conversation-item">
                            <div className="conversation-info">
                                <span className="conversation-contact">
                                    📱 {c.wa_contact_id}
                                </span>
                                <span className="conversation-preview">
                                    {c.tracking_mode === "tracked"
                                        ? `${c.message_count} messages stored`
                                        : "Tracking off — messages not stored"}
                                </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                {c.last_message_at && (
                                    <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                                        {new Date(c.last_message_at).toLocaleDateString()}
                                    </span>
                                )}
                                <span className={`badge ${c.tracking_mode === "tracked" ? "badge-success" : "badge-off"}`}>
                                    {c.tracking_mode === "tracked" ? "Tracked" : "Off"}
                                </span>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
