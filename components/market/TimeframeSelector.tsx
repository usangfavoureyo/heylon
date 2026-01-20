"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/hooks/use-haptic";

export const TIMEFRAMES = [
    { label: "1m", value: "1" },
    { label: "2m", value: "2" },
    { label: "3m", value: "3" },
    { label: "5m", value: "5" },
    { label: "15m", value: "15" },
    { label: "30m", value: "30" },
    { label: "1H", value: "60" },
    { label: "4H", value: "240" },
    { label: "1D", value: "D" },
    { label: "1W", value: "W" },
] as const;

export type TimeframeValue = typeof TIMEFRAMES[number]["value"];

interface TimeframeSelectorProps {
    value: TimeframeValue;
    onChange: (val: TimeframeValue) => void;
    className?: string;
}

export function TimeframeSelector({ value, onChange, className }: TimeframeSelectorProps) {
    const { trigger } = useHaptic();

    return (
        <div className={cn("flex items-center gap-1 bg-neutral-900/50 p-1 rounded-lg border border-white/5 overflow-x-auto no-scrollbar", className)}>
            {TIMEFRAMES.map((tf) => {
                const isActive = value === tf.value;
                return (
                    <button
                        key={tf.value}
                        onClick={() => {
                            trigger("light");
                            onChange(tf.value);
                        }}
                        className={cn(
                            "relative shrink-0 px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase transition-colors z-10 whitespace-nowrap",
                            isActive ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTimeframe"
                                className="absolute inset-0 bg-neutral-800 rounded-md -z-10 shadow-sm border border-white/5"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                        {tf.label}
                    </button>
                );
            })}
        </div>
    );
}
