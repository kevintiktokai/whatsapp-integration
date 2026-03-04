// lib/wa_tools/meta_stub.ts
// Stubbed Meta Graph API calls.
// When WA_META_LINK_ENABLED=true, these should call real Meta endpoints.
// For now, they simulate success responses.

const META_LINK_ENABLED = process.env.WA_META_LINK_ENABLED === "true";

export interface TokenExchangeResult {
    access_token: string;
    token_type: string;
}

export interface SubscribeResult {
    success: boolean;
}

export interface RegisterResult {
    success: boolean;
}

/**
 * Exchange the Embedded Signup code for an access token.
 * Real call: POST https://graph.facebook.com/{version}/oauth/access_token
 */
export async function exchangeCodeForToken(code: string): Promise<TokenExchangeResult> {
    if (META_LINK_ENABLED) {
        const version = process.env.META_GRAPH_VERSION ?? "v21.0";
        const appId = process.env.META_APP_ID;
        const appSecret = process.env.META_APP_SECRET;

        const url = `https://graph.facebook.com/${version}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}`;
        const res = await fetch(url, { method: "POST" });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(`Meta token exchange failed: ${JSON.stringify(body)}`);
        }

        return await res.json();
    }

    // Stub response
    console.log("[META STUB] exchangeCodeForToken called with code:", code.substring(0, 10) + "...");
    return {
        access_token: "STUB_ACCESS_TOKEN_" + Date.now(),
        token_type: "bearer",
    };
}

/**
 * Subscribe the app to the customer's WABA webhooks.
 * Real call: POST https://graph.facebook.com/{version}/{wabaId}/subscribed_apps
 */
export async function subscribeToWabaWebhooks(wabaId: string, accessToken: string): Promise<SubscribeResult> {
    if (META_LINK_ENABLED) {
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
    if (META_LINK_ENABLED) {
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
