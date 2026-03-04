// lib/wa_tools/state.ts
// HMAC-signed onboarding state (payloadb64.sigb64)
// Uses Node crypto. Works in Next.js route handlers.

import crypto from "crypto";
import { z } from "zod";

const statePayloadSchema = z.object({
  v: z.literal(1),
  session_id: z.string().min(1),
  org_id: z.string().min(1),
  agent_user_id: z.string().min(1),
  nonce: z.string().min(12),
  iat: z.number().int(),
  exp: z.number().int(),
});

export type StatePayload = z.infer<typeof statePayloadSchema>;

function base64urlEncode(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64urlDecodeToString(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  return Buffer.from(b64 + pad, "base64").toString("utf8");
}

function hmacSha256Base64url(message: string, secret: string): string {
  const sig = crypto.createHmac("sha256", secret).update(message).digest();
  return base64urlEncode(sig);
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export function signState(payload: StatePayload, secret: string): string {
  const payloadJson = JSON.stringify(payload);
  const payloadB64 = base64urlEncode(payloadJson);
  const sigB64 = hmacSha256Base64url(payloadB64, secret);
  return `${payloadB64}.${sigB64}`;
}

export function verifyAndParseState(
  state: string,
  secret: string,
  nowEpochSec: number = Math.floor(Date.now() / 1000)
): { ok: true; payload: StatePayload } | { ok: false; reason: string } {
  const parts = state.split(".");
  if (parts.length !== 2) return { ok: false, reason: "Malformed state" };

  const [payloadB64, sigB64] = parts;
  const expected = hmacSha256Base64url(payloadB64, secret);

  if (!timingSafeEqualStr(sigB64, expected)) {
    return { ok: false, reason: "Invalid signature" };
  }

  let payloadObj: unknown;
  try {
    payloadObj = JSON.parse(base64urlDecodeToString(payloadB64));
  } catch {
    return { ok: false, reason: "Invalid payload JSON" };
  }

  const parsed = statePayloadSchema.safeParse(payloadObj);
  if (!parsed.success) return { ok: false, reason: "Invalid payload shape" };

  if (parsed.data.exp < nowEpochSec) return { ok: false, reason: "State expired" };
  if (parsed.data.iat > nowEpochSec + 60) return { ok: false, reason: "State iat in future" };

  return { ok: true, payload: parsed.data };
}
