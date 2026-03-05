"use client";
// app/settings/whatsapp/page.tsx
// Connect WhatsApp — 3-step flow:
//   1. Facebook Login → access Meta account
//   2. Select number (auto-detected) OR enter manually
//   3. Connected!

import { useState, useEffect } from "react";

type WizardStep = "ready" | "logging_in" | "select_number" | "connecting" | "success" | "error";

interface WhatsAppNumber {
    waba_id: string;
    waba_name: string;
    phone_number_id: string;
    display_phone_number: string;
    verified_name: string;
    quality_rating: string;
}

interface ConnectedAccount {
    id: string;
    wabaId: string;
    phoneNumberId: string;
    displayPhoneNumber: string | null;
    status: string;
    createdAt: string;
}

export default function ConnectWhatsApp() {
    const [step, setStep] = useState<WizardStep>("ready");
    const [error, setError] = useState<string | null>(null);
    const [fbLoaded, setFbLoaded] = useState(false);
    const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);

    // Number selection state
    const [availableNumbers, setAvailableNumbers] = useState<WhatsAppNumber[]>([]);
    const [accessToken, setAccessToken] = useState<string>("");
    const [selectedNumber, setSelectedNumber] = useState<WhatsAppNumber | null>(null);
    const [connecting, setConnecting] = useState(false);

    // Manual entry state
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [manualPhone, setManualPhone] = useState("");
    const [manualWabaId, setManualWabaId] = useState("");
    const [manualPhoneNumberId, setManualPhoneNumberId] = useState("");
    const [manualAccessToken, setManualAccessToken] = useState("");

    // Initialize Facebook SDK
    useEffect(() => {
        (window as any).fbAsyncInit = function () {
            (window as any).FB.init({
                appId: process.env.NEXT_PUBLIC_META_APP_ID || "",
                cookie: true,
                xfbml: true,
                version: "v21.0"
            });
            setFbLoaded(true);
        };

        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s) as HTMLScriptElement;
            js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode!.insertBefore(js, fjs);
        }(document, "script", "facebook-jssdk"));

        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const res = await fetch("/api/wa/connect");
            const data = await res.json();
            if (data.ok) setAccounts(data.accounts);
        } catch { /* silently fail */ }
    };

    // Step 1: Facebook Login
    const handleFacebookLogin = () => {
        if (!fbLoaded || !(window as any).FB) {
            setError("Facebook SDK is still loading. Please try again.");
            setStep("error");
            return;
        }

        setStep("logging_in");
        setError(null);

        (window as any).FB.login((response: any) => {
            if (response.authResponse) {
                const code = response.authResponse.code;
                fetchAvailableNumbers(code);
            } else {
                setStep("ready");
            }
        }, {
            scope: "whatsapp_business_management,whatsapp_business_messaging",
            response_type: "code",
            override_default_response_type: true,
            extras: { setup: {} }
        });
    };

    // Step 2: Fetch available WhatsApp numbers
    const fetchAvailableNumbers = async (code: string) => {
        try {
            const res = await fetch("/api/wa/numbers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            });

            const data = await res.json();

            if (data.ok) {
                setAccessToken(data.access_token);
                if (data.numbers?.length > 0) {
                    setAvailableNumbers(data.numbers);
                    setShowManualEntry(false);
                } else {
                    // No numbers found — show manual entry by default
                    setAvailableNumbers([]);
                    setShowManualEntry(true);
                }
                setStep("select_number");
            } else {
                // Token exchange worked but no WABAs — still allow manual entry
                setAccessToken(data.access_token || "");
                setAvailableNumbers([]);
                setShowManualEntry(true);
                setStep("select_number");
            }
        } catch (err) {
            setError((err as Error).message || "Failed to fetch WhatsApp numbers.");
            setStep("error");
        }
    };

    // Connect a detected number
    const connectNumber = async (number: WhatsAppNumber) => {
        setSelectedNumber(number);
        setConnecting(true);
        setStep("connecting");

        try {
            const res = await fetch("/api/wa/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    access_token: accessToken,
                    phone_number_id: number.phone_number_id,
                    waba_id: number.waba_id,
                }),
            });

            const data = await res.json();
            if (data.ok) {
                setStep("success");
                fetchAccounts();
            } else {
                setError(data.error || "Failed to connect this number.");
                setStep("error");
            }
        } catch (err) {
            setError((err as Error).message || "Connection failed.");
            setStep("error");
        } finally {
            setConnecting(false);
        }
    };

    // Connect a manually entered number
    const connectManualNumber = async () => {
        if (!manualPhoneNumberId || !manualWabaId || !manualAccessToken) {
            setError("Please fill in all required fields.");
            return;
        }

        setSelectedNumber({
            waba_id: manualWabaId,
            waba_name: "Manual",
            phone_number_id: manualPhoneNumberId,
            display_phone_number: manualPhone || manualPhoneNumberId,
            verified_name: "",
            quality_rating: "",
        });
        setConnecting(true);
        setStep("connecting");

        try {
            const res = await fetch("/api/wa/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    access_token: manualAccessToken,
                    phone_number_id: manualPhoneNumberId,
                    waba_id: manualWabaId,
                }),
            });

            const data = await res.json();
            if (data.ok) {
                setStep("success");
                fetchAccounts();
            } else {
                setError(data.error || "Failed to connect this number.");
                setStep("error");
            }
        } catch (err) {
            setError((err as Error).message || "Connection failed.");
            setStep("error");
        } finally {
            setConnecting(false);
        }
    };

    const resetWizard = () => {
        setStep("ready");
        setError(null);
        setAvailableNumbers([]);
        setSelectedNumber(null);
        setAccessToken("");
        setShowManualEntry(false);
        setManualPhone("");
        setManualWabaId("");
        setManualPhoneNumberId("");
        setManualAccessToken("");
    };

    const inputStyle = {
        width: "100%",
        padding: "0.6rem 0.8rem",
        borderRadius: "6px",
        border: "1px solid rgba(255,255,255,0.15)",
        background: "rgba(255,255,255,0.05)",
        color: "var(--text-primary)",
        fontSize: "0.9rem",
        outline: "none",
        fontFamily: "inherit",
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
                                padding: "0.75rem",
                                background: "rgba(37, 211, 102, 0.08)",
                                borderRadius: "8px",
                                marginBottom: "0.5rem",
                                border: "1px solid rgba(37, 211, 102, 0.2)",
                            }}
                        >
                            <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                                {account.displayPhoneNumber || account.phoneNumberId}
                            </span>
                            <span style={{
                                marginLeft: "0.75rem", fontSize: "0.75rem",
                                background: "rgba(37, 211, 102, 0.2)", color: "#25D366",
                                padding: "2px 8px", borderRadius: "4px",
                            }}>
                                {account.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* ─── Step 1: Ready ─── */}
            {step === "ready" && (
                <div className="card" style={{ maxWidth: 600 }}>
                    <h2 style={{ marginBottom: "0.5rem", fontSize: "1.1rem" }}>🔗 Connect Your WhatsApp Number</h2>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                        Log in with Facebook to find your WhatsApp Business numbers automatically.
                    </p>
                    <p style={{ color: "var(--text-muted)", marginBottom: "1.25rem", fontSize: "0.8rem" }}>
                        You can also enter your number details manually if it&apos;s not linked to your Facebook account.
                    </p>

                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                        <button
                            className="btn"
                            style={{
                                backgroundColor: "#1877F2", color: "white", padding: "10px 20px",
                                fontWeight: "bold", border: "none", borderRadius: "5px", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: "8px"
                            }}
                            disabled={!fbLoaded}
                            onClick={handleFacebookLogin}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                                <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
                            </svg>
                            {fbLoaded ? "Auto-detect via Facebook" : "Loading SDK..."}
                        </button>

                        <button
                            className="btn btn-secondary"
                            style={{ padding: "10px 20px" }}
                            onClick={() => { setShowManualEntry(true); setStep("select_number"); }}
                        >
                            Enter Manually
                        </button>
                    </div>
                </div>
            )}

            {/* ─── Logging In ─── */}
            {step === "logging_in" && (
                <div className="card" style={{ maxWidth: 600, textAlign: "center", padding: "2rem" }}>
                    <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>🔄 Connecting to Meta...</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        Please complete the Facebook login in the popup window.
                    </p>
                </div>
            )}

            {/* ─── Step 2: Select Number OR Manual Entry ─── */}
            {step === "select_number" && (
                <div className="card" style={{ maxWidth: 600 }}>
                    <h2 style={{ marginBottom: "0.5rem", fontSize: "1.1rem" }}>📱 Connect a WhatsApp Number</h2>

                    {/* Auto-detected numbers */}
                    {availableNumbers.length > 0 && !showManualEntry && (
                        <>
                            <p style={{ color: "var(--text-secondary)", marginBottom: "1rem", fontSize: "0.9rem" }}>
                                We found {availableNumbers.length} number{availableNumbers.length > 1 ? "s" : ""} on your Meta account. Select one to connect:
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {availableNumbers.map((num) => (
                                    <button
                                        key={num.phone_number_id}
                                        onClick={() => connectNumber(num)}
                                        disabled={connecting}
                                        style={{
                                            display: "flex", alignItems: "center", justifyContent: "space-between",
                                            padding: "1rem 1.25rem", background: "rgba(255,255,255,0.04)",
                                            border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px",
                                            cursor: "pointer", transition: "all 0.2s", textAlign: "left",
                                            color: "inherit", width: "100%",
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.borderColor = "#25D366";
                                            e.currentTarget.style.background = "rgba(37, 211, 102, 0.06)";
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                                            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "0.25rem" }}>
                                                📞 {num.display_phone_number}
                                            </div>
                                            {num.verified_name && (
                                                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{num.verified_name}</div>
                                            )}
                                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                                                WABA: {num.waba_name}
                                            </div>
                                        </div>
                                        <div style={{
                                            padding: "6px 14px", background: "linear-gradient(135deg, #25D366, #128C7E)",
                                            color: "white", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 600, flexShrink: 0,
                                        }}>
                                            Connect
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "1.25rem", paddingTop: "1rem" }}>
                                <button
                                    style={{
                                        background: "none", border: "none", color: "var(--text-muted)",
                                        cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline",
                                    }}
                                    onClick={() => setShowManualEntry(true)}
                                >
                                    My number isn&apos;t listed — enter details manually
                                </button>
                            </div>
                        </>
                    )}

                    {/* Manual Entry Form */}
                    {showManualEntry && (
                        <>
                            <p style={{ color: "var(--text-secondary)", marginBottom: "1.25rem", fontSize: "0.9rem" }}>
                                {availableNumbers.length === 0
                                    ? "No WhatsApp numbers were auto-detected. Please enter your details manually."
                                    : "Enter your WhatsApp Business details below:"}
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                                        WhatsApp Business Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. +1 555 123 4567"
                                        value={manualPhone}
                                        onChange={(e) => setManualPhone(e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                                        Phone Number ID <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>(from Meta Developer Console)</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 1061901597001461"
                                        value={manualPhoneNumberId}
                                        onChange={(e) => setManualPhoneNumberId(e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                                        WABA ID <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>(WhatsApp Business Account ID)</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 1970789736851025"
                                        value={manualWabaId}
                                        onChange={(e) => setManualWabaId(e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                                        Access Token <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>(System User or temporary token)</span>
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Paste your access token here"
                                        value={manualAccessToken}
                                        onChange={(e) => setManualAccessToken(e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>
                                <button
                                    className="btn"
                                    style={{
                                        background: "linear-gradient(135deg, #25D366, #128C7E)",
                                        color: "white", padding: "10px 20px", fontWeight: "bold",
                                        border: "none", borderRadius: "6px", cursor: "pointer", marginTop: "0.5rem",
                                    }}
                                    onClick={connectManualNumber}
                                    disabled={connecting || !manualPhoneNumberId || !manualWabaId || !manualAccessToken}
                                >
                                    Connect This Number
                                </button>
                            </div>

                            {availableNumbers.length > 0 && (
                                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "1.25rem", paddingTop: "1rem" }}>
                                    <button
                                        style={{
                                            background: "none", border: "none", color: "var(--text-muted)",
                                            cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline",
                                        }}
                                        onClick={() => setShowManualEntry(false)}
                                    >
                                        ← Back to auto-detected numbers
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    <button className="btn btn-secondary" onClick={resetWizard} style={{ marginTop: "1.25rem" }}>
                        ← Start Over
                    </button>
                </div>
            )}

            {/* ─── Connecting ─── */}
            {step === "connecting" && selectedNumber && (
                <div className="card" style={{ maxWidth: 600, textAlign: "center", padding: "2rem" }}>
                    <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>🔄 Connecting {selectedNumber.display_phone_number}...</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        Subscribing to webhooks and saving credentials...
                    </p>
                </div>
            )}

            {/* ─── Success ─── */}
            {step === "success" && (
                <div className="card" style={{ maxWidth: 600, borderColor: "rgba(37, 211, 102, 0.4)" }}>
                    <h2 style={{ color: "#25D366", marginBottom: "0.5rem" }}>✅ WhatsApp Connected!</h2>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "1rem", fontSize: "0.9rem" }}>
                        {selectedNumber?.display_phone_number} is now linked. New conversations will appear in your Inbox.
                    </p>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                        <a href="/inbox" className="btn btn-primary">Go to Inbox →</a>
                        <button className="btn btn-secondary" onClick={resetWizard}>Connect Another Number</button>
                    </div>
                </div>
            )}

            {/* ─── Error ─── */}
            {step === "error" && error && (
                <div style={{ maxWidth: 600 }}>
                    <div className="error-card" style={{ marginBottom: "1rem" }}>
                        <h3>Connection Failed</h3>
                        <p>{error}</p>
                    </div>
                    <button className="btn btn-secondary" onClick={resetWizard}>Start Over</button>
                </div>
            )}
        </div>
    );
}
