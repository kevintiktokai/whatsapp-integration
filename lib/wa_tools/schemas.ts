// lib/wa_tools/schemas.ts
// Zod schemas for strict validation of inbound API requests.
import { z } from "zod";

// --- Primitives ---
export const isoDateString = z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), "Invalid ISO date string");

export const nonEmptyString = z.string().min(1);

export const waOnboardingModeSchema = z.enum(["coexistence", "api_only"]);

export const waOnboardingStatusSchema = z.enum([
    "ready_check",
    "launching_coexistence",
    "launching_api_only",
    "callback_received",
    "token_exchanged",
    "webhooks_subscribed",
    "number_registered",
    "connected_coexistence",
    "connected_api_only",
    "failed",
]);

export const waErrorClassSchema = z.enum([
    "COEX_NOT_ELIGIBLE",
    "COEX_NEEDS_ACTIVITY",
    "NEEDS_2FA_PIN",
    "BUSINESS_POLICY_BLOCK",
    "NUMBER_IN_USE",
    "PERMISSION_DENIED",
    "TEMPORARY",
    "UNKNOWN",
]);

export const waErrorUserActionSchema = z.enum([
    "RETRY",
    "FIX_AND_RETRY",
    "FALLBACK_API_ONLY",
    "CONTACT_SUPPORT",
]);

export const waErrorEnvelopeSchema = z.object({
    class: waErrorClassSchema,
    retryable: z.boolean(),
    user_action: waErrorUserActionSchema,
    display_title: z.string().min(1).max(120),
    display_body: z.string().min(1).max(600),
    raw: z.record(z.string(), z.unknown()).optional(),
});

// --- API Request Schemas ---
export const waOnboardingStartRequestSchema = z.object({
    mode_requested: waOnboardingModeSchema,
});

export const waOnboardingCompleteRequestSchema = z.object({
    state: nonEmptyString,
    waba_id: nonEmptyString,
    phone_number_id: nonEmptyString,
    code: nonEmptyString,
});

export const waOnboardingFallbackRequestSchema = z.object({
    session_id: nonEmptyString,
});

// --- Webhook schema (permissive — safe extraction only) ---
export const waWebhookPayloadSchema = z
    .object({
        object: z.string().optional(),
        entry: z
            .array(
                z.object({
                    id: z.string().optional(),
                    changes: z
                        .array(
                            z.object({
                                field: z.string().optional(),
                                value: z
                                    .object({
                                        metadata: z
                                            .object({
                                                phone_number_id: z.string().optional(),
                                                display_phone_number: z.string().optional(),
                                            })
                                            .optional(),
                                        contacts: z
                                            .array(
                                                z.object({
                                                    wa_id: z.string().optional(),
                                                    profile: z.object({ name: z.string().optional() }).optional(),
                                                })
                                            )
                                            .optional(),
                                        messages: z
                                            .array(
                                                z.object({
                                                    id: z.string().optional(),
                                                    from: z.string().optional(),
                                                    timestamp: z.string().optional(),
                                                    type: z.string().optional(),
                                                    text: z.object({ body: z.string().optional() }).optional(),
                                                })
                                            )
                                            .optional(),
                                        statuses: z
                                            .array(
                                                z.object({
                                                    id: z.string().optional(),
                                                    status: z.string().optional(),
                                                    timestamp: z.string().optional(),
                                                    recipient_id: z.string().optional(),
                                                })
                                            )
                                            .optional(),
                                    })
                                    .optional(),
                            })
                        )
                        .optional(),
                })
            )
            .optional(),
    })
    .passthrough();
