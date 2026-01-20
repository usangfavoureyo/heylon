import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // 1. DECISION STATE (Active Symbol Only - Single Source of Truth)
    market_data: defineTable({
        symbol: v.string(), // "ES", "NQ"
        price: v.number(),
        change: v.number(),
        changePercent: v.number(),
        lastUpdated: v.number(),
    }).index("by_symbol", ["symbol"]),

    decision_state: defineTable({
        symbol: v.string(), // e.g. "NQ"
        stage: v.union(v.literal("IDLE"), v.literal("PRELIMINARY"), v.literal("FINAL")),
        decision: v.union(v.literal("IDLE"), v.literal("WAIT"), v.literal("BIAS"), v.literal("BUY"), v.literal("SELL")),
        confidence: v.number(), // 0.00 - 1.00
        analysis: v.string(),
        viability_score: v.optional(v.number()),

        // Active Trigger Details
        trigger: v.object({
            type: v.union(v.literal("NONE"), v.literal("TAP"), v.literal("MSS")),
            eventId: v.optional(v.string()) // Link to signals table
        }),

        // Reasoning
        supporting_factors: v.array(v.string()),
        blocking_factors: v.array(v.string()),

        // Jury Context (Live)
        jury: v.object({
            openai: v.optional(v.union(v.literal("BUY"), v.literal("SELL"), v.literal("WAIT"))),
            gemini: v.optional(v.union(v.literal("BUY"), v.literal("SELL"), v.literal("WAIT"))),
            perplexity: v.optional(v.union(v.literal("BUY"), v.literal("SELL"), v.literal("WAIT"))),
            consensus: v.union(v.literal("IDLE"), v.literal("BUY"), v.literal("SELL"), v.literal("WAIT")),
            votes: v.any(),
            explanation: v.optional(v.string()),
            lastVoteTime: v.optional(v.number())
        }),

        expiry: v.number(), // unix timestamp
        updatedAt: v.number(),
    }).index("by_symbol", ["symbol"]),

    // 2. SIGNALS (Event Stream - Immutable History)
    signals: defineTable({
        symbol: v.string(),
        type: v.union(v.literal("ZONE_CREATED"), v.literal("TAP"), v.literal("MSS"), v.literal("SETUP"), v.literal("ZONE_BROKEN")),
        timeframe: v.string(), // "1H", "4H"
        zoneId: v.optional(v.string()), // GUID from Pine

        price: v.number(),
        metadata: v.any(), // raw PineScript payload json
        summary: v.optional(v.string()), // Human readable
        createdAt: v.number()
    }).index("by_symbol_created", ["symbol", "createdAt"]),



    // 4. SYSTEM SETTINGS (Constraints Only)
    system_settings: defineTable({
        // 1. APPEARANCE
        appearance: v.string(), // "LIGHT", "DARK", "SYSTEM"

        // 2. INTERACTION & FEEDBACK
        interaction: v.object({
            haptics_enabled: v.boolean(),
            haptics_critical_only: v.boolean(),
            motion_reduced: v.boolean(),
        }),

        // 3. TRADING SESSION
        trading: v.object({
            session_presets: v.string(), // "LONDON", "NY_AM", "NY_PM", "CUSTOM"
            sessionStart: v.string(), // "HH:MM"
            sessionEnd: v.string(),   // "HH:MM"
            timezone: v.string(),     // "Africa/Lagos"
            auto_wait_outside_session: v.boolean(),
            microMss: v.boolean(),
            structuralMss: v.boolean(),
            forceWait: v.boolean(),
            sessionFilter: v.boolean(),
        }),


        // 4. ENTRY LOGIC
        engine: v.object({
            mss_mode: v.union(v.literal("MICRO"), v.literal("STRUCTURAL")),
            tap_action_policy: v.union(v.literal("ADVISORY"), v.literal("ACTIONABLE")),
        }),

        // 5. ZONE HANDLING
        zoning: v.object({
            viability_threshold: v.union(v.literal("CONSERVATIVE"), v.literal("BALANCED"), v.literal("AGGRESSIVE")),
            untapped_zone_policy: v.union(v.literal("IGNORE_AFTER_1"), v.literal("ARCHIVE")),
        }),

        // 6. RISK & DISCIPLINE
        risk: v.object({
            max_confirm_signals: v.union(v.float64(), v.literal("UNLIMITED")), // number or string
            cooldown_minutes: v.number(),
            consecutive_wait_lock: v.number(),
        }),

        // 7. SYMBOL CONTROL
        symbol: v.object({
            auto_switch_symbol: v.boolean(),
            lock_active_symbol: v.boolean(),
            reset_on_switch: v.boolean(),
        }),

        // 8. DATA FRESHNESS
        data: v.object({
            context_refresh: v.union(v.literal("REALTIME"), v.literal("HYBRID"), v.literal("TIMED")),
            news_sensitivity: v.union(v.literal("STRICT"), v.literal("BALANCED"), v.literal("LENIENT")),
        }),

        // 9. SAFETY & RECOVERY
        safety: v.object({
            force_wait_killswitch: v.boolean(),
            auto_recover: v.boolean(),
        }),

        // Legacy / Other (Keep needed ones)
        apptick_enabled: v.boolean(),

        // Notifications & Layers Config (Can be kept if used by other pages)
        notif_channel_push: v.boolean(), // Master toggle
        notif_categories: v.any(), // Flexible dict for routing matrix
        layers_structural: v.any(),
        layers_context: v.any(),

        // Context Configuration
        political_risk_keywords: v.array(v.string()), // ["Trump", "China", ...]

        updatedAt: v.optional(v.number()),
    }),

    // 5. CONTEXT SNAPSHOTS (Time-boxed World State)
    context_snapshots: defineTable({
        symbol: v.string(),

        macro: v.array(v.object({
            event: v.string(),
            impact: v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH")),
            timestamp: v.number()
        })),

        news_sentiment: v.object({
            score: v.number(),
            headlines: v.array(v.string())
        }),

        trump_sentiment: v.object({
            score: v.number(),
            keywords: v.array(v.string())
        }),

        volatility: v.object({
            regime: v.union(v.literal("LOW"), v.literal("NORMAL"), v.literal("HIGH"))
        }),

        expiresAt: v.number(),
        createdAt: v.number()
    })
        .index("by_symbol_expires", ["symbol", "expiresAt"])
        .index("by_symbol", ["symbol"]),

    // 6. LEARNING LOGS (Post-Hoc Audit)
    learning_logs: defineTable({
        symbol: v.string(),
        decision: v.union(v.literal("BUY"), v.literal("SELL"), v.literal("WAIT")),
        outcome: v.union(v.literal("WIN"), v.literal("LOSS"), v.literal("NEUTRAL")),

        notes: v.optional(v.string()),

        // Full forensic snapshot could be embedded here or linked, keeping simple as req
        createdAt: v.number()
    }).index("by_symbol", ["symbol"]),

    // --- LEGACY / HELPER TABLES (Preserved for now but should migrate) ---
    // Keeping push_subscriptions for Notification System
    push_subscriptions: defineTable({
        userId: v.optional(v.string()),
        endpoint: v.string(),
        keys: v.object({
            p256dh: v.string(),
            auth: v.string(),
        }),
        deviceInfo: v.optional(v.string()),
        updatedAt: v.number(),
    }).index("by_endpoint", ["endpoint"]),

    // Keeping raw logs for debugging
    events_raw: defineTable({
        source: v.string(),
        ticker: v.string(),
        payload: v.any(),
        timestamp: v.string(),
        received_at: v.number(),
        processed: v.boolean(),
    }).index("by_processed", ["processed"]),

    // 7. MACRO & NEWS EVENTS (Context Sources)
    macro_events: defineTable({
        title: v.string(),
        currency: v.string(),
        impact: v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH")),
        timestamp: v.number(),
        previous: v.string(),
        forecast: v.string(),
        actual: v.string()
    }).index("by_time", ["timestamp"]),

    news_events: defineTable({
        title: v.string(),
        description: v.string(),
        url: v.string(),
        source: v.string(),
        published_at: v.string(),
        sentiment_score: v.number(),
        impact_rating: v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH")),
        timestamp: v.number()
    }).index("by_time", ["timestamp"]),

    // 8. USER WATCHLIST (Singleton for now)
    user_watchlist: defineTable({
        symbols: v.array(v.string()), // e.g. ["ES", "NQ"]
        active_symbol: v.string(), // e.g. "NQ"
    }),

    notifications: defineTable({
        relatedDecisionId: v.optional(v.id("signals")),
        symbol: v.optional(v.string()),
        category: v.string(), // "SIGNAL" | "SYSTEM"
        severity: v.union(v.literal("INFO"), v.literal("WARNING"), v.literal("CRITICAL")),
        title: v.string(),
        body: v.string(),
        read: v.boolean(),
        createdAt: v.number(),
    }).index("by_created", ["createdAt"]),
});
