"use client";

import { useCallback } from "react";

type HapticType = "light" | "medium" | "heavy" | "success" | "error";

export function useHaptic() {
    const trigger = useCallback((type: HapticType = "light") => {
        if (typeof window === "undefined" || !window.navigator?.vibrate) return;

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
    }, []);

    return { trigger };
}
