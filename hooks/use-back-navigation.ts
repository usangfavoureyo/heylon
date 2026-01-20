"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export function useBackNavigation(fallbackRoute: string = "/") {
    const router = useRouter();
    const pathname = usePathname();
    // Track if we have internal history to pop
    // Since Next.js doesn't expose history stack size easily, we try to use window.history.state key or length
    // A simplified approach: assume if we navigated within app, length > 1 (approx).

    // Better approach for PWA: custom stack tracking or simple "back if possible, else Replace"

    const handleBack = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.replace(fallbackRoute);
        }
    };

    return { handleBack };
}
