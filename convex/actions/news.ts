"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

// Simple Sentiment Dict (Fallback)
const POSITIVE_WORDS = ["surge", "jump", "rally", "beat", "record", "optimism", "growth", "cut rates"];
const NEGATIVE_WORDS = ["crash", "slump", "miss", "recession", "tumble", "fear", "inflation", "hike", "war"];

function calculateSentiment(text: string): number {
    let score = 0;
    const lower = text.toLowerCase();

    POSITIVE_WORDS.forEach(w => { if (lower.includes(w)) score += 0.2; });
    NEGATIVE_WORDS.forEach(w => { if (lower.includes(w)) score -= 0.25; }); // Fear hits harder

    return Math.max(-1, Math.min(1, score));
}

export const fetchNews = internalAction({
    args: {},
    handler: async (ctx) => {
        const apiKey = process.env.NEWS_API_KEY;
        if (!apiKey) {
            console.log("No NEWS_API_KEY found. Skipping news fetch.");
            return;
        }

        console.log("Fetching News...");

        // Example: NewsAPI.org (Replace with specific specialized provider URL)
        // Query: "economy OR inflation OR fed"
        const url = `https://newsapi.org/v2/top-headlines?category=business&country=us&apiKey=${apiKey}`;

        try {
            const res = await fetch(url);
            const data = await res.json();

            if (data.status !== "ok") throw new Error(data.message || "API Error");

            const articles = data.articles.slice(0, 10).map((a: any) => {
                const sentiment = calculateSentiment((a.title + " " + (a.description || "")).toLowerCase());

                return {
                    title: a.title,
                    description: a.description || "No description.",
                    url: a.url,
                    source: a.source.name,
                    published_at: a.publishedAt,
                    sentiment_score: sentiment,
                    impact_rating: Math.abs(sentiment) > 0.5 ? "HIGH" : "MEDIUM" as const
                };
            });

            // Store in DB
            await ctx.runMutation(internal.context_actions.storeNewsbatch, { articles });
            console.log(`Fetched and processed ${articles.length} articles.`);

        } catch (e) {
            console.error("News Fetch Failed:", e);
        }
    }
});
