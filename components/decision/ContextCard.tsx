"use client";

import { cn } from "@/lib/utils";

interface ContextCardProps {
    direction: string; // e.g. BULLISH
    volatility: string; // e.g. HIGH
    session: string; // e.g. RTH
    macroRisk: "LOW" | "HIGH";
    newsRisk: "LOW" | "HIGH";
}

import { GlobalCard as Card } from "@/components/ui/GlobalCard";

// ... (props interface remains same)

function ContextItem({ label, value, danger = false }: { label: string, value: string, danger?: boolean }) {
    return (
        <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[9px] uppercase text-neutral-500 tracking-wider">{label}</span>
            <span className={cn("text-sm font-medium", danger ? "text-red-500" : "text-white")}>{value}</span>
        </div>
    );
}

export function ContextCard({ direction, volatility, session, macroRisk, newsRisk }: ContextCardProps) {
    return (
        <Card className="p-6 h-full" noPadding={false}>
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-4 block">Market Context</span>

            <div className="grid grid-cols-2 gap-3">
                <ContextItem label="Primary Trend" value={direction || "NEUTRAL"} />
                <ContextItem label="Volatility" value={volatility || "NORMAL"} danger={volatility === "HIGH"} />
                <ContextItem label="Active Session" value={session} />
                <ContextItem label="Macro Risk" value={macroRisk} danger={macroRisk === "HIGH"} />
            </div>
        </Card>
    );
}
