// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhatsApp CRM — Real Estate Agent Dashboard",
  description: "Connect your WhatsApp number and manage conversations with AI assistance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <a href="/" className="nav-logo">📱 WA CRM</a>
          <a href="/inbox" className="nav-link">Inbox</a>
          <a href="/settings/whatsapp" className="nav-link">Connect WhatsApp</a>
        </nav>
        {children}
      </body>
    </html>
  );
}
