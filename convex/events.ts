import { mutation, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// 1. INGEST RAW (Immutable Log)
export const ingestRawEvent = mutation({
    args: {
        source: v.string(),
        ticker: v.string(),
        payload: v.any(),
        timestamp: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("events_raw", {
            source: args.source,
            ticker: args.ticker,
            payload: args.payload,
            timestamp: args.timestamp,
            received_at: Date.now(),
            processed: false,
        });
    },
});

// 2. PROCESS (Deduplication & Execution Logic)
export const processEvent = action({
    args: { rawEventId: v.id("events_raw") },
    handler: async (ctx, args) => {
        // 1. Fetch Raw Event
        const raw = await ctx.runQuery(internal.events.getRawEvent, { id: args.rawEventId });
        if (!raw) return;

        const payload = raw.payload;
        const type = payload.type;
        const data = payload.data || {};
        const timestampMs = Date.parse(payload.timestamp) || Date.now();

        // 2. Normalize and Execute Logic (Atomic Mutation)
        await ctx.runMutation(internal.events.normalizeEvent, {
            rawEventId: args.rawEventId,
            ticker: raw.ticker,
            type: type,
            timestamp: timestampMs,
            data: data,
        });
    },
});

export const getRawEvent = queryHelper("events_raw");

// 3. NORMALIZE (The Brain)
export const normalizeEvent = mutation({
    args: {
        rawEventId: v.id("events_raw"),
        ticker: v.string(),
        type: v.string(),
        timestamp: v.number(),
        data: v.any(),
    },
    handler: async (ctx, args) => {
        // A. Deduplication Check (Intra-bar Noise Filter)
        // If we received this exact same EVENT TYPE for this SYMBOL within the last 5 seconds, ignore.
        const DEDUP_WINDOW_MS = 5000;
        const recent = await ctx.db
            .query("events_normalized")
            .withIndex("by_ticker_type_time", (q) =>
                q.eq("ticker", args.ticker).eq("type", args.type as any).gt("timestamp", args.timestamp - DEDUP_WINDOW_MS)
            )
            .first();

        if (recent) {
            // Mark raw as processed but skipped
            await ctx.db.patch(args.rawEventId, { processed: true });
            return; // Skip duplicate
        }

        // B. Execution Calculations (SL / TP)
        let executionParams = {};
        const zone = args.data; // Assuming 'data' contains zone info from Pine

        if (["TAP", "MSS", "SETUP"].includes(args.type)) {
            // Defaults
            let entry = zone.close || zone.price || 0; // Price at trigger
            let sl = undefined;
            let tp = undefined;
            let direction = undefined;

            // Determine Direction
            if (zone.sdType === "Demand" || zone.type === "Demand") direction = "BULLISH";
            if (zone.sdType === "Supply" || zone.type === "Supply") direction = "BEARISH";

            // Calculate SL using Origin Wick (The User's "Must Have" Logic)
            const buffer = 0.0005; // generic pip buffer, should be ATR based ideally but fixed for now

            if (direction === "BULLISH") {
                if (zone.originLow) {
                    sl = zone.originLow - buffer;
                } else if (zone.bottom) {
                    sl = zone.bottom - buffer; // Fallback
                }
            } else if (direction === "BEARISH") {
                if (zone.originHigh) {
                    sl = zone.originHigh + buffer;
                } else if (zone.top) {
                    sl = zone.top + buffer; // Fallback
                }
            }

            // Calculate TP (2R Default)
            if (entry && sl) {
                const risk = Math.abs(entry - sl);
                if (direction === "BULLISH") {
                    tp = entry + (risk * 2);
                } else {
                    tp = entry - (risk * 2);
                }
            }

            executionParams = {
                entry_price: entry,
                stop_loss: sl,
                take_profit: tp,
            };

            // Update Decision State immediately
            // Note: verdict is "WAIT" until strict pipeline confirms, but purely for this task we show we capture params.
            // In full flow, this would trigger the Decision Engine. For now, we update state.
            const existingState = await ctx.db
                .query("decision_state")
                .withIndex("by_symbol", (q) => q.eq("symbol", args.ticker))
                .first();

            const newState = {
                symbol: args.ticker,
                verdict: "WAIT", // Default until Engine confirms
                confidence: "LOW",
                executability: (sl && tp) ? "EXECUTABLE" : "BLOCKED",
                ...executionParams,
                updated_at: Date.now(),
                blockers: existingState?.blockers || [],
                supports: existingState?.supports || [],
            };

            if (existingState) {
                await ctx.db.patch(existingState._id, newState as any);
            } else {
                await ctx.db.insert("decision_state", { ...newState, blockers: [], supports: [] } as any);
            }
        }

        // C. Insert Normalized Event
        await ctx.db.insert("events_normalized", {
            ticker: args.ticker,
            type: args.type as any,
            timestamp: args.timestamp,
            zone_id: zone.guid,
            timeframe: zone.timeframe,
            raw_event_id: args.rawEventId,
            ...executionParams,
        });

        await ctx.db.patch(args.rawEventId, { processed: true });
    },
});

// Helper for queries
import { query } from "./_generated/server";
function queryHelper(table: string) {
    return query({
        args: { id: v.id(table) },
        handler: async (ctx, args) => {
            return await ctx.db.get(args.id);
        }
    });
}
