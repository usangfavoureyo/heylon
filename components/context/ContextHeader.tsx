"use client";

import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ContextHeaderProps {
    symbol: string;
    lastUpdated: number;
}

export function ContextHeader({ symbol, lastUpdated }: ContextHeaderProps) {
    return (
        <div className="flex flex-col items-center justify-center py-6">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">{symbol}</h1>
            <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-neutral-800 border border-white/5 text-[10px] font-bold text-neutral-400 tracking-wider">
                    CONTEXT SNAPSHOT
                </span>
                <span className="text-[10px] font-medium text-neutral-600 uppercase tracking-wide">
                    Updated {formatDistanceToNow(lastUpdated)} ago
                </span>
            </div>
        </div>
    );
}
