"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * ThemeSync Component
 * 
 * This component syncs the Convex system_settings.appearance value
 * with the next-themes provider. It runs as a background effect and
 * updates the theme whenever the Convex setting changes.
 */
export function ThemeSync() {
    const { setTheme } = useTheme();
    const settings = useQuery(api.settings.getSettings);

    useEffect(() => {
        if (!settings?.appearance) return;

        // Map Convex appearance values to next-themes values
        const themeMap: Record<string, string> = {
            DARK: "dark",
            LIGHT: "light",
            SYSTEM: "system",
        };

        const mappedTheme = themeMap[settings.appearance] || "dark";
        setTheme(mappedTheme);
    }, [settings?.appearance, setTheme]);

    // This component doesn't render anything - it's just for syncing
    return null;
}
