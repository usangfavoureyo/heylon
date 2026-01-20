"use client";

import { cn } from "@/lib/utils";
import { Warning, CheckCircle, Clock } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface DecisionCardProps {
    symbol: string;
    verdict: "BUY" | "SELL" | "WAIT";
    bias?: "BULLISH" | "BEARISH";
    confidence: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
    executability: "CONFIRMED" | "OPTIONAL" | "BLOCKED";
    timestamp: number;
    explanation?: string;
    signalId?: string;
    status?: "ACTIVE" | "ACKNOWLEDGED" | "ARCHIVED";
    // [NEW] Viability Props
    viability_label?: "HIGH" | "MEDIUM" | "LOW";
    viability_score?: number;
}

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useHaptic } from "@/hooks/use-haptic";
import { useLongPress } from "@/hooks/use-long-press";
import { ContextMenuSheet } from "@/components/ui/ContextMenuSheet";
import { GlobalCard as Card } from "../ui/GlobalCard";

export function DecisionCard({ symbol, verdict, bias, confidence, executability, timestamp, explanation, signalId, status, viability_label, viability_score }: DecisionCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [contextOpen, setContextOpen] = useState(false);
    const acknowledge = useMutation(api.signals.acknowledge);
    const archive = useMutation(api.signals.archive);
    const { trigger } = useHaptic();

    // Long Press Handler for Context Menu
    const longPressHandlers = useLongPress(() => {
        trigger("medium");
        setContextOpen(true);
    }, { threshold: 500 });

    // Default Click Handler (Expand) - Only fires if NOT a long press
    const handleClick = () => {
        setExpanded(!expanded);
        trigger("light");
    };

    // Determine Display Config
    let config = { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "WAIT" };

    if (verdict === "BUY") {
        config = { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "CONFIRM LONG" };
    } else if (verdict === "SELL") {
        config = { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", label: "CONFIRM SHORT" };
    } else if (bias) {
        // BIAS ONLY Mode
        const isBull = bias === "BULLISH";
        config = {
            color: isBull ? "text-emerald-400" : "text-red-400",
            bg: isBull ? "bg-emerald-500/5" : "bg-red-500/5",
            border: isBull ? "border-emerald-500/10" : "border-red-500/10",
            label: isBull ? "BIAS LONG" : "BIAS SHORT"
        };
    }

    // Format Confidence
    const confidenceScore = confidence === "VERY_HIGH" ? 95 : confidence === "HIGH" ? 85 : confidence === "MEDIUM" ? 60 : 30;

    // Format Time
    const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Viability Color
    const viabilityColor = viability_label === "HIGH" ? "text-emerald-400" : viability_label === "MEDIUM" ? "text-amber-400" : "text-red-400";

    return (
        <Card
            className="select-none touch-manipulation"
            {...longPressHandlers}
            onClick={handleClick}
            noPadding // We handle padding internally for strict control
        >
            {/* Header / Active Indicator */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-500">{symbol}</span>
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </div>

            <div className="p-6 cursor-pointer">
                {/* Main Verdict */}
                <div className="flex flex-col gap-1 mt-2">
                    <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Current Decision</span>
                    <h1 className={cn("text-4xl lg:text-5xl font-black tracking-tighter uppercase my-2", config.color)}>
                        {config.label}
                    </h1>
                </div>

                {/* Sub-Metrics */}
                <div className="flex items-center gap-6 mt-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-neutral-500 tracking-wider">Confidence</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-medium text-white">{confidenceScore}%</span>
                            <div className="flex gap-0.5 h-1.5 mt-1">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={cn("w-3 rounded-full", i <= (confidenceScore / 25) ? "bg-white" : "bg-neutral-800")} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {viability_label && (
                        <>
                            <div className="h-8 w-px bg-white/10" />
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase text-neutral-500 tracking-wider">Viability</span>
                                <div className="flex items-center gap-1.5">
                                    <span className={cn("text-xl font-medium", viabilityColor)}>{viability_label}</span>
                                    {viability_score && <span className="text-xs text-neutral-500">{(viability_score * 10).toFixed(1)}/10</span>}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="h-8 w-px bg-white/10" />

                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-neutral-500 tracking-wider">Last Update</span>
                        <div className="flex items-center gap-1.5 text-neutral-300">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-mono">{timeStr}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interaction Footer */}
            {signalId && status && status !== "ARCHIVED" && (
                <div className="mt-8 flex gap-3 z-20 relative px-6 pb-6" onClick={(e) => e.stopPropagation()}>
                    {status === "ACTIVE" && (
                        <button
                            onClick={() => {
                                trigger("medium");
                                acknowledge({ id: signalId as any });
                            }}
                            className="flex-1 bg-white text-black font-bold text-sm py-3 rounded-xl hover:bg-neutral-200 transition-colors uppercase tracking-wide"
                        >
                            Acknowledge
                        </button>
                    )}
                    {status === "ACKNOWLEDGED" && (
                        <button
                            onClick={() => {
                                trigger("heavy");
                                archive({ id: signalId as any });
                            }}
                            className="flex-1 bg-white/10 text-white border border-white/5 font-bold text-sm py-3 rounded-xl hover:bg-white/20 transition-colors uppercase tracking-wide"
                        >
                            Archive
                        </button>
                    )}
                </div>
            )}


            {/* Expandable Explanation */}
            <AnimatePresence>
                {expanded && explanation && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6 border-t border-white/5"
                    >
                        <div className="pt-4 text-sm text-neutral-300 leading-relaxed max-w-prose">
                            <span className="text-xs font-bold text-neutral-500 uppercase block mb-2">Jury Logic</span>
                            {explanation}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Expansion Hint */}
            <div className="absolute bottom-3 right-4 opacity-30 text-[9px] uppercase tracking-widest text-neutral-500 pointer-events-none">
                {expanded ? "Collapse" : "Why?"}
            </div>

            {/* Context Menu */}
            <ContextMenuSheet
                open={contextOpen}
                onOpenChange={setContextOpen}
                contextType="SIGNAL"
                contextId={signalId}
            />
        </Card >
    );
}
