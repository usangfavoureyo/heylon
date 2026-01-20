import { query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    args: { symbol: v.string() },
    handler: async (ctx, args) => {
        // 1. Get Decision State
        const state = await ctx.db
            .query("decision_state")
            .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
            .first();

        // 2. Get Context Snapshot
        // Use by_symbol_expires to get the latest valid snapshot
        const now = Date.now();
        const snapshot = await ctx.db
            .query("context_snapshots")
            .withIndex("by_symbol_expires", (q) => q.eq("symbol", args.symbol).gt("expiresAt", now))
            .first();

        // 3. Fallbacks and Mapping
        // Map 'decision' (BUY/SELL/WAIT/IDLE) to 'bias' (BULLISH/BEARISH/NEUTRAL)
        let bias = "NEUTRAL";
        if (state?.decision === "BUY") bias = "BULLISH";
        if (state?.decision === "SELL") bias = "BEARISH";

        // Map 'news' from snapshot
        const newsScore = snapshot?.news_sentiment?.score || 0;
        let newsSentiment = "NEUTRAL";
        if (newsScore > 0.2) newsSentiment = "POSITIVE";
        if (newsScore < -0.2) newsSentiment = "NEGATIVE";

        // Map 'macro'
        // Snapshot stores 'macro' as array of active events
        const activeMacro = snapshot?.macro?.[0];

        return {
            market: {
                bias: bias,
                structure: "RANGING", // Not yet in decision_state
                aligned: (state?.confidence || 0) > 0.8
            },
            macro: {
                nextEvent: activeMacro ? {
                    id: "active",
                    name: activeMacro.event,
                    time: new Date(activeMacro.timestamp).toISOString(),
                    impact: activeMacro.impact
                } : null,
                riskState: activeMacro?.impact === "HIGH" ? "HIGH" : "LOW",
            },
            news: {
                sentiment: newsSentiment,
                confidence: "MEDIUM",
                themes: snapshot?.news_sentiment?.headlines || []
            },
            politics: {
                term: "TRUMP",
                score: snapshot?.trump_sentiment?.score || 0,
                risk: "NEUTRAL"
            },
            volatility: {
                regime: snapshot?.volatility?.regime || "NORMAL",
                liquidity: "NORMAL"
            },
            session: {
                name: "Calculate Client Side",
                quality: "NORMAL"
            },
            overall_summary: state?.analysis || "Waiting for data..."
        };
    },
});
