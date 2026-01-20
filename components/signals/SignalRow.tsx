"use client";

import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { CaretRight } from "@phosphor-icons/react";
import { Doc } from "@/convex/_generated/dataModel";

interface SignalRowProps {
    signal: Doc<"signals">;
    onClick: () => void;
    nextSignalInChain?: Doc<"signals">; // For connector line logic if needed (simplified for now)
}

export function SignalRow({ signal, onClick }: SignalRowProps) {
    // 1. Indentation & Hierarchy Level
    const level = useMemo(() => {
        switch (signal.type) {
            case "TAP": return 0;
            case "MSS": return 1;
            case "DECISION": return 2;
            case "VETO": return 1;
            case "EXPIRED": return 0;
            default: return 0;
        }
    }, [signal.type]);

    // 2. Color Semantics (Dot Only)
    const dotColor = useMemo(() => {
        if (signal.type === "TAP") return "bg-amber-500";
        if (signal.type === "MSS") return "bg-emerald-500"; // Assuming MSS is usually bullish/bearish confirmation step

        if (signal.type === "DECISION") {
            if (signal.decision === "CONFIRM_LONG") return "bg-emerald-500";
            if (signal.decision === "CONFIRM_SHORT") return "bg-red-500";
            if (signal.decision === "BIAS") return "bg-amber-500";
            return "bg-neutral-500"; // WAIT
        }

        if (signal.type === "VETO") return "bg-red-500";
        return "bg-neutral-500";
    }, [signal.type, signal.decision]);

    // 3. Title Logic
    const title = useMemo(() => {
        if (signal.type === "TAP") return "Demand Zone Tapped"; // Dynamic based on zoneType?
        if (signal.type === "MSS") return "MSS Confirmed";
        if (signal.type === "DECISION") {
            if (signal.decision === "CONFIRM_LONG") return "Decision Confirmed: LONG";
            if (signal.decision === "CONFIRM_SHORT") return "Decision Confirmed: SHORT";
            if (signal.decision === "WAIT") return "System Wait";
            return "Bias Updated";
        }
        return signal.type;
    }, [signal]);

    const indentationClass = useMemo(() => {
        if (level === 1) return "pl-8";
        if (level === 2) return "pl-12";
        return "pl-4";
    }, [level]);

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative flex items-center justify-between py-3 pr-4 border-b border-neutral-800 cursor-pointer active:bg-neutral-900/50 hover:bg-neutral-900/30 transition-colors",
                indentationClass
            )}
        >
            {/* Connector Line (Simplistic vertical trace for indented items) */}
            {level > 0 && (
                <div className="absolute left-[19px] top-0 bottom-[50%] w-px bg-neutral-800 translate-y-full" />
            )}
            {/* Sub-connector horizontal */}
            {level > 0 && (
                <div className="absolute left-[19px] top-1/2 w-3 h-px bg-neutral-800" />
            )}


            {/* Left Content */}
            <div className="flex items-center gap-3">
                {/* Semantic Dot */}
                <div className={cn("w-2 h-2 rounded-full shadow-glow-sm shrink-0 z-10", dotColor)} />

                {/* Text */}
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-neutral-200 group-hover:text-white transition-colors">
                        {title}
                    </span>
                    <span className="text-[11px] font-medium text-neutral-500 group-hover:text-neutral-400">
                        {signal.symbol} • {signal.timeframe || "1H"} • {signal.stage === "PRELIMINARY" ? "Prelim" : "Final"}
                    </span>
                </div>
            </div>

            {/* Right Content */}
            <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-neutral-400 tabular-nums">
                    {formatDistanceToNow(signal.createdAt, { addSuffix: true }).replace("about ", "")}
                </span>
                <CaretRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400" />
            </div>
        </div>
    );
}
