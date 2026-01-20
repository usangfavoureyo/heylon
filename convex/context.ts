
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// --- RISK AGGREGATOR (The "Context Engine") ---

export const updateRiskState = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const LOOKBACK = 24 * 60 * 60 * 1000; // 24h
        const LOOKAHEAD = 2 * 60 * 60 * 1000; // 2h

        // 1. Fetch Raw Inputs
        const settings = await ctx.db.query("system_settings").first();

        // --- AppTick Check ---
        const isAppTickEnabled = settings?.apptick_enabled ?? true; // Default ON
        if (!isAppTickEnabled) {
            console.log("[Context] AppTick Skipped (Disabled in Settings)");
            return;
        }

        const recentMacro = await ctx.db
            .query("macro_events")
            .withIndex("by_time", q => q.gte("timestamp", now - LOOKAHEAD).lte("timestamp", now + LOOKAHEAD))
            .collect();

        // News logic: Fetch recent news (last 6h)
        const recentNews = await ctx.db
            .query("news_events")
            .withIndex("by_time", q => q.gte("timestamp", now - (6 * 60 * 60 * 1000)))
            .collect();

        // 2. Compute Risk & Sentiment
        let macroImpact: "LOW" | "MEDIUM" | "HIGH" = "LOW";
        let activeEvent = null;

        for (const event of recentMacro) {
            if (event.impact === "HIGH") {
                const diff = (event.timestamp - now) / 60000;
                if (Math.abs(diff) < 30) {
                    macroImpact = "HIGH";
                    activeEvent = event.title;
                    break;
                }
            }
        }

        // Compute News Sentiment
        let newsScoreTotal = 0;
        let newsHeadlines: string[] = [];
        if (recentNews.length > 0) {
            newsScoreTotal = recentNews.reduce((acc, curr) => acc + curr.sentiment_score, 0) / recentNews.length;
            newsHeadlines = recentNews.slice(0, 3).map(n => n.title);
        }

        // 3. Update Decision State for ALL Active Symbols
        const states = await ctx.db.query("decision_state").collect();

        for (const state of states) {
            // Get Current Factors
            const currentBlockers = new Set(state.blocking_factors);

            if (macroImpact === "HIGH") {
                currentBlockers.add("MACRO_RISK");
            } else {
                currentBlockers.delete("MACRO_RISK");
            }

            // Sync back to DB
            if (state.blocking_factors.length !== currentBlockers.size) {
                await ctx.db.patch(state._id, {
                    blocking_factors: Array.from(currentBlockers),
                    updatedAt: Date.now()
                });
            }

            // --- VOLATILITY ANALYSIS (Yahoo / CME) ---
            // "If API Key is available, it starts working. Else use Yahoo."

            let volatilityRegime: "LOW" | "NORMAL" | "HIGH" = "NORMAL";

            // 1. Fetch Basic Data (Yahoo)
            const marketData = await ctx.db
                .query("market_data")
                .withIndex("by_symbol", q => q.eq("symbol", state.symbol))
                .first();

            // 2. Future API Slot (CME/Massive)
            const cmeApiKey = process.env.CME_MARKET_DATA_KEY;

            if (cmeApiKey) {
                // TODO: Implement High-Fidelity Volatility/Depth Analysis
                // Example: Fetch VIX or Order Book Imbalance via internalAction
                console.log("[Context] High-Fidelity Data Enabled for", state.symbol);
                // Implementation pending API key availability
            } else {
                // FALLBACK: Yahoo Finance Volatility Heuristic
                if (marketData) {
                    const absChange = Math.abs(marketData.changePercent);
                    if (absChange > 1.5) volatilityRegime = "HIGH"; // >1.5% intraday is volatile
                    else if (absChange < 0.2) volatilityRegime = "LOW";
                }
            }

            // Upsert Context Snapshot
            const snapshotId = await ctx.db.query("context_snapshots")
                .withIndex("by_symbol_expires", q => q.eq("symbol", state.symbol).gt("expiresAt", now))
                .first();

            const snapshotData = {
                symbol: state.symbol,
                macro: activeEvent ? [{ event: activeEvent, impact: macroImpact, timestamp: now }] : [],
                news_sentiment: { score: newsScoreTotal, headlines: newsHeadlines },
                trump_sentiment: snapshotId?.trump_sentiment || { score: 0, keywords: [] },
                volatility: { regime: volatilityRegime },
                createdAt: now,
                expiresAt: now + (60 * 1000 * 5) // 5 min TTL
            };

            if (snapshotId) {
                await ctx.db.patch(snapshotId._id, snapshotData);
            } else {
                await ctx.db.insert("context_snapshots", snapshotData);
            }
        }
    }
});

export const updateTrumpSentiment = internalMutation({
    args: {
        score: v.number(),
        keywords: v.array(v.string()),
        useFallback: v.optional(v.boolean())
    },
    handler: async (ctx, args) => {
        const snapshots = await ctx.db.query("context_snapshots").withIndex("by_symbol_expires").collect();
        const now = Date.now();

        // Define Keywords for Fallback (subset)
        const FALLBACK_KEYWORDS = ["TRUMP", "TARIFF", "CHINA", "TRADE"];

        // Update ALL active snapshots
        for (const snap of snapshots) {
            if (snap.expiresAt > now) {
                let finalScore = args.score;
                let finalKeywords = args.keywords;

                // Fallback Logic: Check News Headlines if Scrape Failed
                if (args.useFallback) {
                    const headlines = snap.news_sentiment?.headlines || [];
                    const hitKw = new Set<string>();

                    headlines.forEach(h => {
                        const txt = h.toUpperCase();
                        FALLBACK_KEYWORDS.forEach(kw => {
                            if (txt.includes(kw)) hitKw.add(kw);
                        });
                    });

                    if (hitKw.size > 0) {
                        finalScore = -0.5; // Medium Risk from News Fallback
                        finalKeywords = Array.from(hitKw);
                        console.log(`[Context] Trump Fallback: Found keywords in News for ${snap.symbol}`, finalKeywords);
                    }
                }

                await ctx.db.patch(snap._id, {
                    trump_sentiment: {
                        score: finalScore,
                        keywords: finalKeywords
                    }
                });
            }
        }
    }
});
