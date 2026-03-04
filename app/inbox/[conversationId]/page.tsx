"use client";
// app/inbox/[conversationId]/page.tsx
// Chat thread view with tracking toggle

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Message {
    id: string;
    direction: string;
    type: string;
    text: string | null;
    timestamp: string;
    meta_message_id: string;
}

export default function ChatThread() {
    const params = useParams();
    const conversationId = params.conversationId as string;

    const [trackingMode, setTrackingMode] = useState<string>("off");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/wa/conversations/${conversationId}/messages`);
            if (res.status === 403) {
                setTrackingMode("off");
                setMessages([]);
                setError(null);
            } else if (res.ok) {
                const data = await res.json();
                setTrackingMode(data.tracking_mode);
                setMessages(data.messages ?? []);
                setError(null);
            } else {
                setError("Failed to load messages");
            }
        } catch {
            setError("Failed to load messages");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

    const toggleTracking = async () => {
        setToggling(true);
        const newMode = trackingMode === "tracked" ? "off" : "tracked";

        try {
            await fetch(`/api/wa/conversations/${conversationId}/tracking`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tracking_mode: newMode }),
            });
            setTrackingMode(newMode);
            if (newMode === "tracked") {
                await fetchMessages();
            }
        } catch {
            // ignore
        } finally {
            setToggling(false);
        }
    };

    return (
        <div className="container">
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                    <a href="/inbox" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem" }}>
                        ← Back to Inbox
                    </a>
                    <h1 style={{ fontSize: "1.3rem", marginTop: "0.5rem" }}>💬 Conversation</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>ID: {conversationId}</p>
                </div>

                <div className="toggle-container">
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        {trackingMode === "tracked" ? "Tracking ON" : "Tracking OFF"}
                    </span>
                    <div
                        className={`toggle ${trackingMode === "tracked" ? "active" : ""}`}
                        onClick={toggling ? undefined : toggleTracking}
                        style={{ opacity: toggling ? 0.5 : 1 }}
                    />
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <p style={{ color: "var(--text-muted)" }}>Loading...</p>
            ) : error ? (
                <div className="error-card">
                    <h3>Error</h3>
                    <p>{error}</p>
                </div>
            ) : trackingMode === "off" ? (
                <div className="card tracking-off-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                    <h3 style={{ marginBottom: "0.5rem" }}>Tracking is Off</h3>
                    <p style={{ fontSize: "0.9rem", maxWidth: 400 }}>
                        Message content is not stored when tracking is disabled.
                        Enable tracking to start storing and viewing messages.
                    </p>
                    <button className="btn btn-primary" onClick={toggleTracking} disabled={toggling} style={{ marginTop: "1rem" }}>
                        Enable Tracking
                    </button>
                </div>
            ) : messages.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
                    <p style={{ color: "var(--text-muted)" }}>
                        Tracking is on. New messages will appear here.
                    </p>
                </div>
            ) : (
                <div className="card" style={{ padding: "0.5rem" }}>
                    <div className="message-list">
                        {messages.map((m) => (
                            <div key={m.id} className="message-bubble message-inbound">
                                <div>{m.text ?? `[${m.type}]`}</div>
                                <div className="message-time">
                                    {new Date(m.timestamp).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
