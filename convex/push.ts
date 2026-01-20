import { mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// 1. SAVE SUBSCRIPTION
export const subscribe = mutation({
    args: {
        endpoint: v.string(),
        keys: v.object({
            p256dh: v.string(),
            auth: v.string(),
        }),
        deviceInfo: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("push_subscriptions")
            .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                keys: args.keys,
                updatedAt: Date.now(),
            });
        } else {
            await ctx.db.insert("push_subscriptions", {
                endpoint: args.endpoint,
                keys: args.keys,
                deviceInfo: args.deviceInfo,
                updatedAt: Date.now(),
            });
        }
    },
});

// 2. GET SUBSCRIPTIONS (Internal)
export const getSubscriptions = internalQuery({
    handler: async (ctx) => {
        return await ctx.db.query("push_subscriptions").collect();
    }
});

// 3. SEND TEST PUSH (Dev Utility)
import { internal } from "./_generated/api";
export const sendTestPush = mutation({
    args: {},
    handler: async (ctx) => {
        await ctx.scheduler.runAfter(0, internal.actions.push.broadcastPush, {
            title: "Test Notification",
            body: "This is a test message from Heylon System.",
            tag: "test",
            url: "/system/notifications"
        });
    }
});
