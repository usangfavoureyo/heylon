"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Activity, BarChart2, Layers } from "lucide-react";

interface MarketStatsCardsProps {
    session?: {
        high: number;
        low: number;
        open: number;
        prevClose: number;
    };
    volatility?: {
        atr?: number;
        volume?: number; // Relative volume usually, e.g. 1.2x
        rangePercent?: number;
    };
    structure?: {
        bias: "BULLISH" | "BEARISH" | "NEUTRAL";
        mss?: "BULLISH" | "BEARISH" | null;
        zone?: "SUPPLY" | "DEMAND" | "NONE";
    };
    className?: string;
}

export function MarketStatsCards({ session, volatility, structure, className }: MarketStatsCardsProps) {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-3", className)}>
            {/* 1. Session Stats */}
            <StatCard title="Session" icon={<BarChart2 className="w-3.5 h-3.5 text-neutral-500" />}>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    <StatLabelValue label="High" value={session?.high} format="price" />
                    <StatLabelValue label="Low" value={session?.low} format="price" />
                    <StatLabelValue label="Open" value={session?.open} format="price" />
                    <StatLabelValue label="Prev Close" value={session?.prevClose} format="price" />
                </div>
            </StatCard>

            {/* 2. Volatility */}
            <StatCard title="Volatility" icon={<Activity className="w-3.5 h-3.5 text-neutral-500" />}>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    <StatLabelValue label="ATR (14)" value={volatility?.atr} format="price" />
                    <StatLabelValue label="Rel Vol" value={volatility?.volume ? `${volatility.volume}x` : undefined} />
                    <StatLabelValue label="Range" value={volatility?.rangePercent} format="percent" />
                </div>
            </StatCard>

            {/* 3. Structure State */}
            <StatCard title="Structure" icon={<Layers className="w-3.5 h-3.5 text-neutral-500" />}>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase text-neutral-500">Bias</span>
                        <BiasBadge bias={structure?.bias} />
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase text-neutral-500">Last MSS</span>
                        <div className={cn(
                            "text-xs font-mono font-medium",
                            structure?.mss === "BULLISH" ? "text-green-400" :
                                structure?.mss === "BEARISH" ? "text-red-400" : "text-neutral-600"
                        )}>
                            {structure?.mss || "---"}
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase text-neutral-500">Zone</span>
                        <span className="text-xs font-mono text-neutral-300">{structure?.zone || "---"}</span>
                    </div>
                </div>
            </StatCard>
        </div>
    );
}

function StatCard({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <Card className="flex flex-col gap-3 relative overflow-hidden bg-neutral-900/40">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{title}</span>
            </div>
            <div>{children}</div>
        </Card>
    );
}

function StatLabelValue({ label, value, format }: { label: string, value?: number | string, format?: "price" | "percent" }) {
    let displayValue = "---";
    if (value !== undefined && value !== null) {
        if (typeof value === "string") displayValue = value;
        else if (format === "price") displayValue = value.toLocaleString(undefined, { minimumFractionDigits: 2 });
        else if (format === "percent") displayValue = `${value.toFixed(2)}%`;
        else displayValue = value.toString();
    }

    return (
        <div className="flex flex-col">
            <span className="text-[9px] uppercase text-neutral-600">{label}</span>
            <span className="text-xs font-mono text-neutral-300">{displayValue}</span>
        </div>
    );
}

function BiasBadge({ bias }: { bias?: string }) {
    if (!bias) return <span className="text-xs font-mono text-neutral-600">---</span>;
    return (
        <div className={cn(
            "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
            bias === "BULLISH" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                bias === "BEARISH" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                    "bg-neutral-800 text-neutral-400 border border-white/5"
        )}>
            {bias}
        </div>
    );
}
