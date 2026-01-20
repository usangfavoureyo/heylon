"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useHaptic } from "@/hooks/use-haptic";

const ROUTES = ["/", "/signals", "/market", "/context", "/system"];

export function useSwipeNavigation() {
    const router = useRouter();
    const pathname = usePathname();
    const { trigger } = useHaptic();

    // Refs for touch tracking
    const touchStart = useRef<number | null>(null);
    const touchEnd = useRef<number | null>(null);

    // Min swipe distance required (px) - higher = less sensitive
    const minSwipeDistance = 100;

    const onTouchStart = (e: React.TouchEvent) => {
        touchEnd.current = null;
        touchStart.current = e.targetTouches[0].clientX;
    };

    const onTouchMove = (e: React.TouchEvent) => {
        touchEnd.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = () => {
        if (!touchStart.current || !touchEnd.current) return;

        const distance = touchStart.current - touchEnd.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe || isRightSwipe) {
            const currentIndex = ROUTES.indexOf(pathname);
            if (currentIndex === -1) return; // Not on a main tab

            let nextIndex = currentIndex;

            if (isLeftSwipe) {
                // Next Tab (e.g. Decision -> Signals)
                if (currentIndex < ROUTES.length - 1) nextIndex++;
            } else if (isRightSwipe) {
                // Prev Tab
                if (currentIndex > 0) nextIndex--;
            }

            if (nextIndex !== currentIndex) {
                // trigger('light'); // Optional Haptic
                router.push(ROUTES[nextIndex]);
            }
        }
    };

    return {
        onTouchStart,
        onTouchMove,
        onTouchEnd
    };
}
