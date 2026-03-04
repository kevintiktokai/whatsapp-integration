// lib/wa_tools/policy.ts
// Tracking-mode enforcement: determines what gets stored.

export type TrackingMode = "off" | "tracked";

/**
 * Returns true if the message body/raw should be stored.
 * Enforcement MUST occur BEFORE any body/raw is written to DB.
 */
export function shouldStoreBody(trackingMode: TrackingMode): boolean {
    return trackingMode === "tracked";
}

/**
 * Returns true if message index (metadata) should always be stored.
 * This is ALWAYS true — index is stored regardless of tracking mode.
 */
export function shouldStoreIndex(): boolean {
    return true;
}

/**
 * Returns true if CRM activity events should be emitted.
 * Only emitted when tracking is ON.
 */
export function shouldEmitCrmEvent(trackingMode: TrackingMode): boolean {
    return trackingMode === "tracked";
}
