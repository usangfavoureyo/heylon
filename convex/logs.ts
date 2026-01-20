
import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// 1. QUERY LOGS (Frontend View)
export const getLogs = query({
    args: {
        symbol: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let q = ctx.db.query("learning_logs").withIndex("by_symbol");

        if (args.symbol && args.symbol !== "ALL") {
            q = q.filter(q => q.eq(q.field("symbol"), args.symbol));
        }

        return await q.order("desc").take(args.limit || 50);
    }
});

// 2. USER ANNOTATION (Outcome & Notes)
export const updateOutcome = mutation({
    args: {
        id: v.id("learning_logs"),
        outcome: v.union(v.literal("WIN"), v.literal("LOSS"), v.literal("NEUTRAL")),
        notes: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            outcome: args.outcome,
            notes: args.notes
        });
    }
});

// 3. SYSTEM LOGGING (Called by Engine when Decision enters FINAL stage)
export const logDecision = internalMutation({
    args: {
        symbol: v.string(),
        decision: v.union(v.literal("BUY"), v.literal("SELL"), v.literal("WAIT")),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("learning_logs", {
            symbol: args.symbol,
            decision: args.decision,
            outcome: "NEUTRAL", // Default pending state
            notes: "",
            createdAt: Date.now(),
        });
    }
});
