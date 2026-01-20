"use client";

import { cn } from "@/lib/utils";
import { ArrowRight, Circle, Disc } from "@phosphor-icons/react";

interface SignalEvent {
    timestamp: number;
    direction?: "BULLISH" | "BEARISH";
    zone_id?: number;
}

interface TapMssCardProps {
    tap?: SignalEvent | null;
    mss?: SignalEvent | null;
}

import { GlobalCard as Card } from "@/components/ui/GlobalCard";

// ...

export function TapMssCard({ tap, mss }: TapMssCardProps) {
    const tapScore = tap ? 1 : 0;
    const mssScore = mss ? 1 : 0;
    const activeStage = mssScore ? 2 : tapScore ? 1 : 0;

    return (
        <Card className="p-6 flex flex-col justify-between h-full" noPadding={false}>
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-4 block">Structural Evolution</span>

            <div className="flex items-center justify-between gap-4 relative">
                {/* Connector Line */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-neutral-800 -z-10" />

                {/* TAP Node */}
                <div className={cn(
                    "flex flex-col items-center gap-3 z-0 p-4 rounded-2xl border transition-all flex-1",
                    activeStage >= 1 ? "bg-neutral-800 border-amber-500/30" : "bg-neutral-950 border-white/5 opacity-50"
                )}>
                    <div className={cn("w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]", activeStage >= 1 ? "bg-amber-500 text-amber-500" : "bg-neutral-700 text-transparent")} />
                    <div className="text-center">
                        <span className={cn("text-lg font-bold block", activeStage >= 1 ? "text-amber-500" : "text-neutral-600")}>TAP</span>
                        <span className="text-[10px] uppercase text-neutral-500">Preliminary</span>
                    </div>
                    {tap && <span className="text-[10px] font-mono text-neutral-400 mt-1">{new Date(tap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                </div>

                <div className="z-10 text-neutral-600">
                    <ArrowRight className="w-5 h-5" />
                </div>

                {/* MSS Node */}
                <div className={cn(
                    "flex flex-col items-center gap-3 z-0 p-4 rounded-2xl border transition-all flex-1",
                    activeStage >= 2 ? "bg-neutral-800 border-emerald-500/30" : "bg-neutral-950 border-white/5 opacity-50"
                )}>
                    <div className={cn("w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]", activeStage >= 2 ? "bg-emerald-500 text-emerald-500" : "bg-neutral-700 text-transparent")} />
                    <div className="text-center">
                        <span className={cn("text-lg font-bold block", activeStage >= 2 ? "text-emerald-500" : "text-neutral-600")}>MSS</span>
                        <span className="text-[10px] uppercase text-neutral-500">Validation</span>
                    </div>
                    {mss && <span className="text-[10px] font-mono text-neutral-400 mt-1">{new Date(mss.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                </div>
            </div>

            {/* Subtext Logic */}
            <div className="mt-6 text-center">
                {activeStage === 2 ? (
                    <span className="text-emerald-500 text-xs font-medium">Gate Open: Execution Permitted if A+</span>
                ) : activeStage === 1 ? (
                    <span className="text-amber-500 text-xs font-medium">Monitoring for MSS Break...</span>
                ) : (
                    <span className="text-neutral-500 text-xs">Waiting for Zone Tap...</span>
                )}
            </div>
        </Card>
    );
}
