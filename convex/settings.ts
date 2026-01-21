

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

        // Sections that require deep merging (to prevent overwriting with partial updates)
        const DEEP_MERGE_KEYS = [
            "interaction",
            "trading",
            "engine",
            "zoning",
            "risk",
            "symbol",
            "data",
            "safety",
            "notif_categories",
            "layers_structural",
            "layers_context",
            "consensus_models"
        ];

        // Prepare the updates from args
        const updates: any = {};
        for (const [key, value] of Object.entries(args)) {
            if (value !== undefined) updates[key] = value;
        }

        const timestamp = Date.now();

        if (existing) {
            const { _id, _creationTime, ...currentData } = existing;

            // Start with defaults + existing data
            const newDoc: any = {
                ...DEFAULT_SETTINGS,
                ...currentData,
                updatedAt: timestamp
            };

            // Apply updates with Deep Merge for specific sections
            for (const key of Object.keys(updates)) {
                if (DEEP_MERGE_KEYS.includes(key) && typeof updates[key] === 'object' && updates[key] !== null) {
                    // Deep Merge: (Default + Existing) + Update
                    newDoc[key] = {
                        ...(DEFAULT_SETTINGS as any)[key], // Ensure defaults exist
                        ...(currentData as any)[key],      // Override with existing saved data
                        ...updates[key]                    // Apply partial updates
                    };
                } else {
                    // Simple replacement for primitives (appearance, booleans, etc.)
                    newDoc[key] = updates[key];
                }
            }

            await ctx.db.replace(_id, newDoc);
        } else {
            // New Insert: Use Defaults + Updates
            // We still need to careful with updates being partial
            const newDoc: any = { ...DEFAULT_SETTINGS, updatedAt: timestamp };

            for (const key of Object.keys(updates)) {
                if (DEEP_MERGE_KEYS.includes(key) && typeof updates[key] === 'object' && updates[key] !== null) {
                    newDoc[key] = {
                        ...(DEFAULT_SETTINGS as any)[key],
                        ...updates[key]
                    };
                } else {
                    newDoc[key] = updates[key];
                }
            }

            await ctx.db.insert("system_settings", newDoc);
        }
    }
});
