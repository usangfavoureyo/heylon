"use client";

import { cn } from "@/lib/utils";

// GENERIC TOGGLE COMPONENT
export function ToggleRow({ label, desc, checked, onChange }: { label: string, desc?: string, checked: boolean, onChange: (v: boolean) => void }) {
    return (
        <div className="flex items-center justify-between py-2">
            <div>
                <div className="text-base text-neutral-900 dark:text-neutral-200">{label}</div>
                {desc && <div className="text-xs text-neutral-500">{desc}</div>}
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={cn(
                    "w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer",
                    checked ? "bg-[#252525]" : "bg-[#171717]"
                )}
            >
                <div className={cn(
                    "w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out",
                    checked ? "translate-x-5" : "translate-x-0"
                )} />
            </button>
        </div>
    );
}

export function ContextRow({ label, val, alert }: any) {
    return (
        <div className="flex justify-between items-center py-0.5">
            <span className="text-neutral-500">{label}</span>
            <div className="flex items-center gap-2">
                <span className={cn("font-mono", alert ? "text-amber-500" : "text-neutral-700 dark:text-neutral-300")}>{val}</span>
                {alert && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
            </div>
        </div>
    );
}

export function ContextStripItem({ label, risk }: { label: string, risk: string }) {
    const color = risk === "HIGH" ? "text-amber-500" : risk === "MEDIUM" ? "text-yellow-500" : "text-neutral-600";
    return (
        <div className="flex items-center gap-2">
            <div className={cn("w-1.5 h-1.5 rounded-full", color.replace('text-', 'bg-'))} />
            <span className="text-[10px] font-mono text-neutral-500">{label}</span>
        </div>
    );
}
