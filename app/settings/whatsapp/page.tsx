"use client";
import React, { useState, useEffect } from 'react';
import { RefreshCw, Copy, CheckCircle2, AlertCircle } from 'lucide-react';

type WizardStep = "ready" | "logging_in" | "connecting" | "success" | "error";

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

    const handleFacebookLogin = () => {
        if (!fbLoaded || !(window as any).FB) {
            setError("Facebook SDK is still loading.");
            setStep("error");
            return;
        }

        setStep("logging_in");
        setError(null);

        const configId = process.env.NEXT_PUBLIC_META_CONFIG_ID;

        const loginOptions: any = {
            response_type: "code",
            override_default_response_type: true,
            extras: { setup: {} }
        };

        if (configId) {
            loginOptions.config_id = configId;
        } else {
            loginOptions.scope = "whatsapp_business_management,whatsapp_business_messaging";
        }

        (window as any).FB.login((response: any) => {
            if (response.authResponse) {
                const code = response.authResponse.code;
                finalizeEmbeddedSignup(code);
            } else {
                setStep("ready");
            }
        }, loginOptions);
    };

    const finalizeEmbeddedSignup = async (code: string) => {
        setStep("connecting");
        try {
            const res = await fetch("/api/wa/onboarding/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            });

            const data = await res.json();
            if (data.ok) {
                setStep("success");
                fetchAccounts();
            } else {
                setError(data.error || "Failed to complete connection automatically.");
                setStep("error");
            }
        } catch (err) {
            setError((err as Error).message || "Connection failed.");
            setStep("error");
        }
    };

    const connectedAccount = accounts.length > 0 ? accounts[0] : null;
    const isConnected = !!connectedAccount;
    const isWorking = step === "logging_in" || step === "connecting";

    const displayedNumber = connectedAccount?.displayPhoneNumber || "+1 (555) 000-1234";
    const displayedWaba = connectedAccount?.wabaId || "88273641...";
    const displayedPhoneId = connectedAccount?.phoneNumberId || "10928374...";

    return (
        <div className="max-w-[1000px] mx-auto px-4 mt-8 lg:mt-16">
            <div className="text-center mb-16">
                <h1 className="text-4xl lg:text-5xl font-medium text-slate-900 mb-6 tracking-tight">
                    WhatsApp <span className="text-emerald-600 font-bold">Integration</span>
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Connect your WhatsApp Business account securely through Meta to start managing client conversations directly in synCRM.
                </p>
            </div>

            <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
                {/* Decorative background shapes mimicking the homepage aesthetic */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full mix-blend-multiply blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-50 rounded-full mix-blend-multiply blur-3xl opacity-60 translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left: Connection Status */}
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold mb-6">
                            {isConnected ? (
                                <><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Connected</>
                            ) : (
                                <><span className="w-2 h-2 rounded-full bg-slate-400"></span> Disconnected</>
                            )}
                        </div>

                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                            {isConnected ? "Your account is live." : "Link your account."}
                        </h2>

                        <p className="text-slate-600 mb-8 leading-relaxed">
                            {isConnected
                                ? `You are currently connected as ${displayedNumber}. synCRM is securely routing your WhatsApp messages.`
                                : "Click the button below to launch Meta's secure Embedded Signup flow. It only takes a minute to link your number."}
                        </p>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleFacebookLogin}
                            disabled={isWorking || !fbLoaded}
                            className={`px-8 py-4 rounded-full font-semibold text-white shadow-xl flex items-center justify-center gap-3 transition-all ${isWorking ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-105 shadow-emerald-200/50'
                                }`}
                        >
                            {isWorking && <RefreshCw className="w-5 h-5 animate-spin" />}
                            {isWorking ? "Connecting to Meta..." : (isConnected ? "Reconnect Account" : "Connect via Facebook")}
                        </button>
                    </div>

                    {/* Right: Technical Details (Only visible if connected or showing placeholders) */}
                    <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100/50 backdrop-blur-sm">
                        <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            Connection Details
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">WhatsApp Business ID</label>
                                <div className="font-mono text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                                    {isConnected ? displayedWaba : "—"}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Phone Number ID</label>
                                <div className="font-mono text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                                    {isConnected ? displayedPhoneId : "—"}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Webhook Callback URL</label>
                                <div className="flex bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    <div className="font-mono text-xs text-slate-500 p-3 overflow-x-auto whitespace-nowrap align-middle">
                                        https://whatsapp-integration-hazel.vercel.app/api/webhooks/whatsapp
                                    </div>
                                    <button
                                        className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors border-l border-slate-200 flex items-center justify-center"
                                        onClick={() => navigator.clipboard.writeText('https://whatsapp-integration-hazel.vercel.app/api/webhooks/whatsapp')}
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
