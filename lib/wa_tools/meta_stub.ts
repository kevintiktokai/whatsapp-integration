// lib/wa_tools/meta_stub.ts
// Meta Graph API calls with stub fallback.
// When WA_META_LINK_ENABLED=true, these call real Meta endpoints.

function isMetaLinkEnabled(): boolean {
    return process.env.WA_META_LINK_ENABLED === "true";
}

export interface TokenExchangeResult {
    access_token: string;
    token_type: string;
    waba_id?: string;
    phone_number_id?: string;
    display_phone_number?: string;
}

export interface SubscribeResult {
    success: boolean;
}

export interface RegisterResult {
    success: boolean;
}

export async function exchangeCodeForToken(code: string): Promise<TokenExchangeResult> {
    if (isMetaLinkEnabled()) {
        const version = process.env.META_GRAPH_VERSION ?? "v21.0";
        const appId = process.env.NEXT_PUBLIC_META_APP_ID;
        const appSecret = process.env.META_APP_SECRET;

        // 1. Get Access Token
        const url = `https://graph.facebook.com/${version}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}`;
        const res = await fetch(url, { method: "POST" });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(`Meta token exchange failed: ${JSON.stringify(body)}`);
        }
        const tokenData = await res.json();
        const access_token = tokenData.access_token;

        // 2. Extract WABA ID from debug_token
        const appAccessToken = `${appId}|${appSecret}`;
        const debugUrl = `https://graph.facebook.com/${version}/debug_token?input_token=${access_token}&access_token=${appAccessToken}`;
        const debugRes = await fetch(debugUrl);
        let waba_id: string | undefined;

        if (debugRes.ok) {
            const debugData = await debugRes.json();
            const scopes = debugData.data?.granular_scopes || [];
            const waScope = scopes.find((s: any) => s.scope === "whatsapp_business_management");
            if (waScope && waScope.target_ids && waScope.target_ids.length > 0) {
                waba_id = waScope.target_ids[0];
            } else {
                console.error("[META API] debug_token missing target_ids or whatsapp_business_management scope:", JSON.stringify(debugData));
            }
        } else {
            const errBody = await debugRes.text();
            console.error("[META API] debug_token failed:", errBody);
        }

        // 3. Extract Phone Number
        let phone_number_id: string | undefined;
        let display_phone_number: string | undefined;

        if (waba_id) {
            const phoneUrl = `https://graph.facebook.com/${version}/${waba_id}/phone_numbers?access_token=${access_token}`;
            const phoneRes = await fetch(phoneUrl);
            if (phoneRes.ok) {
                const phoneData = await phoneRes.json();
                if (phoneData.data && phoneData.data.length > 0) {
                    phone_number_id = phoneData.data[0].id;
                    display_phone_number = phoneData.data[0].display_phone_number;
                } else {
                    console.error("[META API] No phone numbers found for WABA", waba_id, "Data:", JSON.stringify(phoneData));
                }
            } else {
                const errBody = await phoneRes.text();
                console.error(`[META API] Failed to fetch phone numbers for WABA ${waba_id}:`, errBody);
            }
        }

        return {
            access_token,
            token_type: tokenData.token_type,
            waba_id,
            phone_number_id,
            display_phone_number
        };
    }

    // Stub response
    console.log("[META STUB] exchangeCodeForToken called with code:", code.substring(0, 10) + "...");
    return {
        access_token: "STUB_ACCESS_TOKEN_" + Date.now(),
        token_type: "bearer",
        waba_id: "STUB_WABA_ID",
        phone_number_id: "STUB_PHONE_ID",
    };
}

/**
 * Subscribe the app to the customer's WABA webhooks.
 * Real call: POST https://graph.facebook.com/{version}/{wabaId}/subscribed_apps
 */
export async function subscribeToWabaWebhooks(wabaId: string, accessToken: string): Promise<SubscribeResult> {
    if (isMetaLinkEnabled()) {
        const version = process.env.META_GRAPH_VERSION ?? "v21.0";
        const url = `https://graph.facebook.com/${version}/${wabaId}/subscribed_apps`;
        const res = await fetch(url, {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(`Meta subscribe failed: ${JSON.stringify(body)}`);
        }

        return { success: true };
    }

    // Stub response
    console.log("[META STUB] subscribeToWabaWebhooks called for WABA:", wabaId);
    return { success: true };
}

/**
 * Register a phone number for Cloud API.
 * Real call: POST https://graph.facebook.com/{version}/{phoneNumberId}/register
 */
export async function registerPhoneNumber(phoneNumberId: string, pin: string, accessToken: string): Promise<RegisterResult> {
    if (isMetaLinkEnabled()) {
        const version = process.env.META_GRAPH_VERSION ?? "v21.0";
        const url = `https://graph.facebook.com/${version}/${phoneNumberId}/register`;
        const res = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                pin,
            }),
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(`Meta register failed: ${JSON.stringify(body)}`);
        }

        return { success: true };
    }

    // Stub response
    console.log("[META STUB] registerPhoneNumber called for:", phoneNumberId);
    return { success: true };
}
