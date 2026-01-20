"use node";

import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

const TRUMP_HANDLE = "realDonaldTrump";
// Fallback ID found in documentation examples, likely Trump's
const HARDCODED_USER_ID = "107780257626128497";

const KEYWORDS = ["TARIFF", "CHINA", "TRADE", "WAR", "SANCTIONS", "FED", "RATE", "DOLLAR", "BITCOIN", "CRYPTO"];

export const fetchTruthSocial = action({
    args: {},
    handler: async (ctx) => {
        const apiKey = process.env.SCRAPE_CREATORS_API_KEY;

        if (!apiKey) {
            console.log("[Scrape] No API Key. Skipping.");
            await ctx.runMutation(internal.context.updateTrumpSentiment, {
                score: 0,
                keywords: [],
                useFallback: true
            });
            return;
        }

        try {
            // 1. Get User ID (or use hardcoded)
            // Docs say: /profile?handle=
            const profileUrl = `https://api.scrapecreators.com/v1/truthsocial/profile?handle=${TRUMP_HANDLE}`;
            let userId = HARDCODED_USER_ID;

            try {
                const profileRes = await fetch(profileUrl, { headers: { "x-api-key": apiKey } });
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    if (profileData.user_id || profileData.id) {
                        userId = profileData.user_id || profileData.id;
                    }
                }
            } catch (e) {
                console.warn("Failed to fetch profile, using hardcoded ID");
            }

            // 2. Fetch Posts
            const postsUrl = `https://api.scrapecreators.com/v1/truthsocial/user/posts?user_id=${userId}&limit=20`;
            const postsRes = await fetch(postsUrl, { headers: { "x-api-key": apiKey } });

            if (!postsRes.ok) {
                throw new Error(`Posts API Error: ${postsRes.status}`);
            }

            const postsData = await postsRes.json();
            const posts = Array.isArray(postsData) ? postsData : (postsData.response || []);

            // 3. Analyze
            let hitKeywords = new Set<string>();
            let sentiment = 0;

            // Simple Analysis: Recent 20 posts.
            // If any contain keywords, Flag it.
            posts.forEach((post: any) => {
                const content = (post.content || post.text || "").toUpperCase();
                KEYWORDS.forEach(kw => {
                    if (content.includes(kw)) {
                        hitKeywords.add(kw);
                    }
                });
            });

            if (hitKeywords.size > 0) {
                // Negative sentiment (Risk)
                sentiment = -0.8;
            }

            console.log(`[Scrape] Trump Analysis: ${hitKeywords.size} keywords found. Score: ${sentiment}`);

            await ctx.runMutation(internal.context.updateTrumpSentiment, {
                score: sentiment,
                keywords: Array.from(hitKeywords)
            });

        } catch (e) {
            console.error("[Scrape] Failed:", e);
            // Fallback
            await ctx.runMutation(internal.context.updateTrumpSentiment, {
                score: 0,
                keywords: [],
                useFallback: true
            });
        }
    }
});
