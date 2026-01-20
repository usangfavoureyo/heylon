"use node";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import webpush from "web-push";

export const broadcastPush = internalAction({
    args: {
        title: v.string(),
        body: v.string(),
        tag: v.optional(v.string()),
        url: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
        const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

        if (!vapidPublicKey || !vapidPrivateKey) {
            console.error("Missing VAPID Keys. Cannot send push.");
            return;
        }

        webpush.setVapidDetails(
            "mailto:admin@heylon.com",
            vapidPublicKey,
            vapidPrivateKey
        );

        // Call the internal query to get subscriptions
        const subscriptions = await ctx.runQuery(internal.push.getSubscriptions);

        const payload = JSON.stringify({
            title: args.title,
            body: args.body,
            tag: args.tag,
            url: args.url,
            // Custom vibration pattern support handled by SW based on payload presence usually,
            // but here we just send data. SW controls vibration.
        });

        const results = await Promise.allSettled(
            subscriptions.map(sub =>
                webpush.sendNotification(
                    { endpoint: sub.endpoint, keys: sub.keys },
                    payload
                )
            )
        );

        // Cleanup invalid subs logic could go here (410 Gone)
        const failed = results.filter(r => r.status === "rejected");
        if (failed.length > 0) {
            console.log(`Push Broadcast: ${subscriptions.length - failed.length} sent, ${failed.length} failed.`);
        }
    }
});
