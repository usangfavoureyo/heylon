"use client";

import { GlobalCard } from "@/components/ui/GlobalCard";
import { cn } from "@/lib/utils";
import { TrendUp, TrendDown, Minus } from "@phosphor-icons/react";
import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";

interface MarketDirectionCardProps {
    bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    aligned: boolean;
    structure: 'TRENDING' | 'RANGING' | 'TRANSITION';
}

export function MarketDirectionCard({ bias, aligned, structure }: MarketDirectionCardProps) {
    const [expanded, setExpanded] = useState(false);

    const Icon = bias === 'BULLISH' ? TrendUp : bias === 'BEARISH' ? TrendDown : Minus;
    const color = bias === 'BULLISH' ? "text-emerald-500" : bias === 'BEARISH' ? "text-red-500" : "text-neutral-500";

    return (
        <GlobalCard className="flex flex-col relative" noPadding>
            {/* Header / Collapsed State */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer active:bg-white/5 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10", color)}>
                        <Icon weight="bold" className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white">Market Direction</h3>
                        <p className={cn("text-xs font-bold tracking-wide", color)}>
                            {bias} {aligned ? "• ALIGNED" : "• DIVERGENT"}
                        </p>
                    </div>
                </div>

                <CaretDown weight="bold" className={cn("w-4 h-4 text-neutral-600 transition-transform", expanded && "rotate-180")} />
            </div>

            {/* Expanded Content */}
            {expanded && (
                <div className="px-4 pb-4 pt-0 border-t border-white/5 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="bg-neutral-900/50 p-3 rounded-lg border border-white/5">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">Structure</span>
                            <span className="text-sm font-medium text-white">{structure}</span>
                        </div>
                        <div className="bg-neutral-900/50 p-3 rounded-lg border border-white/5">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">HTF Alignment</span>
                            <span className={cn("text-sm font-medium", aligned ? "text-emerald-500" : "text-amber-500")}>
                                {aligned ? "Fully Aligned" : "Mixed Signals"}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </GlobalCard>
    );
}
