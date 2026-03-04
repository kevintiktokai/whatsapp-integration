// app/page.tsx
// Landing / Dashboard page

export default function Home() {
  return (
    <div className="container">
      <div className="page-header">
        <h1>Welcome to WA CRM</h1>
        <p>Connect your WhatsApp number and manage your real estate conversations.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        <a href="/settings/whatsapp" className="card" style={{ textDecoration: "none", color: "inherit" }}>
          <h2 style={{ color: "var(--bg-accent)", marginBottom: "0.5rem" }}>🔗 Connect WhatsApp</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Link your WhatsApp Business number to start receiving messages in the CRM.
          </p>
        </a>

        <a href="/inbox" className="card" style={{ textDecoration: "none", color: "inherit" }}>
          <h2 style={{ color: "var(--bg-accent)", marginBottom: "0.5rem" }}>💬 Inbox</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            View and manage your WhatsApp conversations with tracking controls.
          </p>
        </a>

        <div className="card">
          <h2 style={{ color: "var(--text-muted)", marginBottom: "0.5rem" }}>🤖 AI Assistant</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Coming soon — AI-powered chat summaries, lead scoring, and smart replies.
          </p>
          <span className="badge badge-warning" style={{ marginTop: "0.75rem" }}>Coming Soon</span>
        </div>
      </div>
    </div>
  );
}
