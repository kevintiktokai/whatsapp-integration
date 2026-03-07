"use client";

import { usePathname } from "next/navigation";
import { Bell } from 'lucide-react';

export default function Header() {
    const pathname = usePathname();

    // Create a simple breadcrumb from the pathname
    const paths = pathname.split('/').filter(Boolean);

    return (
        <header className="h-16 border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-zinc-500 capitalize">
                {paths.length === 0 ? (
                    <span className="text-zinc-900 font-medium">Overview</span>
                ) : (
                    paths.map((p, i) => (
                        <span key={i} className="flex items-center gap-2">
                            <span className={i === paths.length - 1 ? "text-zinc-900 font-medium" : ""}>
                                {p.replace('-', ' ')}
                            </span>
                            {i < paths.length - 1 && <span>/</span>}
                        </span>
                    ))
                )}
            </div>
            <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500">
                    <Bell size={20} />
                </button>
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500" />
            </div>
        </header>
    );
}
