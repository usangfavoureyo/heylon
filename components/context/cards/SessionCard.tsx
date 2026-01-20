"use client";

import { GlobalCard } from "@/components/ui/GlobalCard";
import { cn } from "@/lib/utils";
import { Sun, CaretDown, MoonStars } from "@phosphor-icons/react";
import { useState } from "react";

interface SessionCardProps {
    session: 'ASIA' | 'LONDON' | 'NY OPEN' | 'NY MID' | 'NY CLOSE';
    quality: 'EXPANSION' | 'CHOP' | 'DISTRIBUTION';
}

export function SessionCard({ session, quality }: SessionCardProps) {
    const [expanded, setExpanded] = useState(false);

    // Naive session icon logic
    const Icon = session === 'ASIA' ? MoonStars : Sun;

    return (
        <GlobalCard className="flex flex-col relative" noPadding>
            <div
                className="flex items-center justify-between p-4 cursor-pointer active:bg-white/5 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-neutral-400">
                        <Icon weight="bold" className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white">Session</h3>
                        <p className="text-xs font-bold tracking-wide text-neutral-400">
                            {session} • {quality}
                        </p>
                    </div>
                </div>
                <CaretDown weight="bold" className={cn("w-4 h-4 text-neutral-600 transition-transform", expanded && "rotate-180")} />
            </div>

            {/* Expanded content can be minimal or empty if not specified, but adding just to support the prop structure if needed later */}
            {expanded && (
                <div className="px-4 pb-4 pt-0 border-t border-white/5 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="mt-3 text-xs text-neutral-500">
                        Expecting {quality === 'EXPANSION' ? "directional moves" : "rotational behavior"}.
                    </div>
                </div>
            )}
        </GlobalCard>
    );
}
