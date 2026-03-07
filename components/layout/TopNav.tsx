"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
    const pathname = usePathname();

    return (
        <header className="absolute top-0 w-full z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto left-0 right-0">
            <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-emerald-600 rounded-md flex items-center justify-center transform transition-transform group-hover:rotate-12 shadow-md shadow-emerald-200">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                </div>
                <span className="font-bold text-xl tracking-tight text-emerald-900">synCRM</span>
            </Link>

            <div className="flex items-center gap-4">
                <Link
                    href="/inbox"
                    className={`px-5 py-2 rounded-full border text-sm font-semibold transition-all ${pathname.startsWith('/inbox')
                        ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                        : 'border-emerald-200 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50/50'
                        }`}
                >
                    Inbox
                </Link>
                <Link
                    href="/settings/whatsapp"
                    className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-lg shadow-emerald-200/50 transition-all hover:-translate-y-0.5"
                >
                    WhatsApp Setup
                </Link>
            </div>
        </header>
    );
}
