"use client";
// app/inbox/[conversationId]/page.tsx
// Chat thread view with compose box and auto-refresh

import { useEffect, useState, useRef } from "react";
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

    const [messages, setMessages] = useState<Message[]>([]);
    const [waContactId, setWaContactId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/wa/conversations/${conversationId}/messages`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages ?? []);
                setWaContactId(data.wa_contact_id ?? "");
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
        // Auto-refresh every 5 seconds
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const res = await fetch("/api/wa/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversation_id: conversationId,
                    message: newMessage.trim(),
                }),
            });

            const data = await res.json();

            if (data.ok) {
                setNewMessage("");
                // Immediately add the sent message to the UI
                setMessages((prev) => [
                    ...prev,
                    {
                        id: data.message_id,
                        direction: "outbound",
                        type: "text",
                        text: newMessage.trim(),
                        timestamp: new Date().toISOString(),
                        meta_message_id: data.meta_message_id,
                    },
                ]);
            } else {
                setError(data.error || "Failed to send message");
            }
        } catch {
            setError("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="container" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 80px)" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexShrink: 0 }}>
                <div>
                    <a href="/inbox" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem" }}>
                        ← Back to Inbox
                    </a>
                    <h1 style={{ fontSize: "1.3rem", marginTop: "0.5rem" }}>💬 {waContactId || "Conversation"}</h1>
                </div>
            </div>

            {/* Messages Area */}
            <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "1rem",
                background: "rgba(0,0,0,0.15)",
                borderRadius: "12px 12px 0 0",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
            }}>
                {loading ? (
                    <p style={{ color: "var(--text-muted)", textAlign: "center" }}>Loading messages...</p>
                ) : error ? (
                    <div className="error-card">
                        <h3>Error</h3>
                        <p>{error}</p>
                    </div>
                ) : messages.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "2rem" }}>
                        No messages yet. Send a message to start the conversation!
                    </p>
                ) : (
                    messages.map((m) => (
                        <div
                            key={m.id}
                            style={{
                                alignSelf: m.direction === "outbound" ? "flex-end" : "flex-start",
                                maxWidth: "70%",
                                padding: "0.65rem 1rem",
                                borderRadius: m.direction === "outbound"
                                    ? "16px 16px 4px 16px"
                                    : "16px 16px 16px 4px",
                                background: m.direction === "outbound"
                                    ? "linear-gradient(135deg, #25D366, #128C7E)"
                                    : "rgba(255,255,255,0.08)",
                                color: m.direction === "outbound" ? "white" : "var(--text-primary)",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                            }}
                        >
                            <div style={{ fontSize: "0.9rem", wordBreak: "break-word" }}>
                                {m.text ?? `[${m.type}]`}
                            </div>
                            <div style={{
                                fontSize: "0.7rem",
                                opacity: 0.6,
                                marginTop: "0.25rem",
                                textAlign: m.direction === "outbound" ? "right" : "left",
                            }}>
                                {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Compose Box */}
            <div style={{
                display: "flex",
                gap: "0.5rem",
                padding: "0.75rem 1rem",
                background: "rgba(0,0,0,0.2)",
                borderRadius: "0 0 12px 12px",
                flexShrink: 0,
            }}>
                <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    style={{
                        flex: 1,
                        padding: "0.65rem 1rem",
                        borderRadius: "20px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.05)",
                        color: "var(--text-primary)",
                        fontSize: "0.9rem",
                        resize: "none",
                        outline: "none",
                        fontFamily: "inherit",
                    }}
                />
                <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    style={{
                        padding: "0.65rem 1.25rem",
                        borderRadius: "20px",
                        border: "none",
                        background: newMessage.trim() ? "linear-gradient(135deg, #25D366, #128C7E)" : "rgba(255,255,255,0.1)",
                        color: "white",
                        cursor: newMessage.trim() ? "pointer" : "default",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        transition: "all 0.2s",
                        opacity: sending ? 0.6 : 1,
                    }}
                >
                    {sending ? "..." : "Send"}
                </button>
            </div>
        </div>
    );
}
