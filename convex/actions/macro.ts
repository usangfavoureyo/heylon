"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import Parser from "rss-parser";

const parser = new Parser();

export const fetchCalendar = internalAction({
    args: {},
    handler: async (ctx) => {
        console.log("Fetching Economic Calendar (Myfxbook)...");
        const RSS_URL = "https://www.myfxbook.com/rss/forex-economic-calendar-events";

        try {
            const feed = await parser.parseURL(RSS_URL);

            // Transform to Schema
            const events = feed.items.map(item => {
                // Description usually contains "High Impact", "USD", etc.
                // We need to parse description snippet if possible, or rely on title
                // MyFxBook Title format: "USD: Fed Interest Rate Decision"

                const title = item.title || "Unknown";
                const parts = title.split(":");
                const currency = parts.length > 0 ? parts[0].trim() : "ALL";

                // Heuristic for Impact if not in metadata (Myfxbook RSS is limited)
                // Filter for major currencies
                if (!["USD", "EUR", "JPY", "GBP"].includes(currency)) return null;

                const lowerTitle = title.toLowerCase();
                let impact: "LOW" | "MEDIUM" | "HIGH" = "LOW";

                if (lowerTitle.includes("rate") || lowerTitle.includes("cpi") || lowerTitle.includes("nfp") || lowerTitle.includes("gdp")) {
                    impact = "HIGH";
                } else if (lowerTitle.includes("pmi") || lowerTitle.includes("sales")) {
                    impact = "MEDIUM";
                }

                return {
                    title: title,
                    currency: currency,
                    impact: impact,
                    timestamp: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
                    // RSS doesn't give Forecast/Actual easily without scraping
                    previous: "-",
                    forecast: "-",
                    actual: "-"
                };
            }).filter(e => e !== null); // Remove nulls

            if (events.length > 0) {
                await ctx.runMutation(internal.context_actions.storeMacroBatch, { events }); // Calling mutation in context_actions
                console.log(`Fetched ${events.length} macro events.`);
            }

        } catch (e) {
            console.error("Macro Fetch Error:", e);
        }
    }
});
