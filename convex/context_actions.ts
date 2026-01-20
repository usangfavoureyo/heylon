import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

// --- MUTATIONS ---

export const storeNewsbatch = internalMutation({
    args: {
        articles: v.array(v.object({
            title: v.string(),
            description: v.string(),
            url: v.string(),
            source: v.string(),
            published_at: v.string(),
            sentiment_score: v.number(),
            impact_rating: v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH"))
        }))
    },
    handler: async (ctx, args) => {
        // Upsert logic could go here, or simple insert
        // For now, just insert.
        for (const article of args.articles) {
            await ctx.db.insert("news_events", {
                title: article.title,
                description: article.description,
                url: article.url,
                source: article.source,
                published_at: article.published_at,
                sentiment_score: article.sentiment_score,
                impact_rating: article.impact_rating,
                timestamp: Date.now()
            });
        }
    }
});

export const storeMacroBatch = internalMutation({
    args: {
        events: v.array(v.object({
            title: v.string(),
            currency: v.string(),
            impact: v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH")),
            timestamp: v.number(),
            previous: v.string(),
            forecast: v.string(),
            actual: v.string()
        }))
    },
    handler: async (ctx, args) => {
        for (const event of args.events) {
            await ctx.db.insert("macro_events", {
                title: event.title,
                currency: event.currency,
                impact: event.impact,
                timestamp: event.timestamp,
                previous: event.previous,
                forecast: event.forecast,
                actual: event.actual
            });
        }
    }
});

