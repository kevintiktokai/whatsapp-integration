"use client";
import React, { useState, useEffect } from 'react';
import {
    MessageSquare, RefreshCw, Eye, Copy, Phone
} from 'lucide-react';

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

    // Preview state
    const [welcomeMsg, setWelcomeMsg] = useState("Hello! Welcome to our service. How can we help you today?");
    const [showToken, setShowToken] = useState(false);

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
        <div>
            {/* 3. STATUS HERO */}
            <section className="mb-8 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isConnected ? 'bg-emerald-100' : 'bg-zinc-100'}`}>
                            <Phone className={`${isConnected ? 'text-emerald-600' : 'text-zinc-400'} w-6 h-6`} />
                        </div>
                        {isConnected && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">WhatsApp Business API</h1>
                        <p className="text-zinc-500 text-sm">
                            {isConnected ? (
                                <>Connected as <span className="font-mono text-emerald-600">{displayedNumber}</span></>
                            ) : (
                                "Not currently connected"
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {error && (
                        <div className="text-red-500 text-sm flex items-center">{error}</div>
                    )}
                    {step === "success" && (
                        <div className="text-emerald-500 text-sm font-medium flex items-center px-3">Connection successful!</div>
                    )}
                    <button
                        onClick={handleFacebookLogin}
                        disabled={isWorking || !fbLoaded}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all shadow-md flex items-center gap-2 ${isWorking ? 'bg-zinc-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
                            }`}
                    >
                        <RefreshCw size={16} className={isWorking ? "animate-spin" : ""} />
                        {isWorking ? "Connecting..." : (isConnected ? "Reconnect Account" : "Connect via Facebook")}
                    </button>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* 4. CONFIGURATION COLUMN */}
                <div className="lg:col-span-7 space-y-6">

                    {/* API Credentials Card */}
                    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                            <h3 className="font-semibold text-zinc-900">API Credentials</h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Temporary Access Token</label>
                                <div className="relative">
                                    <input
                                        type={showToken ? "text" : "password"}
                                        value={isConnected ? "EAAl7ZA7ZC8... (Managed securely on server)" : ""}
                                        readOnly
                                        placeholder="Connect account to view"
                                        className="w-full p-3 pr-24 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-mono text-sm"
                                    />
                                    <div className="absolute right-2 top-1.5 flex gap-1">
                                        <button onClick={() => setShowToken(!showToken)} className="p-1.5 hover:bg-zinc-200 rounded-md text-zinc-500 transition-colors"><Eye size={16} /></button>
                                        <button className="p-1.5 hover:bg-zinc-200 rounded-md text-zinc-500 transition-colors"><Copy size={16} /></button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Phone Number ID</label>
                                    <input type="text" readOnly placeholder="10928374..." value={isConnected ? displayedPhoneId : ""} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-mono" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">WABA ID</label>
                                    <input type="text" readOnly placeholder="88273641..." value={isConnected ? displayedWaba : ""} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-mono" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Webhook Configuration */}
                    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                            <h3 className="font-semibold text-zinc-900">Webhook Configuration</h3>
                            {!isConnected && <span className="text-[10px] px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-bold uppercase">Setup Required</span>}
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Callback URL</label>
                                <div className="flex gap-2">
                                    <input type="text" readOnly value="https://whatsapp-integration-hazel.vercel.app/api/webhooks/whatsapp" className="flex-1 p-3 bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-500 text-sm italic" />
                                    <button className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors" onClick={() => navigator.clipboard.writeText('https://whatsapp-integration-hazel.vercel.app/api/webhooks/whatsapp')}>Copy</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. PREVIEW COLUMN */}
                <div className="lg:col-span-5 hidden lg:block">
                    <div className="sticky top-24">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-semibold text-zinc-900">Message Preview</h3>
                            <p className="text-xs text-zinc-500">Real-time update</p>
                        </div>

                        {/* iPhone Mockup */}
                        <div className="relative mx-auto w-[290px] h-[580px] bg-zinc-900 rounded-[3rem] border-[7px] border-zinc-800 shadow-2xl overflow-hidden">
                            {/* Speaker Grill */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-20" />

                            {/* Screen Content */}
                            <div className="h-full w-full bg-[#E5DDD5] flex flex-col">
                                {/* WhatsApp Header */}
                                <div className="bg-[#075E54] p-4 pt-10 text-white flex items-center gap-3">
                                    <div className="w-8 h-8 bg-zinc-300 rounded-full" />
                                    <div>
                                        <p className="text-sm font-bold leading-none">Hazel Support</p>
                                        <p className="text-[10px] opacity-80">online</p>
                                    </div>
                                </div>

                                {/* Chat Area */}
                                <div className="flex-1 p-4 space-y-4">
                                    <div className="bg-white p-3 pt-2 rounded-lg rounded-tl-none shadow-sm text-xs max-w-[85%] relative whitespace-pre-wrap">
                                        {welcomeMsg}
                                        <div className="text-[9px] text-zinc-400 text-right mt-1">12:45 PM</div>
                                    </div>
                                </div>

                                {/* Input Bar */}
                                <div className="p-2 bg-zinc-100 flex gap-2 items-center">
                                    <div className="flex-1 h-8 bg-white rounded-full border border-zinc-200 px-3 flex items-center text-[10px] text-zinc-400">
                                        Type a message
                                    </div>
                                    <div className="w-8 h-8 bg-[#128C7E] rounded-full flex items-center justify-center text-white shrink-0">
                                        <MessageSquare size={14} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Live Editor for Preview */}
                        <div className="mt-6">
                            <label className="text-xs font-bold text-zinc-400 uppercase">Edit Welcome Message</label>
                            <textarea
                                className="w-full mt-2 p-3 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                rows={2}
                                value={welcomeMsg}
                                onChange={(e) => setWelcomeMsg(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
