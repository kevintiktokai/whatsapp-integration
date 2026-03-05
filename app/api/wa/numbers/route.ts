export const dynamic = 'force-dynamic';
// app/api/wa/numbers/route.ts
// POST — Exchange Facebook OAuth code for a token, then fetch available WhatsApp Business numbers

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { code } = body;

        if (!code) {
            return NextResponse.json({ ok: false, error: "Missing OAuth code" }, { status: 400 });
        }

        const version = process.env.META_GRAPH_VERSION ?? "v21.0";
        const appId = process.env.NEXT_PUBLIC_META_APP_ID;
        const appSecret = process.env.META_APP_SECRET;

        // 1. Exchange code for access token
        const tokenUrl = `https://graph.facebook.com/${version}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}`;
        const tokenRes = await fetch(tokenUrl, { method: "POST" });

        if (!tokenRes.ok) {
            const tokenErr = await tokenRes.json().catch(() => ({}));
            console.error("[NUMBERS] Token exchange failed:", tokenErr);
            return NextResponse.json(
                { ok: false, error: "Failed to exchange token with Meta", details: tokenErr },
                { status: 400 }
            );
        }

        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;

        // 2. Use debug_token to find which WABAs the user granted access to
        const appAccessToken = `${appId}|${appSecret}`;
        const debugUrl = `https://graph.facebook.com/${version}/debug_token?input_token=${accessToken}&access_token=${appAccessToken}`;
        const debugRes = await fetch(debugUrl);

        if (!debugRes.ok) {
            console.error("[NUMBERS] Debug token failed");
            return NextResponse.json(
                { ok: false, error: "Failed to inspect token" },
                { status: 500 }
            );
        }

        const debugData = await debugRes.json();
        const scopes = debugData.data?.granular_scopes || [];
        const waScope = scopes.find((s: any) => s.scope === "whatsapp_business_management");
        const wabaIds: string[] = waScope?.target_ids || [];

        if (wabaIds.length === 0) {
            return NextResponse.json({
                ok: false,
                error: "No WhatsApp Business Accounts found. Make sure you have a WhatsApp Business Account linked to your Meta account.",
            }, { status: 404 });
        }

        // 3. For each WABA, fetch the phone numbers
        const allNumbers: Array<{
            waba_id: string;
            waba_name: string;
            phone_number_id: string;
            display_phone_number: string;
            verified_name: string;
            quality_rating: string;
        }> = [];

        for (const wabaId of wabaIds) {
            // Get WABA details
            const wabaUrl = `https://graph.facebook.com/${version}/${wabaId}?access_token=${accessToken}`;
            const wabaRes = await fetch(wabaUrl);
            let wabaName = wabaId;
            if (wabaRes.ok) {
                const wabaData = await wabaRes.json();
                wabaName = wabaData.name || wabaId;
            }

            // Get phone numbers for this WABA
            const phoneUrl = `https://graph.facebook.com/${version}/${wabaId}/phone_numbers?access_token=${accessToken}`;
            const phoneRes = await fetch(phoneUrl);

            if (phoneRes.ok) {
                const phoneData = await phoneRes.json();
                if (phoneData.data && phoneData.data.length > 0) {
                    for (const phone of phoneData.data) {
                        allNumbers.push({
                            waba_id: wabaId,
                            waba_name: wabaName,
                            phone_number_id: phone.id,
                            display_phone_number: phone.display_phone_number || phone.id,
                            verified_name: phone.verified_name || "",
                            quality_rating: phone.quality_rating || "unknown",
                        });
                    }
                }
            }
        }

        console.log("[NUMBERS] Found numbers:", allNumbers.length, "across", wabaIds.length, "WABAs");

        return NextResponse.json({
            ok: true,
            access_token: accessToken, // We'll need this when the user selects a number
            numbers: allNumbers,
        });
    } catch (err) {
        console.error("[NUMBERS] Error:", err);
        return NextResponse.json(
            { ok: false, error: (err as Error).message },
            { status: 500 }
        );
    }
}
