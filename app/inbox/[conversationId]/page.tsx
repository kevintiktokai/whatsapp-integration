"use client";
// app/inbox/[conversationId]/page.tsx
// Chat thread view with compose box and auto-refresh

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";

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
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <div className="max-w-4xl mx-auto px-4 mt-8 lg:mt-16 flex flex-col h-[calc(100vh-140px)]">
            {/* Header */}
            <div className="pb-6 border-b border-slate-200 flex-shrink-0">
                <Link href="/inbox" className="text-slate-500 hover:text-emerald-600 font-semibold text-sm flex items-center gap-2 mb-3 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Inbox
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                        {waContactId ? waContactId.substring(0, 2) : "?"}
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">{waContactId || "Loading Conversation..."}</h1>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto w-full pt-6 pb-6 px-2 flex flex-col space-y-4">
                {loading ? (
                    <p className="text-slate-500 text-center py-10 font-medium">Loading messages...</p>
                ) : error ? (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-700 text-center">
                        {error}
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                        <p>No messages yet.</p>
                        <p className="text-sm">Send a message to start the conversation!</p>
                    </div>
                ) : (
                    messages.map((m) => {
                        const isOutbound = m.direction === "outbound";
                        return (
                            <div
                                key={m.id}
                                className={`flex flex-col max-w-[75%] px-5 py-3 shadow-sm ${isOutbound
                                        ? "self-end bg-emerald-600 text-white rounded-2xl rounded-tr-md"
                                        : "self-start bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-tl-md"
                                    }`}
                            >
                                <div className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                                    {m.text ?? <span className="italic opacity-80">[{m.type}]</span>}
                                </div>
                                <div className={`text-[11px] mt-1.5 ${isOutbound ? 'text-emerald-100 text-right' : 'text-slate-400 text-left'}`}>
                                    {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Compose Box */}
            <div className="pt-4 border-t border-slate-200 flex-shrink-0 pb-8">
                <div className="bg-white border text-md border-slate-200 rounded-[2rem] p-2 flex items-center shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-1 bg-transparent px-4 py-2 outline-none resize-none max-h-32 text-slate-800 placeholder-slate-400"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim() || sending}
                        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all ${newMessage.trim() && !sending
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            }`}
                    >
                        <Send className="w-5 h-5 ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
}
