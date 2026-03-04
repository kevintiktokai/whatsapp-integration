"use client";
// app/settings/whatsapp/page.tsx
// Connect WhatsApp — Assisted Onboarding Wizard

import { useState } from "react";

type WizardStep = "readiness" | "connecting" | "success" | "error";

interface OnboardingError {
    class: string;
    display_title: string;
    display_body: string;
    user_action: string;
}

export default function ConnectWhatsApp() {
    const [step, setStep] = useState<WizardStep>("readiness");
    const [checks, setChecks] = useState({
        businessApp: false,
        pinReady: false,
        metaBusiness: false,
        notConnected: false,
    });
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [status, setStatus] = useState<string>("");
    const [error, setError] = useState<OnboardingError | null>(null);
    const [loading, setLoading] = useState(false);

    const allChecked = Object.values(checks).every(Boolean);

    const toggleCheck = (key: keyof typeof checks) => {
        setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const startConnect = async () => {
        setLoading(true);
        setStep("connecting");
        setStatus("Initializing...");

        try {
            // Step 1: Start onboarding
            const startRes = await fetch("/api/wa/onboarding/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mode_requested: "coexistence" }),
            });
            const startData = await startRes.json();
            setSessionId(startData.session_id);
            setStatus("Session created — launching Embedded Signup...");

            // Step 2: Simulate Embedded Signup completion (stubbed)
            // In production, this opens Meta's Embedded Signup window.
            // For now, we auto-complete by calling /complete with stub data.
            await new Promise((r) => setTimeout(r, 1500));
            setStatus("Exchanging token...");

            const completeRes = await fetch("/api/wa/onboarding/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    state: startData.state,
                    waba_id: "STUB_WABA_" + Date.now(),
                    phone_number_id: "STUB_PHONE_" + Date.now(),
                    code: "STUB_CODE_" + Date.now(),
                }),
            });
            const completeData = await completeRes.json();

            if (completeData.ok) {
                setStatus(completeData.status);
                setStep("success");
            } else {
                setError(completeData.error);
                setStep("error");
            }
        } catch (err) {
            setError({
                class: "UNKNOWN",
                display_title: "Connection failed",
                display_body: (err as Error).message || "An unexpected error occurred.",
                user_action: "RETRY",
            });
            setStep("error");
        } finally {
            setLoading(false);
        }
    };

    const handleFallback = async () => {
        if (!sessionId) return;
        setLoading(true);
        setStep("connecting");
        setStatus("Switching to API-only...");

        try {
            const fallbackRes = await fetch("/api/wa/onboarding/fallback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id: sessionId }),
            });
            const fallbackData = await fallbackRes.json();
            setSessionId(fallbackData.session_id);

            await new Promise((r) => setTimeout(r, 1000));
            setStatus("Completing API-only connection...");

            const completeRes = await fetch("/api/wa/onboarding/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    state: fallbackData.state,
                    waba_id: "STUB_WABA_FALLBACK_" + Date.now(),
                    phone_number_id: "STUB_PHONE_FALLBACK_" + Date.now(),
                    code: "STUB_CODE_FALLBACK_" + Date.now(),
                }),
            });
            const completeData = await completeRes.json();

            if (completeData.ok) {
                setStatus(completeData.status);
                setStep("success");
            } else {
                setError(completeData.error);
                setStep("error");
            }
        } catch (err) {
            setError({
                class: "UNKNOWN",
                display_title: "Fallback failed",
                display_body: (err as Error).message || "An unexpected error occurred.",
                user_action: "CONTACT_SUPPORT",
            });
            setStep("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="page-header">
                <h1>Connect WhatsApp</h1>
                <p>Link your WhatsApp Business number to start receiving messages.</p>
            </div>

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
                            { key: "pinReady" as const, label: "I know my 6-digit WhatsApp Manager PIN" },
                            { key: "metaBusiness" as const, label: "I have a Meta Business account (or will create one)" },
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
                        <button className="btn btn-primary" disabled={!allChecked || loading} onClick={startConnect}>
                            🔗 Connect WhatsApp
                        </button>
                    </div>

                    {!allChecked && (
                        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.75rem" }}>
                            Please confirm all items above to proceed.
                        </p>
                    )}
                </div>
            )}

            {/* ─── Step 2: Connecting ─── */}
            {step === "connecting" && (
                <div className="card" style={{ maxWidth: 600 }}>
                    <h2 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>🔄 Connecting...</h2>
                    <div className="steps">
                        <div className={`step ${status.includes("Initializing") ? "step-active" : "step-done"}`}>
                            ● Initializing session
                        </div>
                        <div className={`step ${status.includes("launching") || status.includes("Embedded") ? "step-active" : status.includes("Exchanging") || status.includes("Completing") || status.includes("connected") ? "step-done" : "step-pending"}`}>
                            ● Launching Embedded Signup
                        </div>
                        <div className={`step ${status.includes("Exchanging") ? "step-active" : status.includes("connected") ? "step-done" : "step-pending"}`}>
                            ● Exchanging token
                        </div>
                        <div className={`step ${status.includes("connected") ? "step-done" : "step-pending"}`}>
                            ● Subscribing webhooks
                        </div>
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "1rem" }}>
                        {status}
                    </p>
                </div>
            )}

            {/* ─── Step 3: Success ─── */}
            {step === "success" && (
                <div className="card" style={{ maxWidth: 600, borderColor: "rgba(37, 211, 102, 0.4)" }}>
                    <h2 style={{ color: "var(--bg-accent)", marginBottom: "0.5rem" }}>✅ WhatsApp Connected!</h2>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "1rem", fontSize: "0.9rem" }}>
                        Your number is now linked. New conversations will appear in your Inbox.
                        Tracking is <strong>OFF by default</strong> — enable it per conversation to store messages.
                    </p>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                        <a href="/inbox" className="btn btn-primary">Go to Inbox →</a>
                        <button className="btn btn-secondary" onClick={() => { setStep("readiness"); setChecks({ businessApp: false, pinReady: false, metaBusiness: false, notConnected: false }); }}>
                            Connect Another Number
                        </button>
                    </div>
                </div>
            )}

            {/* ─── Step 4: Error ─── */}
            {step === "error" && error && (
                <div style={{ maxWidth: 600 }}>
                    <div className="error-card" style={{ marginBottom: "1rem" }}>
                        <h3>{error.display_title}</h3>
                        <p>{error.display_body}</p>
                        <span className="badge badge-off" style={{ marginTop: "0.75rem" }}>{error.class}</span>
                    </div>

                    <div style={{ display: "flex", gap: "0.75rem" }}>
                        {(error.user_action === "RETRY" || error.user_action === "FIX_AND_RETRY") && (
                            <button className="btn btn-secondary" onClick={() => { setStep("readiness"); setError(null); }}>
                                ← Try Again
                            </button>
                        )}
                        {error.user_action === "FALLBACK_API_ONLY" && (
                            <button className="btn btn-primary" onClick={handleFallback} disabled={loading}>
                                Use API-only Connection Instead
                            </button>
                        )}
                        {error.user_action === "CONTACT_SUPPORT" && (
                            <a href="mailto:support@example.com" className="btn btn-secondary">
                                Contact Support
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
