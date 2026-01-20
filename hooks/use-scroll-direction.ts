"use client";

import { useState, useEffect } from "react";

export function useScrollDirection(elementRef?: React.RefObject<HTMLElement | null>) {
    const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");

    useEffect(() => {
        const target = elementRef?.current || window;
        let lastScrollY = elementRef?.current ? elementRef.current.scrollTop : window.scrollY;

        const updateScrollDirection = () => {
            const scrollY = elementRef?.current ? elementRef.current.scrollTop : window.scrollY;
            const direction = scrollY > lastScrollY ? "down" : "up";

            // Only update state if direction changes and we moved enough (>10px) 
            // Also always show at very top (<50px)
            if (scrollY < 50) {
                setScrollDirection("up");
            } else if (
                direction !== scrollDirection &&
                Math.abs(scrollY - lastScrollY) > 10
            ) {
                setScrollDirection(direction);
            }

            lastScrollY = scrollY > 0 ? scrollY : 0;
        };

        target.addEventListener("scroll", updateScrollDirection);
        return () => target.removeEventListener("scroll", updateScrollDirection);
    }, [scrollDirection, elementRef]);

    return scrollDirection;
}
