"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Settings, MessageSquare, ShieldCheck, Zap
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { icon: Zap, label: "Overview", href: "/" },
        { icon: MessageSquare, label: "Messages", href: "/inbox" },
        { icon: Settings, label: "WhatsApp Setup", href: "/settings/whatsapp" },
        { icon: ShieldCheck, label: "Security", href: "#" },
    ];

    return (
        <aside className="fixed left-0 top-0 h-full w-20 lg:w-64 bg-white border-r border-zinc-200 flex flex-col z-50">
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200 shrink-0">
                    <MessageSquare className="text-white w-5 h-5" />
                </div>
                <span className="font-bold text-xl tracking-tight hidden lg:block">Hazel</span>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
                {navItems.map((item, i) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={i}
                            href={item.href}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-zinc-500 hover:bg-zinc-100'
                                }`}
                        >
                            <item.icon className="w-5 h-5 shrink-0" />
                            <span className="font-medium hidden lg:block whitespace-nowrap">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
