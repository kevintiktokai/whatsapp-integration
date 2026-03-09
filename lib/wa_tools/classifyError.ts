// lib/wa_tools/classifyError.ts
// Deterministic Meta error classifier → normalized error envelope.

export interface WaErrorEnvelope {
    class: string;
    retryable: boolean;
    user_action: "RETRY" | "FIX_AND_RETRY" | "FALLBACK_API_ONLY" | "CONTACT_SUPPORT";
    display_title: string;
    display_body: string;
    raw?: Record<string, unknown>;
}

/**
 * Classify a Meta API error into a normalized error envelope.
 * Add new patterns as you discover them in production.
 */
export function classifyMetaError(
    errorCode?: number | string,
    errorMessage?: string,
    rawPayload?: Record<string, unknown>
): WaErrorEnvelope {
    const code = String(errorCode ?? "").toLowerCase();
    const msg = (errorMessage ?? "").toLowerCase();

    // Coexistence not eligible
    if (msg.includes("not eligible") || msg.includes("not allowed to connect") || msg.includes("coexistence")) {
        return {
            class: "COEX_NOT_ELIGIBLE",
            retryable: true,
            user_action: "FALLBACK_API_ONLY",
            display_title: "This number can't use Coexistence yet",
            display_body: "Meta says this number isn't eligible for Coexistence right now. You can retry later or connect using API-only.",
            raw: rawPayload,
        };
    }

    // Needs more activity
    if (msg.includes("activity") || msg.includes("tenure")) {
        return {
            class: "COEX_NEEDS_ACTIVITY",
            retryable: true,
            user_action: "FIX_AND_RETRY",
            display_title: "More WhatsApp Business activity needed",
            display_body: "Meta requires more activity on this number before Coexistence is available. Keep using WhatsApp Business App and try again later.",
            raw: rawPayload,
        };
    }

    // 2FA PIN required
    if (msg.includes("pin") || msg.includes("two-step") || msg.includes("2fa") || msg.includes("verification")) {
        return {
            class: "NEEDS_2FA_PIN",
            retryable: true,
            user_action: "FIX_AND_RETRY",
            display_title: "WhatsApp PIN required",
            display_body: "Please enter your 6-digit WhatsApp Manager PIN to complete registration.",
            raw: rawPayload,
        };
    }

    // Number already in use
    if (msg.includes("already registered") || msg.includes("in use") || msg.includes("already connected")) {
        return {
            class: "NUMBER_IN_USE",
            retryable: false,
            user_action: "FIX_AND_RETRY",
            display_title: "Number already connected elsewhere",
            display_body: "This number is already connected to another provider. Disconnect it from the other service first, then try again.",
            raw: rawPayload,
        };
    }

    // Permission issues
    if (msg.includes("permission") || msg.includes("unauthorized") || msg.includes("admin") || code === "190") {
        return {
            class: "PERMISSION_DENIED",
            retryable: true,
            user_action: "FIX_AND_RETRY",
            display_title: "Insufficient permissions",
            display_body: "Please use a Facebook account with admin access to your Business Portfolio.",
            raw: rawPayload,
        };
    }

    // Business policy block
    if (msg.includes("policy") || msg.includes("business") || msg.includes("compliance")) {
        return {
            class: "BUSINESS_POLICY_BLOCK",
            retryable: false,
            user_action: "CONTACT_SUPPORT",
            display_title: "Business account issue",
            display_body: "There's a policy issue with your Meta Business account. Please check your Business Manager settings or contact support.",
            raw: rawPayload,
        };
    }

    // Rate limit or temporary error
    if (msg.includes("rate limit") || msg.includes("temporarily") || code === "4" || code === "17") {
        return {
            class: "TEMPORARY",
            retryable: true,
            user_action: "RETRY",
            display_title: "Temporary issue",
            display_body: "Something went wrong on Meta's end. Please try again in a few minutes.",
            raw: rawPayload,
        };
    }

    // Unknown
    return {
        class: "UNKNOWN",
        retryable: false,
        user_action: "CONTACT_SUPPORT",
        display_title: "Setup Error",
        display_body: errorMessage ? `Details: ${errorMessage}` : "An unexpected error occurred during setup.",
        raw: rawPayload,
    };
}
