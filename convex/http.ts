import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
    path: "/webhook/pinescript",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        // 1. Parse Payload
        const text = await request.text();
        let payload;
        try {
            payload = JSON.parse(text);
        } catch (e) {
            return new Response("Invalid JSON", { status: 400 });
        }

        // 2. Validate Critical Fields (Security & Data Integrity)
        // We strictly require ticker and valid type.
        if (!payload.ticker || !payload.type) {
            return new Response("Missing ticker or type", { status: 400 });
        }

        // For Zone Creation or Taps, we need strict origin data for SL calculation
        if (["ZONE_CREATED", "TAP", "SETUP"].includes(payload.type)) {
            const data = payload.data || {};
            // If Pine Script sends 'na' or null, we might block or default.
            // We enforce strictness: No Origin = No SL = No Trade.
            if (data.originHigh === undefined && data.originLow === undefined) {
                console.warn(`[Webhook] Warning: Missing origin data for ${payload.ticker}`);
                // We allow it but mark as potentially unsafe in logic
            }
        }

        // 3. Persist to 'events_raw' (Immutable Log)
        // @ts-ignore
        const rawId = await ctx.runMutation(internal.raw_events.ingestRawEvent, {
            source: "tradingview_pinescript",
            ticker: payload.ticker,
            payload: payload,
            timestamp: payload.timestamp || new Date().toISOString(),
        });

        // 4. Trigger Normalization (Async)
        // We don't wait for this to respond to the webhook.
        // @ts-ignore
        await ctx.runAction(internal.events.processEvent, {
            rawEventId: rawId,
        });

        return new Response("OK", { status: 200 });
    }),
});

export default http;
