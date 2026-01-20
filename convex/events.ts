import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// 2. PROCESS (Adapter to Engine)
export const processEvent = action({
    args: { rawEventId: v.id("events_raw") },
    handler: async (ctx, args) => {
        // 1. Fetch Raw Event
        const raw = await ctx.runQuery(internal.raw_events.getRawEvent, { id: args.rawEventId });
        if (!raw) return;

        const payload = raw.payload;

        // 2. Forward to Engine
        // This validates that the engine expects 'type' and 'payload'
        await ctx.runMutation(internal.engine.processSignal, {
            symbol: raw.ticker,
            type: payload.type,
            payload: payload
        });

        // 3. Mark Processed
        await ctx.runMutation(internal.raw_events.markProcessed, { id: args.rawEventId });
    },
});
