
import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const getHistory = query({
    args: { symbol: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("signals")
            .withIndex("by_symbol_created", (q) => q.eq("symbol", args.symbol))
            .order("desc")
            .take(50);
    },
});

export const logSignal = internalMutation({
    args: {
        symbol: v.string(),
        type: v.union(v.literal("ZONE_CREATED"), v.literal("TAP"), v.literal("MSS"), v.literal("SETUP")), // STRICTLY INPUTS
        timeframe: v.string(),
        zoneId: v.optional(v.string()), // Pine GUID
        price: v.number(),
        metadata: v.any(), // raw json payload

        // Optional derived data for notifications
        title: v.optional(v.string()),
        body: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 1. Immutable Log
        const signalId = await ctx.db.insert("signals", {
            symbol: args.symbol,
            type: args.type,
            timeframe: args.timeframe,
            zoneId: args.zoneId,
            price: args.price,
            metadata: args.metadata,
            summary: args.body, // Use body as summary
            createdAt: Date.now()
        });

        // 2. Trigger Notification (if applicable)
        // Check settings first? No, we log to notifications table, UI filters.
        let urgency: "INFO" | "WARNING" | "CRITICAL" = "INFO";
        if (args.type === "MSS" || args.type === "SETUP") urgency = "WARNING";

        if (args.title && args.body) {
            // We need to implement createSystemNotification or similar in notifications.ts
            // For now, let's assume it exists or use generic insert if we knew the schema.
            // Schema: notifications { ... }
            await ctx.db.insert("notifications", {
                symbol: args.symbol,
                category: "SYSTEM", // or DECISION?
                title: args.title,
                body: args.body,
                severity: urgency,
                read: false,
                createdAt: Date.now(),
                relatedDecisionId: signalId // linking to signal as rough proxy
            });
        }
    }
});

// Stub mutations for DecisionCard UI actions
// These are placeholders since signals table doesn't have acknowledged/archived fields
export const acknowledge = mutation({
    args: { signalId: v.id("signals") },
    handler: async (ctx, args) => {
        // In future: Update signal with acknowledged: true, or insert into separate audit table
        console.log("Signal acknowledged:", args.signalId);
        return { success: true };
    }
});

export const archive = mutation({
    args: { signalId: v.id("signals") },
    handler: async (ctx, args) => {
        // In future: Update signal with archived: true, or move to archive table
        console.log("Signal archived:", args.signalId);
        return { success: true };
    }
});
