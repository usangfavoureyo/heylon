"use client";

import { GlobalCard } from "@/components/ui/GlobalCard";
import { cn } from "@/lib/utils";
import { WaveSine, CaretDown } from "@phosphor-icons/react";
import { useState } from "react";

interface VolatilityCardProps {
    regime: 'LOW' | 'NORMAL' | 'ELEVATED';
    liquidity: 'THIN' | 'NORMAL' | 'HEAVY';
}

export function VolatilityCard({ regime, liquidity }: VolatilityCardProps) {
    const [expanded, setExpanded] = useState(false);

    const isElevated = regime === 'ELEVATED';
    const color = isElevated ? "text-amber-500" : "text-emerald-500";

    return (
        <GlobalCard className="flex flex-col relative" noPadding>
            <div
                className="flex items-center justify-between p-4 cursor-pointer active:bg-white/5 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10", color)}>
                        <WaveSine weight="bold" className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white">Volatility</h3>
                        <p className={cn("text-xs font-bold tracking-wide", color)}>
                            {regime} REGIME
                        </p>
                    </div>
                </div>
                <CaretDown weight="bold" className={cn("w-4 h-4 text-neutral-600 transition-transform", expanded && "rotate-180")} />
            </div>

            {expanded && (
                <div className="px-4 pb-4 pt-0 border-t border-white/5 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="mt-3 flex justify-between items-center text-xs">
                        <span className="text-neutral-500 uppercase tracking-wider">Liquidity State</span>
                        <span className={cn("font-bold uppercase", liquidity === 'THIN' ? "text-amber-500" : "text-white")}>
                            {liquidity}
                        </span>
                    </div>
                    <div className="mt-2 text-xs text-neutral-400 italic border-t border-white/5 pt-2">
                        {isElevated ? "Reduce size. Wide stops expected." : "Normal execution conditions."}
                    </div>
                </div>
            )}
        </GlobalCard>
    );
}
