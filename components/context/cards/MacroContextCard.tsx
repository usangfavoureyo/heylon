"use client";

import { GlobalCard } from "@/components/ui/GlobalCard";
import { cn } from "@/lib/utils";
import { Globe, Clock, Warning, CaretDown } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { formatDistanceToNow, differenceInMinutes, parseISO } from "date-fns";

// --- TYPES ---
interface MacroEvent {
    id: string;
    name: string;
    time: string; // ISO string
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface MacroContextCardProps {
    nextEvent: MacroEvent | null;
}

// --- LOGIC HELPER ---
function getEventState(eventTimeStr: string): { state: 'NEUTRAL' | 'WATCH' | 'RISK' | 'BLOCKED', label: string, color: string } {
    const now = new Date();
    const eventTime = parseISO(eventTimeStr);
    const diffMins = differenceInMinutes(eventTime, now);

    if (diffMins > 90) return { state: 'NEUTRAL', label: 'NEUTRAL', color: 'text-neutral-500' };
    if (diffMins > 60) return { state: 'WATCH', label: 'WATCH', color: 'text-amber-500' };
    if (diffMins > 30) return { state: 'RISK', label: 'RISK', color: 'text-orange-500' };
    if (diffMins >= -15) return { state: 'BLOCKED', label: 'BLOCKED', color: 'text-red-500' }; // Blocked 30m before until 15m after (example cooldown)

    return { state: 'NEUTRAL', label: 'PASSED', color: 'text-neutral-500' };
}

export function MacroContextCard({ nextEvent }: MacroContextCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [now, setNow] = useState(new Date());

    // Continuous ticker
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000 * 60); // Update every minute
        return () => clearInterval(timer);
    }, []);

    // No event case
    if (!nextEvent) {
        return (
            <GlobalCard className="flex flex-col relative" noPadding>
                <div className="flex items-center justify-between p-4 opacity-60">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-neutral-500">
                            <Globe weight="bold" className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-white">Macro Risk</h3>
                            <p className="text-xs text-neutral-500 font-medium">No high-impact events scheduled.</p>
                        </div>
                    </div>
                </div>
            </GlobalCard>
        );
    }

    const { state, label, color } = getEventState(nextEvent.time);
    const timeLeft = formatDistanceToNow(parseISO(nextEvent.time), { addSuffix: true });

    const isBlocked = state === 'BLOCKED';
    const borderColor = isBlocked ? "border-red-500/20" : "border-white/5";
    const bgClass = isBlocked ? "bg-red-500/5" : "";

    return (
        <GlobalCard className={cn("flex flex-col relative transition-colors", borderColor, bgClass)} noPadding>
            {/* Header / Collapsed State */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer active:bg-white/5 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10", color)}>
                        {isBlocked ? <Warning weight="fill" className="w-4 h-4" /> : <Globe weight="bold" className="w-4 h-4" />}
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white">Macro Risk</h3>
                        <p className={cn("text-xs font-bold tracking-wide flex items-center gap-1.5", color)}>
                            {label} • {nextEvent.name}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-neutral-400 bg-neutral-900 border border-white/10 px-1.5 py-0.5 rounded">
                        {timeLeft.replace('about ', '')}
                    </span>
                    <CaretDown weight="bold" className={cn("w-4 h-4 text-neutral-600 transition-transform", expanded && "rotate-180")} />
                </div>
            </div>

            {/* Expanded Content */}
            {expanded && (
                <div className="px-4 pb-4 pt-0 border-t border-white/5 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="mt-3 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-neutral-500 uppercase tracking-wider">Scheduled</span>
                            <span className="text-white font-mono">
                                {new Date(nextEvent.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-neutral-500 uppercase tracking-wider">Impact</span>
                            <span className="text-red-500 font-bold uppercase">{nextEvent.impact}</span>
                        </div>

                        {isBlocked && (
                            <div className="mt-2 bg-red-500/10 border border-red-500/20 p-2 rounded text-xs text-red-500 font-medium flex items-center gap-2">
                                <Warning weight="fill" className="w-4 h-4" />
                                Execution Gated. Wait for cooldown.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </GlobalCard>
    );
}
