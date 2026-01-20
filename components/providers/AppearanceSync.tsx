"use client";

import { useTheme } from "next-themes";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function AppearanceSync() {
    const { setTheme } = useTheme();
    const settings = useQuery(api.settings.getSettings);

    useEffect(() => {
        if (settings?.appearance) {
            const val = settings.appearance.toLowerCase(); // "light", "dark", "system"
            setTheme(val);
        }
    }, [settings?.appearance, setTheme]);

    return null; // Headless component
}
