import { query } from "./_generated/server";
import { v } from "convex/values";

export const getFullState = query({
    args: { symbol: v.optional(v.string()) },
    handler: async (ctx, args) => {
        // 1. Resolve Symbol
        let symbol = args.symbol;
        if (!symbol) {
            const watchlist = await ctx.db.query("user_watchlist").first();
            symbol = watchlist ? watchlist.active_symbol : "NQ";
        }

        if (!symbol) return null;

        // 2. Fetch Decision State (The Truth)
        const decision = await ctx.db
            .query("decision_state")
            .withIndex("by_symbol", (q) => q.eq("symbol", symbol as string))
            .first();

        // 3. Fetch Inputs (Signals) - optimized by symbol
        // We only care about active context (last 24h?)
        // Fetch last 20 signals and pick latest MSS/TAP
        const recentSignals = await ctx.db
            .query("signals")
            .withIndex("by_symbol_created", (q) => q.eq("symbol", symbol as string))
            .order("desc")
            .take(20);

        const latestTap = recentSignals.find(s => s.type === "TAP");
        const latestMss = recentSignals.find(s => s.type === "MSS");
        const latestSetup = recentSignals.find(s => s.type === "SETUP");

        return {
            symbol,
            decision: decision || null, // Has: verdict, confidence, stage, blockers, jury
            latestTap: latestTap || null,
            latestMss: latestMss || null,
            latestSetup: latestSetup || null,
            timestamp: Date.now()
        };
    },
});
