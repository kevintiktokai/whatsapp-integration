// app/layout.tsx
import type { Metadata } from "next";
import TopNav from "@/components/layout/TopNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhatsApp CRM — Real Estate Agent Dashboard",
  description: "Connect your WhatsApp number and manage conversations with AI assistance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* We apply a very subtle patterned background in globals.css, and keep text dark */}
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-yellow-200 selection:text-emerald-900 relative">
        <div className="fixed inset-0 z-[-1] pointer-events-none opacity-40"
          style={{
            backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(16, 185, 129, 0.08), transparent 25%), radial-gradient(circle at 85% 30%, rgba(234, 179, 8, 0.08), transparent 25%)'
          }}
        />
        <TopNav />
        <main className="pt-28 pb-12 w-full flex-grow">
          {children}
        </main>

        <footer className="w-full border-t border-slate-200 bg-white/50 backdrop-blur-sm py-6 mt-auto">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} LayerSyncAI. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="/privacy" className="hover:text-emerald-600 transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-emerald-600 transition-colors">Terms of Service</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
