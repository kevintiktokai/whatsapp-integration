// app/layout.tsx
import type { Metadata } from "next";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhatsApp CRM — Real Estate Agent Dashboard",
  description: "Connect your WhatsApp number and manage conversations with AI assistance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FDFBF7] text-zinc-900 font-sans selection:bg-emerald-100 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-20 lg:ml-64 min-h-screen">
          <Header />
          <main className="p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
