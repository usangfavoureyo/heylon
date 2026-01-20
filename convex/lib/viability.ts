

export type ViabilityAssessment = {
    score: number; // 0.0 to 1.0
    label: "HIGH" | "MEDIUM" | "LOW";
    components: {
        zone_quality: "STRONG" | "AVERAGE" | "WEAK";
        location_quality: "STRONG" | "NEUTRAL" | "POOR";
        tap_quality: "CLEAN" | "DEGRADED" | "INVALID";
        environmental_veto: "CLEAR" | "CAUTION" | "VETO";
    };
    reasons: string[];
};

/**
 * Assess Zone Viability based on Signal Metadata and Context.
 * Triggered by "Zone Tapped" (Candle B).
 */
export function assessZoneViability(
    signal: any, // Typed as Doc<"signals"> roughly
    context: any // Context snapshot
): ViabilityAssessment {
    const reasons: string[] = [];

    // 1. Zone Quality (Mock logic based on available signal data)
    // Ideally we'd parse `signal.metadata` if it has specific fields
    // Assuming signal.metadata.volume_score exists from PineScript v1.5
    const volumeScore = signal.metadata?.volume_score || 1.0;
    let zoneQuality: "STRONG" | "AVERAGE" | "WEAK" = "AVERAGE";
    if (volumeScore > 2.0) zoneQuality = "STRONG";
    if (volumeScore < 0.8) zoneQuality = "WEAK";
    reasons.push(`Zone Quality: ${zoneQuality} (Vol Score: ${volumeScore})`);

    // 2. Location Quality
    // Use session or HTF context
    // Mock for now:
    let locationQuality: "STRONG" | "NEUTRAL" | "POOR" = "NEUTRAL";
    reasons.push(`Location Quality: ${locationQuality}`);

    // 3. Tap Quality
    // Evaluate if it's the "First Tap".
    // In strict mode, we trust the Signal timestamp vs Zone creation.
    // If signal says "Tapped", we check if `is_oversized` or `violation`.
    // Assuming PineScript filters mostly, but we can double check.
    let tapQuality: "CLEAN" | "DEGRADED" | "INVALID" = "CLEAN";
    // Check for origin violation if data available?
    // For now we assume Clean if signal arrived.
    reasons.push(`Tap Quality: ${tapQuality}`);

    // 4. Environmental Veto
    // Check context for High Impact News
    let envVeto: "CLEAR" | "CAUTION" | "VETO" = "CLEAR";

    // Check for high impact news in context
    if (context?.global?.newsSentiment?.score < -0.5) {
        // simplified check
        envVeto = "CAUTION";
        reasons.push("Negative News Sentiment");
    }

    // Aggregate Score
    let score = 0.5;
    if (zoneQuality === "STRONG") score += 0.2;
    if (zoneQuality === "WEAK") score -= 0.1;
    if (tapQuality === "CLEAN") score += 0.1;


    let label: "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";
    if (score >= 0.7) label = "HIGH";
    if (score < 0.4) label = "LOW";

    return {
        score,
        label,
        components: {
            zone_quality: zoneQuality,
            location_quality: locationQuality,
            tap_quality: tapQuality,
            environmental_veto: envVeto,
        },
        reasons
    };
}
