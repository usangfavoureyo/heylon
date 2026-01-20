import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get Watchlist State (Singleton)
export const get = query({
    handler: async (ctx) => {
        const state = await ctx.db.query("user_watchlist").first();
        // Return default if empty
        return state || { symbols: ["ES", "NQ"], active_symbol: "NQ" };
    },
});

// Set Active Symbol (Swipe Left / Target Icon)
export const setActiveSymbol = mutation({
    args: { symbol: v.string() },
    handler: async (ctx, args) => {
        const state = await ctx.db.query("user_watchlist").first();
        if (state) {
            await ctx.db.patch(state._id, { active_symbol: args.symbol });
        } else {
            // Init if missing
            await ctx.db.insert("user_watchlist", {
                symbols: ["ES", "NQ", args.symbol], // Ensure it's in list
                active_symbol: args.symbol,
            });
        }
    },
});

// Add/Remove Symbol (Swipe Right / Bookmark Icon)
export const toggleSymbol = mutation({
    args: { symbol: v.string() },
    handler: async (ctx, args) => {
        const state = await ctx.db.query("user_watchlist").first();

        if (!state) {
            await ctx.db.insert("user_watchlist", {
                symbols: ["ES", "NQ", args.symbol],
                active_symbol: "NQ",
            });
            return;
        }

        const exists = state.symbols.includes(args.symbol);
        let newSymbols = [...state.symbols];

        if (exists) {
            // Remove (Prevent removing the last active one effectively? Logic: just remove)
            newSymbols = newSymbols.filter(s => s !== args.symbol);
        } else {
            // Add
            newSymbols.push(args.symbol);
        }

        await ctx.db.patch(state._id, { symbols: newSymbols });
    },
});
