"use client";

import { useState, useEffect } from "react";

export function Clock() {
    // Client-side only time rendering to avoid hydration mismatch
    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!currentTime) {
        return <div className="h-8 w-32 bg-neutral-900/50 rounded animate-pulse" />;
    }

    return (
        <div className="flex flex-col items-end">
            <div className="text-xs font-medium text-amber-500 tracking-wider mb-1">
                MARKET TIME (EST)
            </div>
            <div className="text-sm font-medium text-foreground tabular-nums leading-none">
                {currentTime.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false, hour: '2-digit', minute: '2-digit' })} <span className="text-xs text-muted-foreground">EST</span>
            </div>
        </div>
    );
}
