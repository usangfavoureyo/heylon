import { query, internalMutation, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const getRecent = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("notifications")
            .withIndex("by_created")
            .order("desc")
            .take(20);
    },
});

export const getUnreadCount = query({
    handler: async (ctx) => {
        // Since no index on 'read', fetch recent 20 and count, or filtered if we add index
        // For now, simple scan of recent is enough for UI badge
        const notes = await ctx.db
            .query("notifications")
            .withIndex("by_created")
            .order("desc")
            .take(50);
        return notes.filter(n => !n.read).length;
    }
});

export const markRead = mutation({
    args: { id: v.id("notifications") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { read: true });
    }
});

export const remove = mutation({
    args: { id: v.id("notifications") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    }
});

// Internal: Derived from Signals
export const logNotification = internalMutation({
    args: {
        signalId: v.optional(v.id("signals")),
        symbol: v.string(),
        urgency: v.union(v.literal("INFO"), v.literal("WARNING"), v.literal("CRITICAL")),
        title: v.string(),
        body: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("notifications", {
            relatedDecisionId: args.signalId, // mapping signalId to relatedDecisionId
            symbol: args.symbol,
            category: "SIGNAL",
            severity: args.urgency,
            title: args.title,
            body: args.body,
            read: false,
            createdAt: Date.now(),
        });

        // Trigger Push
        if (args.urgency === "CRITICAL" || args.urgency === "WARNING") {
            // We can't call action directly from mutation?
            // Actually we CAN if we use ctx.scheduler.
            // But actions can be called from mutations via ctx.scheduler

            // Wait, internalAction CAN be scheduled.
            await ctx.scheduler.runAfter(0, internal.actions.push.broadcastPush, {
                title: args.title,
                body: args.body,
                tag: args.symbol
            });
        }
    }
});

export const createSystemNotification = internalMutation({
    args: {
        title: v.string(),
        body: v.string(),
        urgency: v.union(v.literal("INFO"), v.literal("WARNING"), v.literal("CRITICAL")),
        symbol: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("notifications", {
            symbol: args.symbol,
            category: "SYSTEM",
            title: args.title,
            body: args.body,
            severity: args.urgency,
            read: false,
            createdAt: Date.now()
        });
    }
});
