"use client";
// app/settings/whatsapp/page.tsx
// Connect WhatsApp — Embedded Signup Wizard (Manychat style)

import { useState, useEffect } from "react";

type WizardStep = "readiness" | "connecting" | "success" | "error";

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
}

export default function ConnectWhatsApp() {
    const [step, setStep] = useState<WizardStep>("readiness");
    const [status, setStatus] = useState<string>("");
    const [error, setError] = useState<ConnectError | null>(null);
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
    const [fbLoaded, setFbLoaded] = useState(false);

    // Initialize Facebook SDK
    useEffect(() => {
        // Load Facebook SDK asynchronously
        (window as any).fbAsyncInit = function () {
            (window as any).FB.init({
                appId: process.env.NEXT_PUBLIC_META_APP_ID || "YOUR_META_APP_ID", // TODO: Replace with Real App ID
                cookie: true,
                xfbml: true,
                version: "v21.0"
            });
            setFbLoaded(true);
        };

        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s) as HTMLScriptElement; js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode!.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

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
            // Silently fail
        }
    };

    const handleFacebookLogin = () => {
        if (!fbLoaded || !(window as any).FB) {
            setError({ message: "Facebook SDK is still loading. Please try again in a moment." });
            setStep("error");
            return;
        }

        setLoading(true);
        setStep("connecting");
        setStatus("Opening Facebook Login...");

        (window as any).FB.login((response: any) => {
            if (response.authResponse) {
                // User authorized the app. The response has the OAuth code.
                const code = response.authResponse.code;

                // Meta returns waba_id and phone_number_id in a different payload structure through the setup flow,
                // but the standard approach is to pass the code to the backend to exchange for a token.
                // We'll call a hypothetical endpoint that handles the OAuth exchange.
                // NOTE: Embedded Signup JS SDK might return a feature_status that includes the WABA ID.
                completeEmbeddedSignup(code);
            } else {
                setLoading(false);
                setStep("readiness"); // User cancelled login or didn't fully authorize.
            }
        }, {
            config_id: "OPTIONAL_EMBEDDED_SIGNUP_CONFIG_ID", // Required for complete embedded signup config
            response_type: "code",
            override_default_response_type: true,
            extras: {
                setup: {
                    // Pre-filling setup data if needed
                }
            }
        });
    };

    const completeEmbeddedSignup = async (code: string) => {
        setStatus("Exchanging access token and setting up webhooks...");

        try {
            // We call the complete route. Note: The actual Meta JS response might contain waba_id/phone_number_id immediately.
            // If it does, we pass it here. For now, we simulate sending the OAuth code to exchange.
            const res = await fetch("/api/wa/onboarding/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: code,
                    state: "session_state", // If you had a session start route tracking state
                    waba_id: "extract_from_fb_response_somehow",
                    phone_number_id: "extract_from_fb_response_somehow"
                }),
            });

            const data = await res.json();

            if (data.ok) {
                setStatus("Connected!");
                setStep("success");
                fetchAccounts();
            } else {
                setError({
                    message: data.error || "Connection failed during account linking.",
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
                                justifyItems: "space-between",
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
                        </div>
                    ))}
                </div>
            )}

            {/* ─── Step 1: Add via Facebook ─── */}
            {step === "readiness" && (
                <div className="card" style={{ maxWidth: 600 }}>
                    <h2 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>🔗 Connect Your Number</h2>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "1.25rem", fontSize: "0.9rem" }}>
                        Click the button below to connect a WhatsApp number using Facebook's official Embedded Signup. You will log in securely with Facebook.
                    </p>

                    <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
                        {/* Facebook Blue Button */}
                        <button
                            className="btn"
                            style={{ backgroundColor: "#1877F2", color: "white", padding: "10px 20px", fontWeight: "bold", border: "none", borderRadius: "5px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                            disabled={loading || !fbLoaded}
                            onClick={handleFacebookLogin}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                                <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
                            </svg>
                            {fbLoaded ? "Connect with Facebook" : "Loading SDK..."}
                        </button>
                    </div>
                </div>
            )}

            {/* ─── Step 2: Connecting Wrapper ─── */}
            {step === "connecting" && (
                <div className="card" style={{ maxWidth: 600 }}>
                    <h2 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>🔄 Connecting...</h2>
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
                    </p>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                        <a href="/inbox" className="btn btn-primary">Go to Inbox →</a>
                        <button className="btn btn-secondary" onClick={resetWizard}>
                            Connect Another Number
                        </button>
                    </div>
                </div>
            )}

            {/* ─── Step 4: Error ─── */}
            {step === "error" && error && (
                <div style={{ maxWidth: 600 }}>
                    <div className="error-card" style={{ marginBottom: "1rem" }}>
                        <h3>Connection Failed</h3>
                        <p>{error.message}</p>
                    </div>

                    <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button className="btn btn-secondary" onClick={resetWizard}>
                            Start Over
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
