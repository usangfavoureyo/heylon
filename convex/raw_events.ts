import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
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

export const getRawEvent = internalQuery({
    args: { id: v.id("events_raw") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const markProcessed = internalMutation({
    args: { id: v.id("events_raw") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { processed: true });
    },
});
