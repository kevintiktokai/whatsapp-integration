"use client";
// app/settings/whatsapp/page.tsx
// Connect WhatsApp — Direct Token Connection + Readiness Checklist

import { useState, useEffect } from "react";

type WizardStep = "readiness" | "connect" | "connecting" | "success" | "error";

interface ConnectedAccount {
    id: string;
    wabaId: string;
    phoneNumberId: string;
    displayPhoneNumber: string | null;
    status: string;
    createdAt: string;
}

interface ConnectError {
    message: string;
    meta_error?: Record<string, unknown>;
}

export default function ConnectWhatsApp() {
    const [step, setStep] = useState<WizardStep>("readiness");
    const [checks, setChecks] = useState({
        businessApp: false,
        pinReady: false,
        metaBusiness: false,
        notConnected: false,
    });
    const [formData, setFormData] = useState({
        access_token: "",
        phone_number_id: "",
        waba_id: "",
    });
    const [status, setStatus] = useState<string>("");
    const [error, setError] = useState<ConnectError | null>(null);
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);

    const allChecked = Object.values(checks).every(Boolean);

    const toggleCheck = (key: keyof typeof checks) => {
        setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    // Load existing accounts on mount
    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const res = await fetch("/api/wa/connect");
            const data = await res.json();
            if (data.ok) {
                setAccounts(data.accounts);
            }
        } catch {
            // Silently fail — accounts list is optional
        }
    };

    const handleConnect = async () => {
        if (!formData.access_token || !formData.phone_number_id || !formData.waba_id) {
            setError({ message: "Please fill in all fields." });
            setStep("error");
            return;
        }

        setLoading(true);
        setStep("connecting");
        setStatus("Validating credentials with Meta...");

        try {
            const res = await fetch("/api/wa/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.ok) {
                setStatus("Connected!");
                setStep("success");
                fetchAccounts(); // Refresh the accounts list
            } else {
                setError({
                    message: data.error || "Connection failed",
                    meta_error: data.meta_error,
                });
                setStep("error");
            }
        } catch (err) {
            setError({
                message: (err as Error).message || "An unexpected error occurred.",
            });
            setStep("error");
        } finally {
            setLoading(false);
        }
    };

    const resetWizard = () => {
        setStep("readiness");
        setChecks({ businessApp: false, pinReady: false, metaBusiness: false, notConnected: false });
        setFormData({ access_token: "", phone_number_id: "", waba_id: "" });
        setError(null);
        setStatus("");
    };

    return (
        <div className="container">
            <div className="page-header">
                <h1>Connect WhatsApp</h1>
                <p>Link your WhatsApp Business number to start receiving messages.</p>
            </div>

            {/* ─── Connected Accounts ─── */}
            {accounts.length > 0 && (
                <div className="card" style={{ marginBottom: "1.5rem" }}>
                    <h2 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>📱 Connected Numbers</h2>
                    {accounts.map((account) => (
                        <div
                            key={account.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "0.75rem",
                                background: "rgba(37, 211, 102, 0.08)",
                                borderRadius: "8px",
                                marginBottom: "0.5rem",
                                border: "1px solid rgba(37, 211, 102, 0.2)",
                            }}
                        >
                            <div>
                                <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                                    {account.displayPhoneNumber || account.phoneNumberId}
                                </span>
                                <span
                                    style={{
                                        marginLeft: "0.75rem",
                                        fontSize: "0.75rem",
                                        background: "rgba(37, 211, 102, 0.2)",
                                        color: "#25D366",
                                        padding: "2px 8px",
                                        borderRadius: "4px",
                                    }}
                                >
                                    {account.status}
                                </span>
                            </div>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                WABA: {account.wabaId}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* ─── Step 1: Readiness Check ─── */}
            {step === "readiness" && (
                <div className="card" style={{ maxWidth: 600 }}>
                    <h2 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>✅ Before we connect</h2>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "1.25rem", fontSize: "0.9rem" }}>
                        Please confirm the following to ensure a smooth connection:
                    </p>

                    <ul className="checklist">
                        {[
                            { key: "businessApp" as const, label: "I'm using WhatsApp Business App (not personal WhatsApp)" },
                            { key: "pinReady" as const, label: "I have my Meta access token ready" },
                            { key: "metaBusiness" as const, label: "I have a Meta Business account set up" },
                            { key: "notConnected" as const, label: "This number is not connected to another API provider" },
                        ].map(({ key, label }) => (
                            <li
                                key={key}
                                className={`checklist-item ${checks[key] ? "checked" : ""}`}
                                onClick={() => toggleCheck(key)}
                            >
                                <div className="checklist-checkbox">
                                    {checks[key] && <span style={{ color: "#fff", fontSize: "0.8rem" }}>✓</span>}
                                </div>
                                <span style={{ fontSize: "0.9rem" }}>{label}</span>
                            </li>
                        ))}
                    </ul>

                    <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
                        <button className="btn btn-primary" disabled={!allChecked} onClick={() => setStep("connect")}>
                            Continue →
                        </button>
                    </div>

                    {!allChecked && (
                        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.75rem" }}>
                            Please confirm all items above to proceed.
                        </p>
                    )}
                </div>
            )}

            {/* ─── Step 2: Enter Credentials ─── */}
            {step === "connect" && (
                <div className="card" style={{ maxWidth: 600 }}>
                    <h2 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>🔗 Connect Your WhatsApp Number</h2>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "1.25rem", fontSize: "0.9rem" }}>
                        Enter your Meta WhatsApp Business API credentials below. You can find these in your{" "}
                        <a
                            href="https://developers.facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--bg-accent)" }}
                        >
                            Meta Developer Console
                        </a>.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                            <label
                                htmlFor="waba_id"
                                style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}
                            >
                                WhatsApp Business Account ID
                            </label>
                            <input
                                id="waba_id"
                                type="text"
                                placeholder="e.g. 1970789736851025"
                                value={formData.waba_id}
                                onChange={(e) => setFormData((prev) => ({ ...prev, waba_id: e.target.value }))}
                                style={{
                                    width: "100%",
                                    padding: "0.6rem 0.75rem",
                                    background: "var(--bg-secondary)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "6px",
                                    color: "var(--text-primary)",
                                    fontSize: "0.9rem",
                                }}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="phone_number_id"
                                style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}
                            >
                                Phone Number ID
                            </label>
                            <input
                                id="phone_number_id"
                                type="text"
                                placeholder="e.g. 1061901597001461"
                                value={formData.phone_number_id}
                                onChange={(e) => setFormData((prev) => ({ ...prev, phone_number_id: e.target.value }))}
                                style={{
                                    width: "100%",
                                    padding: "0.6rem 0.75rem",
                                    background: "var(--bg-secondary)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "6px",
                                    color: "var(--text-primary)",
                                    fontSize: "0.9rem",
                                }}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="access_token"
                                style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.35rem" }}
                            >
                                Access Token
                            </label>
                            <textarea
                                id="access_token"
                                placeholder="Paste your Meta access token here..."
                                value={formData.access_token}
                                onChange={(e) => setFormData((prev) => ({ ...prev, access_token: e.target.value }))}
                                rows={3}
                                style={{
                                    width: "100%",
                                    padding: "0.6rem 0.75rem",
                                    background: "var(--bg-secondary)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "6px",
                                    color: "var(--text-primary)",
                                    fontSize: "0.9rem",
                                    resize: "vertical",
                                    fontFamily: "monospace",
                                }}
                            />
                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                                Your token is encrypted and stored securely. It will not be exposed after connection.
                            </p>
                        </div>
                    </div>

                    <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
                        <button className="btn btn-primary" disabled={loading} onClick={handleConnect}>
                            🔗 Connect WhatsApp
                        </button>
                        <button className="btn btn-secondary" onClick={() => setStep("readiness")}>
                            ← Back
                        </button>
                    </div>
                </div>
            )}

            {/* ─── Step 3: Connecting ─── */}
            {step === "connecting" && (
                <div className="card" style={{ maxWidth: 600 }}>
                    <h2 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>🔄 Connecting...</h2>
                    <div className="steps">
                        <div className={`step ${status.includes("Validating") ? "step-active" : "step-done"}`}>
                            ● Validating credentials with Meta
                        </div>
                        <div className={`step ${status.includes("Subscribing") ? "step-active" : status.includes("Connected") ? "step-done" : "step-pending"}`}>
                            ● Subscribing to webhooks
                        </div>
                        <div className={`step ${status.includes("Connected") ? "step-done" : "step-pending"}`}>
                            ● Saving account
                        </div>
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "1rem" }}>
                        {status}
                    </p>
                </div>
            )}

            {/* ─── Step 4: Success ─── */}
            {step === "success" && (
                <div className="card" style={{ maxWidth: 600, borderColor: "rgba(37, 211, 102, 0.4)" }}>
                    <h2 style={{ color: "var(--bg-accent)", marginBottom: "0.5rem" }}>✅ WhatsApp Connected!</h2>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "1rem", fontSize: "0.9rem" }}>
                        Your number is now linked. New conversations will appear in your Inbox.
                        Tracking is <strong>OFF by default</strong> — enable it per conversation to store messages.
                    </p>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                        <a href="/inbox" className="btn btn-primary">Go to Inbox →</a>
                        <button className="btn btn-secondary" onClick={resetWizard}>
                            Connect Another Number
                        </button>
                    </div>
                </div>
            )}

            {/* ─── Step 5: Error ─── */}
            {step === "error" && error && (
                <div style={{ maxWidth: 600 }}>
                    <div className="error-card" style={{ marginBottom: "1rem" }}>
                        <h3>Connection Failed</h3>
                        <p>{error.message}</p>
                        {error.meta_error && (
                            <pre style={{ fontSize: "0.75rem", marginTop: "0.5rem", opacity: 0.7, whiteSpace: "pre-wrap" }}>
                                {JSON.stringify(error.meta_error, null, 2)}
                            </pre>
                        )}
                    </div>

                    <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button className="btn btn-secondary" onClick={() => setStep("connect")}>
                            ← Edit Credentials
                        </button>
                        <button className="btn btn-secondary" onClick={resetWizard}>
                            Start Over
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
