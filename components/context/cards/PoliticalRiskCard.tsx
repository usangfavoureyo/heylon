"use client";

import { GlobalCard } from "@/components/ui/GlobalCard";
import { cn } from "@/lib/utils";
import { Megaphone, CaretDown, ShieldWarning } from "@phosphor-icons/react";
import { useState } from "react";

interface PoliticalRiskCardProps {
    keywordDetected: boolean;
    impactScore: number; // 0-100
    riskType: 'INFLATIONARY' | 'RISK-OFF' | 'TRADE SHOCK' | 'NEUTRAL';
}

export function PoliticalRiskCard({ keywordDetected, impactScore, riskType }: PoliticalRiskCardProps) {
    const [expanded, setExpanded] = useState(false);

    const isHighRisk = impactScore > 75;
    const color = isHighRisk ? "text-red-500" : keywordDetected ? "text-amber-500" : "text-neutral-500";

    return (
        <GlobalCard className={cn("flex flex-col relative", isHighRisk && "border-red-500/20 bg-red-500/5")} noPadding>
            <div
                className="flex items-center justify-between p-4 cursor-pointer active:bg-white/5 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10", color)}>
                        {isHighRisk ? <ShieldWarning weight="fill" className="w-4 h-4" /> : <Megaphone weight="bold" className="w-4 h-4" />}
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white">Political / Trump</h3>
                        <p className={cn("text-xs font-bold tracking-wide", color)}>
                            {isHighRisk ? "ASYMMETRIC SHOCK" : keywordDetected ? "KEYWORD DETECTED" : "QUIET"}
                        </p>
                    </div>
                </div>
                <CaretDown weight="bold" className={cn("w-4 h-4 text-neutral-600 transition-transform", expanded && "rotate-180")} />
            </div>

            {expanded && (
                <div className="px-4 pb-4 pt-0 border-t border-white/5 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="bg-neutral-900/50 p-2 rounded border border-white/5">
                            <span className="text-[10px] text-neutral-500 uppercase block">Impact Score</span>
                            <span className={cn("text-sm font-mono font-bold", isHighRisk ? "text-red-500" : "text-white")}>
                                {impactScore}/100
                            </span>
                        </div>
                        <div className="bg-neutral-900/50 p-2 rounded border border-white/5">
                            <span className="text-[10px] text-neutral-500 uppercase block">Risk Type</span>
                            <span className="text-sm font-bold text-white uppercase">{riskType}</span>
                        </div>
                    </div>
                </div>
            )}
        </GlobalCard>
    );
}
