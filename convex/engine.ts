import { internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { assessZoneViability } from "./lib/viability";

// --- QUERIES ---

export const getDecisionState = query({
    args: { symbol: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("decision_state")
            .withIndex("by_symbol", q => q.eq("symbol", args.symbol))
            .first();
    }
});

// --- MUTATIONS ---

export const processSignal = internalMutation({
    args: {
        symbol: v.string(),
        type: v.union(
            v.literal("ZONE_CREATED"),
            v.literal("TAP"),
            v.literal("MSS"),
            v.literal("Zone Broken"), // Pine sends "Zone Broken"
            v.literal("SETUP")
        ),
        payload: v.any() // Raw data from Pine
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const { symbol, type, payload } = args;

        // 1. Log to Immutable Event Stream
        const price = payload.close || payload.price || 0;
        const timeframe = payload.timeframe || "1H";
        const zoneId = payload.zoneId;
        const summary = payload.summary || `Received ${type}`;

        // DIRECT DB INSERT (Replacing ctx.runMutation)
        // DIRECT DB INSERT (Replacing ctx.runMutation)
        await ctx.db.insert("signals", {
            symbol,
            type: type === "Zone Broken" ? "ZONE_BROKEN" : type as any,
            timeframe,
            zoneId,
            price,
            metadata: payload,
            summary: summary,
            createdAt: now
        });
        // Note: We skip 'notifications' trigger here for simplicity, or we can insert into 'notifications' too if critical.
        // Usually 'signals' table has a separate trigger or frontend subscription.

        // 2. Fetch Single Source of Truth
        let state = await ctx.db
            .query("decision_state")
            .withIndex("by_symbol", q => q.eq("symbol", symbol))
            .first();

        // Init if missing
        if (!state) {
            const id = await ctx.db.insert("decision_state", {
                symbol,
                decision: "IDLE",
                stage: "IDLE",
                confidence: 0,
                analysis: "Initializing...",
                supporting_factors: [],
                blocking_factors: [],
                jury: {
                    votes: [],
                    consensus: "WAIT",
                    explanation: "Waiting for data.",
                    lastVoteTime: 0
                },
                trigger: { type: "NONE" },
                expiry: now + (24 * 60 * 60 * 1000),
                updatedAt: now
            });
            state = await ctx.db.get(id);
        }
        if (!state) return; // safety

        // 3. Fetch Settings & Context
        const settings = await ctx.db.query("system_settings").first();
        // Default fallbacks if settings missing
        const microMssEnabled = settings?.trading?.microMss ?? true;
        const structuralMssEnabled = settings?.trading?.structuralMss ?? false;
        const forceWait = settings?.trading?.forceWait ?? false;

        const context = await ctx.db.query("context_snapshots").withIndex("by_symbol", q => q.eq("symbol", symbol)).first();


        // 4. Logic Flow (State Machine)

        // CASE: ZONE BROKEN
        if (type === "Zone Broken") {
            await ctx.db.patch(state._id, {
                decision: "IDLE",
                confidence: 0,
                analysis: "Zone Broken. Resetting state.",
                viability_score: undefined,
                updatedAt: now
            });
            return;
        }

        // CASE: ZONE CREATION
        if (type === "ZONE_CREATED") {
            // Just awareness. Reset if we were IDLE?
            // Don't reset if we are active in another zone? 
            // Heylon V2 assumes single active thread per symbol usually.
            // If IDLE, stay IDLE.
            return;
        }

        // CASE: TAP (Candle B Viability Assessment)
        if (type === "TAP") {
            // Run Assessment
            // Construct a pseudo-signal doc for the library
            const signalStub = { type, metadata: payload };
            const viability = assessZoneViability(signalStub, context);

            let newDecision: "WAIT" | "IDLE" | "BUY" | "SELL" | "BIAS" = "WAIT"; // Default after tap
            let analysis = `Zone Tapped. Viability: ${viability.label}.`;

            if (viability.components.environmental_veto === "VETO") {
                analysis += " BLOCKED by Environment.";
                // We keep decision WAIT (or IDLE?)
            }

            await ctx.db.patch(state._id, {
                decision: newDecision,
                viability_score: viability.score,
                analysis,
                supporting_factors: [...state.supporting_factors, ...viability.reasons],
                updatedAt: now
            });
            return;
        }

        // CASE: MSS (Execution Gate)
        if (type === "MSS" || type === "SETUP") {
            // Check Toggles
            // Default to MICRO if not specified
            const isStructural = payload.is_structural === true || payload.type === "STRUCTURAL_MSS" || payload.timeframe === "4H" || payload.timeframe === "1D";

            // Validation Logic
            if (isStructural) {
                if (!structuralMssEnabled) {
                    console.log(`[ENGINE] Ignored Structural MSS on ${symbol} (Toggle OFF)`);
                    return;
                }
            } else {
                // Micro MSS (Default)
                if (!microMssEnabled) {
                    console.log(`[ENGINE] Ignored Micro MSS on ${symbol} (Toggle OFF)`);
                    return;
                }
            }

            if (forceWait) {
                await ctx.db.patch(state._id, {
                    decision: "WAIT",
                    analysis: "MSS Received but Force Wait is ON.",
                    updatedAt: now
                });
                return;
            }

            // Check if Blocked
            if (state.blocking_factors.length > 0) {
                await ctx.db.patch(state._id, {
                    analysis: `MSS Received but Blocked by: ${state.blocking_factors.join(", ")}`,
                    updatedAt: now
                });
                return;
            }

            // 5. Session Gate (Active vs Passive)
            const sessionActive = checkSession(now, settings?.trading);

            if (settings?.trading?.sessionFilter && !sessionActive.isActive) {
                await ctx.db.patch(state._id, {
                    decision: "WAIT",
                    analysis: `MSS Valid but OUTSIDE SESSION. (${sessionActive.reason}). Monitoring.`,
                    updatedAt: now
                });
                // Log monitoring event but do not execute
                return;
            }

            // DETERMINE DIRECTION
            // Payload might have "direction", or "title" (MSS Bear/Bull)
            const isBull = payload.title?.includes("Bull") || payload.message?.includes("Bull") || payload.direction === "UP";
            const decision = isBull ? "BUY" : "SELL";

            // CONFIRM
            await ctx.db.patch(state._id, {
                decision,
                confidence: state.viability_score ? state.viability_score * 100 : 80, // Base on viability if available
                analysis: `MSS Confirmed (${decision}). execution_status: OPEN`,
                updatedAt: now
            });

            // Trigger Jury for final validation
            if (context) {
                await ctx.scheduler.runAfter(0, internal.jury.runJury, {
                    symbol,
                    signalDirection: isBull ? "BULLISH" : "BEARISH",
                    contextSnapshot: context,
                    stage: "FINAL"
                });
            } else {
                console.warn("[ENGINE] Skipping Jury: No Context Snapshot found.");
            }
        }
    }
});

export const commitJuryVerdict = internalMutation({
    args: {
        symbol: v.string(),
        verdict: v.union(v.literal("BUY"), v.literal("SELL"), v.literal("WAIT"), v.literal("IDLE")),
        confidence: v.string(),
        executability: v.string(),
        stage: v.string(),
        votes: v.any(),
        explanation: v.string()
    },
    handler: async (ctx, args) => {
        const state = await ctx.db
            .query("decision_state")
            .withIndex("by_symbol", q => q.eq("symbol", args.symbol))
            .first();

        if (state) {
            let confNum = 0.5;
            if (args.confidence === "HIGH") confNum = 0.9;
            if (args.confidence === "MEDIUM") confNum = 0.7;
            if (args.confidence === "LOW") confNum = 0.3;

            await ctx.db.patch(state._id, {
                decision: args.verdict,
                stage: "FINAL",
                confidence: confNum,
                jury: {
                    consensus: args.verdict,
                    votes: args.votes,
                    explanation: args.explanation,
                    lastVoteTime: Date.now()
                },
                analysis: args.explanation,
                updatedAt: Date.now()
            });
        }
    }
});

// --- HELPERS ---

function checkSession(now: number, tradingSettings: any): { isActive: boolean, reason?: string } {
    if (!tradingSettings?.sessionFilter) return { isActive: true };

    const startStr = tradingSettings.sessionStart || "14:30";
    const endStr = tradingSettings.sessionEnd || "22:00";
    const tz = tradingSettings.timezone || "Africa/Lagos";

    try {
        // Get current time in target timezone
        const dateInTz = new Date(now).toLocaleTimeString("en-US", { timeZone: tz, hour12: false, hour: '2-digit', minute: '2-digit' });
        // format "HH:mm" e.g. "14:45"

        // Simple string comparison works for 24h format if NO overnight span across 00:00
        // If start > end (e.g. 22:00 to 02:00), we need split logic.
        // Let's implement standard "time range contains" logic.

        const [currentH, currentM] = dateInTz.split(":").map(Number);
        const [startH, startM] = startStr.split(":").map(Number);
        const [endH, endM] = endStr.split(":").map(Number);

        const currentMins = currentH * 60 + currentM;
        const startMins = startH * 60 + startM;
        const endMins = endH * 60 + endM;

        if (startMins <= endMins) {
            // Normal day range (e.g. 09:00 to 17:00)
            if (currentMins >= startMins && currentMins < endMins) {
                return { isActive: true };
            }
        } else {
            // Overnight range (e.g. 22:00 to 02:00)
            // Active if > 22:00 OR < 02:00
            if (currentMins >= startMins || currentMins < endMins) {
                return { isActive: true };
            }
        }

        return { isActive: false, reason: `Time ${dateInTz} outside ${startStr}-${endStr} (${tz})` };

    } catch (e) {
        console.error("Timezone error", e);
        // Fail open or closed? Closed safe.
        return { isActive: false, reason: "Timezone Error" };
    }
}
