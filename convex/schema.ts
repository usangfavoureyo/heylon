import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Immutable log of every single webhook hit (for audit/debugging)
    events_raw: defineTable({
        source: v.string(), // "tradingview_pinescript"
        ticker: v.string(),
        payload: v.any(),   // Full JSON payload including originHigh/Low
        timestamp: v.string(), // ISO string from payload
        received_at: v.number(), // Server timestamp
        processed: v.boolean(),
    }).index("by_processed", ["processed"]),

    // Normalized, Deduplicated Signals (The "Truth" for Decisions)
    events_normalized: defineTable({
        ticker: v.string(),
        type: v.union(
            v.literal("ZONE_CREATED"),
            v.literal("TAP"),
            v.literal("MSS"),
            v.literal("SETUP"),
            v.literal("INVALIDATION"),
            v.literal("NEWS"),
            v.literal("MACRO")
        ),
        timestamp: v.number(), // Unix ms

        // Core Data
        zone_id: v.optional(v.number()), // GUID from Pine
        timeframe: v.optional(v.string()),

        // Signal Details
        direction: v.optional(v.union(v.literal("BULLISH"), v.literal("BEARISH"))),

        // A++/A+ Setup Details
        setup_quality: v.optional(v.union(v.literal("A_PLUS"), v.literal("A_PLUS_PLUS"))),

        // Link to raw event
        raw_event_id: v.id("events_raw"),
    })
        .index("by_ticker_type_time", ["ticker", "type", "timestamp"]) // For dedup
        .index("by_ticker", ["ticker"]),

    // Decision State (The Output Instrument)
    decision_state: defineTable({
        symbol: v.string(),

        // The Verdict (Read-Only UI consumes this)
        verdict: v.union(v.literal("BUY"), v.literal("SELL"), v.literal("WAIT")),
        confidence: v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH"), v.literal("VERY_HIGH")),
        executability: v.union(v.literal("EXECUTABLE"), v.literal("BLOCKED")),

        // Execution Parameters (Computed by Backend)
        entry_price: v.optional(v.number()),
        stop_loss: v.optional(v.number()),
        take_profit: v.optional(v.number()),

        // Reasoning
        blockers: v.array(v.string()), // e.g. ["NEWS_RISK", "BAD_STRUCTURE"]
        supports: v.array(v.string()), // e.g. ["A_PLUS_SETUP", "NEWS_CLEAR"]

        updated_at: v.number(),
    }).index("by_symbol", ["symbol"]),

    // Zone Registry (Persistent State of Active Zones)
    zones: defineTable({
        guid: v.number(),
        symbol: v.string(),
        type: v.union(v.literal("SUPPLY"), v.literal("DEMAND")),
        timeframe: v.string(),
        top: v.number(),
        bottom: v.number(),
        origin_high: v.number(), // Critical for SL (Short)
        origin_low: v.number(),  // Critical for SL (Long)
        created_at: v.number(),

        status: v.union(v.literal("ACTIVE"), v.literal("INVALIDATED"), v.literal("TESTED")),
        tap_count: v.number(),
    }).index("by_guid", ["guid"])
        .index("by_symbol_status", ["symbol", "status"]),
});
