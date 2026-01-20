import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    args: { symbol: v.optional(v.string()) },
    handler: async (ctx, args) => {
        if (!args.symbol) return null;
        return await ctx.db
            .query("market_data")
            .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol as string))
            .first();
    },
});

export const update = internalMutation({
    args: {
        symbol: v.string(),
        price: v.number(),
        change: v.number(),
        changePercent: v.number(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("market_data")
            .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                price: args.price,
                change: args.change,
                changePercent: args.changePercent,
                lastUpdated: Date.now(),
            });
        } else {
            await ctx.db.insert("market_data", {
                symbol: args.symbol,
                price: args.price,
                change: args.change,
                changePercent: args.changePercent,
                lastUpdated: Date.now(),
            });
        }
    },
});
