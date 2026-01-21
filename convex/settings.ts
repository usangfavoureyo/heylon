

import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";

const DEFAULT_SETTINGS = {
    appearance: "DARK", // "LIGHT" | "DARK" | "SYSTEM"

    // App Control
    apptick_enabled: true,

    // 1. Interaction
    interaction: {
        haptics_enabled: false,
        haptics_critical_only: false,
        motion_reduced: false,
    },

    // 2. Trading Session
    trading: {
        session_presets: "CUSTOM",
        sessionStart: "14:30",
        sessionEnd: "22:00",
        timezone: "Africa/Lagos",
        auto_wait_outside_session: true,
        // Legacy fields for compat if needed, but we are moving to new structure
        forceWait: false,
        sessionFilter: true,
        microMss: true,
        structuralMss: false
    },

    // 3. Engine
    engine: {
        mss_mode: "MICRO",
        tap_action_policy: "ADVISORY"
    },

    // 4. Zoning
    zoning: {
        viability_threshold: "BALANCED",
        untapped_zone_policy: "IGNORE_AFTER_1"
    },

    // 5. Risk
    risk: {
        max_confirm_signals: 1,
        cooldown_minutes: 0,
        consecutive_wait_lock: 3
    },

    // 6. Symbol
    symbol: {
        auto_switch_symbol: false,
        lock_active_symbol: false,
        reset_on_switch: true
    },

    // 7. Data
    data: {
        context_refresh: "HYBRID",
        news_sensitivity: "BALANCED"
    },

    // 8. Safety
    safety: {
        force_wait_killswitch: false,
        auto_recover: true
    },

    // Notification Channels
    notif_channel_push: false,
    notif_categories: {
        trade_confirm: { push: true, inapp: true },
        advisory: { push: true, inapp: false },
        macro: { push: false, inapp: true },
        risk: { push: true, inapp: true },
        system: { push: false, inapp: true }
    },

    // Layers
    layers_structural: {
        market_direction: true,
        market_structure: true,
        zones: true,
        volatility: true,
        session: true
    },
    layers_context: {
        news: true,
        macro: true,
        political: false
    },

    // Consensus
    consensus_enabled: true,
    consensus_models: {
        openai: true,
        gemini: true,
        perplexity: true
    },

    // Context Configuration
    political_risk_keywords: ["Tariffs", "China", "Trump", "Trade War", "Sanctions"],
};

export const getSettings = query({
    handler: async (ctx) => {
        const settings = await ctx.db.query("system_settings").first();
        if (!settings) {
            return { ...DEFAULT_SETTINGS, _id: "default", updatedAt: Date.now() };
        }
        // Deep merge is safer but shallow merge handles top-level keys
        return { ...DEFAULT_SETTINGS, ...settings };
    },
});

export const getSettingsInternal = internalQuery({
    handler: async (ctx) => {
        const settings = await ctx.db.query("system_settings").first();
        return settings || { ...DEFAULT_SETTINGS, updatedAt: Date.now() };
    }
});

// Generic Update Mutation for any section
export const updateSettings = mutation({
    args: {
        appearance: v.optional(v.string()),
        apptick_enabled: v.optional(v.boolean()),

        interaction: v.optional(v.any()), // Nested object replacement
        trading: v.optional(v.any()),
        engine: v.optional(v.any()),
        zoning: v.optional(v.any()),
        risk: v.optional(v.any()),
        symbol: v.optional(v.any()),
        data: v.optional(v.any()),
        safety: v.optional(v.any()),

        notif_channel_push: v.optional(v.boolean()),
        notif_categories: v.optional(v.any()),
        layers_structural: v.optional(v.any()),
        layers_context: v.optional(v.any()),
        consensus_enabled: v.optional(v.boolean()),
        consensus_models: v.optional(v.any()),
        political_risk_keywords: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.query("system_settings").first();

        // Prepare the updates from args
        const updates: any = {};
        for (const [key, value] of Object.entries(args)) {
            if (value !== undefined) updates[key] = value;
        }

        const timestamp = Date.now();

        if (existing) {
            // "Repair" Strategy: Ensure the final document has ALL default fields + existing data + updates.
            // We use 'replace' to enforce structural integrity.
            // We must exclude system fields (_id, _creationTime) from the new value.
            const { _id, _creationTime, ...currentData } = existing;

            // Merge order: Defaults -> Existing (keep user data) -> Updates (new changes)
            // Note: This cleanup ensures that if Schema requires fields missing in 'currentData', Defaults fill them.
            // IF 'currentData' has extra fields not in schema, 'replace' will fail? 
            // Ideally we only keep keys that match DEFAULT_SETTINGS or known schema. 
            // For now, simple merge is likely sufficient unless 'currentData' has huge legacy garbage.

            const newDoc = {
                ...DEFAULT_SETTINGS,
                ...currentData,
                ...updates,
                updatedAt: timestamp
            };

            await ctx.db.replace(_id, newDoc);
        } else {
            await ctx.db.insert("system_settings", {
                ...DEFAULT_SETTINGS,
                ...updates,
                updatedAt: timestamp
            });
        }
    }
});
