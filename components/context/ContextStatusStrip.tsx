"use client";

import { cn } from "@/lib/utils";
import { StatusChip } from "@/components/ui/StatusChip";

export type ContextDomain = 'MARKET' | 'MACRO' | 'NEWS' | 'TRUMP' | 'VOL' | 'SESSION';
export type ContextState = 'SUPPORTIVE' | 'NEUTRAL' | 'RISK' | 'BLOCKED';

interface ContextStatusStripProps {
    statuses: Record<ContextDomain, ContextState>;
}

export function ContextStatusStrip({ statuses }: ContextStatusStripProps) {
    // Helper to map State to Chip Status/Color logic
    const mapStateToChip = (state: ContextState): { status: any, colorClass: string } => {
        switch (state) {
            case 'SUPPORTIVE': return { status: 'bullish', colorClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
            case 'NEUTRAL': return { status: 'neutral', colorClass: 'bg-neutral-500/10 text-neutral-500 border-white/10' };
            case 'RISK': return { status: 'high', colorClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20' }; // Amber for Risk? Or Red? Spec says 4 colors. Risk usually Amber/Red.
            case 'BLOCKED': return { status: 'critical', colorClass: 'bg-red-500/10 text-red-500 border-red-500/20' };
            default: return { status: 'neutral', colorClass: '' };
        }
    };

    const domains: { key: ContextDomain, label: string }[] = [
        { key: 'MARKET', label: 'Direction' },
        { key: 'MACRO', label: 'Macro' },
        { key: 'NEWS', label: 'News' },
        { key: 'TRUMP', label: 'Political' },
        { key: 'VOL', label: 'Volatility' },
        { key: 'SESSION', label: 'Session' },
    ];

    return (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1 pb-4">
            {domains.map((d) => {
                const state = statuses[d.key] || 'NEUTRAL';
                const { colorClass } = mapStateToChip(state);

                return (
                    <div
                        key={d.key}
                        className={cn(
                            "shrink-0 flex flex-col items-center justify-center px-3 py-2 rounded-lg border bg-neutral-900/50 min-w-[70px] gap-1",
                            colorClass.includes("border") ? "" : "border-white/5" // Fallback border
                        )}
                    >
                        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">{d.label}</span>
                        <div className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase leading-none",
                            colorClass
                        )}>
                            {state === 'SUPPORTIVE' ? 'GOOD' : state}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
