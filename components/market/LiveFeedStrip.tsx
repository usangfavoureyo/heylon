"use client";

import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";

interface LiveFeedStripProps {
    lastTap?: number;
    lastMss?: number;
    lastZone?: number;
    lastPriceUpdate?: number;
    className?: string;
}

export function LiveFeedStrip({ lastTap, lastMss, lastZone, lastPriceUpdate, className }: LiveFeedStripProps) {
    const [collapsed, setCollapsed] = useState(false); // Default expanded on desktop, can toggle

    return (
        <div className={cn("flex flex-col border-t border-white/5 bg-neutral-900/60 backdrop-blur-sm", className)}>
            <div
                onClick={() => setCollapsed(!collapsed)}
                className="flex items-center justify-between px-4 py-1.5 cursor-pointer hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Live Feed</span>
                </div>
                {collapsed ? <ChevronUp className="w-3 h-3 text-neutral-600" /> : <ChevronDown className="w-3 h-3 text-neutral-600" />}
            </div>

            {!collapsed && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 py-3 bg-black/20">
                    <FeedItem label="Last Price" timestamp={lastPriceUpdate} />
                    <FeedItem label="Last Zone" timestamp={lastZone} />
                    <FeedItem label="Last TAP" timestamp={lastTap} />
                    <FeedItem label="Last MSS" timestamp={lastMss} />
                </div>
            )}
        </div>
    );
}

function FeedItem({ label, timestamp }: { label: string, timestamp?: number }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase text-neutral-600 font-bold">{label}</span>
            <span className="text-[10px] font-mono text-neutral-400">
                {timestamp ? formatDistanceToNow(timestamp, { addSuffix: true }) : "---"}
            </span>
        </div>
    );
}
