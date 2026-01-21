"use client";

import { useCallback } from "react";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type HapticType = "light" | "medium" | "heavy" | "success" | "error";

export function useHaptic() {
    const settings = useQuery(api.settings.getSettings);
    // Default to TRUE only if undefined, but if settings loaded and false, respect it.
    // Actually DEFAULT_SETTINGS says false.
    // If settings is undefined (loading), let's default to false to be safe/quiet.
    const hapticsEnabled = settings?.interaction?.haptics_enabled ?? false;

    const trigger = useCallback((type: HapticType = "light") => {
        if (typeof window === "undefined" || !window.navigator?.vibrate) return;
        if (!hapticsEnabled) return;

        switch (type) {
            case "light":
                window.navigator.vibrate(10); // Subtle Tap (Nav, Toggles)
                break;
            case "medium":
                window.navigator.vibrate(20); // Standard Tap (Buttons)
                break;
            case "heavy":
                window.navigator.vibrate(40); // Emphasis
                break;
            case "success":
                window.navigator.vibrate([10, 30, 10]); // Da-Da
                break;
            case "error":
                window.navigator.vibrate([10, 30, 10, 30, 10]); // Da-Da-Da
                break;
        }
    }, [hapticsEnabled]);

    return { trigger };
}
