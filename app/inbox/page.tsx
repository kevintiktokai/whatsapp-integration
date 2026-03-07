"use client";
// app/inbox/page.tsx
// Conversation list with tracking badges

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, LayoutGrid, ArrowRight } from "lucide-react";

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
        <div className="max-w-[1000px] mx-auto px-4 mt-8 lg:mt-16 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2 truncate">
                        Messages
                    </h1>
                    <p className="text-slate-600">
                        Your WhatsApp conversations flowing directly into Hazel.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <p className="text-slate-500 font-medium animate-pulse">Loading conversations...</p>
                </div>
            ) : conversations.length === 0 ? (
                <div className="bg-white border text-center border-slate-100 rounded-3xl p-12 shadow-sm flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                        <MessageSquare className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-xl font-semibold text-slate-800 mb-2">
                        No conversations yet
                    </p>
                    <p className="text-slate-500 mb-8 max-w-sm">
                        Connect your WhatsApp number and start receiving messages from your clients directly here.
                    </p>
                    <Link href="/settings/whatsapp" className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all shadow-md shadow-emerald-200">
                        Connect WhatsApp
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {conversations.map((c) => (
                        <Link key={c.id} href={`/inbox/${c.id}`} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 text-lg mb-0.5" style={{ fontVariantNumeric: 'tabular-nums' }}>{c.wa_contact_id}</div>
                                    <p className="text-sm text-slate-500">
                                        {c.tracking_mode === "tracked"
                                            ? `${c.message_count} messages logged securely`
                                            : "Tracking off — messages not stored"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 justify-between sm:justify-end pl-16 sm:pl-0">
                                <div className="text-right">
                                    {c.last_message_at && (
                                        <div className="text-xs text-slate-400 font-medium mb-1">
                                            {new Date(c.last_message_at).toLocaleDateString()}
                                        </div>
                                    )}
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.tracking_mode === "tracked" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                                        {c.tracking_mode === "tracked" ? "Active" : "Paused"}
                                    </span>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transform group-hover:translate-x-1 transition-all" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
