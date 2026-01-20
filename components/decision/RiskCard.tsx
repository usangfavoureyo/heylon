"use client";

import { Siren, ShieldWarning } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

import { CollapsibleCard } from "./CollapsibleCard";

interface RiskCardProps {
    macroRisk: "LOW" | "HIGH";
    newsRisk: "LOW" | "HIGH";
    socialRisk?: "LOW" | "HIGH";
    blockers: string[];
}

export function RiskCard({ macroRisk, newsRisk, socialRisk = "LOW", blockers }: RiskCardProps) {
    const isHighRisk = macroRisk === "HIGH" || newsRisk === "HIGH" || socialRisk === "HIGH" || blockers.some(b => b.includes("RISK"));

    return (
        <CollapsibleCard
            title="Risk Vetoes"
            className={cn("h-full transition-colors", isHighRisk && "bg-red-500/5 border-red-500/20")}
        >
            <div className="flex items-center gap-2 mb-4 -mt-1">
                <ShieldWarning className={cn("w-5 h-5", isHighRisk ? "text-red-500" : "text-neutral-500")} />
                <span className={cn("text-xs font-medium uppercase tracking-wider", isHighRisk ? "text-red-500" : "text-neutral-400")}>
                    {isHighRisk ? "Active Constraints" : "Systems Normal"}
                </span>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-sm text-neutral-400">Macro Event Risk</span>
                    <span className={cn("text-sm font-bold", macroRisk === "HIGH" ? "text-red-500" : "text-emerald-500")}>
                        {macroRisk}
                    </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-sm text-neutral-400">News Sentiment</span>
                    <span className={cn("text-sm font-bold", newsRisk === "HIGH" ? "text-red-500" : "text-emerald-500")}>
                        {newsRisk}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-400">Social Volatility</span>
                    <span className={cn("text-sm font-bold", socialRisk === "HIGH" ? "text-red-500" : "text-neutral-500")}>
                        {socialRisk}
                    </span>
                </div>
            </div>
        </CollapsibleCard>
    );
}
