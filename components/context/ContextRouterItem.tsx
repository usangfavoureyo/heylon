"use client";

import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useHaptic } from "@/hooks/use-haptic";

interface ContextRouterItemProps {
    href: string;
    label: string;
    status: string;         // e.g. "NEUTRAL", "RISK", "SUPPORTIVE"
    statusColor?: string;   // Optional override, otherwise derived from status
    description?: string;   // Optional sub-text e.g. "HTF Aligned"
    updatedAt?: number;     // Timestamp for "Updated X min ago"
}

export function ContextRouterItem({ href, label, status, statusColor, description, updatedAt }: ContextRouterItemProps) {
    const { trigger } = useHaptic();

    // Default color logic if not provided
    const getStatusColor = (s: string) => {
        switch (s) {
            case 'SUPPORTIVE':
            case 'ALIGNED':
            case 'EXPANSION':
            case 'HIGH': // For Quality
                return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";

            case 'RISK':
            case 'BLOCKED':
            case 'COMPRESSION':
            case 'NEGATIVE': // For Sentiment
                return "text-amber-500 bg-amber-500/10 border-amber-500/20";

            case 'CRITICAL':
                return "text-red-500 bg-red-500/10 border-red-500/20";

            case 'NEUTRAL':
            case 'NORMAL':
            case 'RANGING':
                return "text-neutral-400 bg-neutral-500/10 border-neutral-800";

            default: return "text-neutral-400 bg-neutral-900 border-neutral-800";
        }
    };

    const finalColorClass = statusColor || getStatusColor(status);

    // Format relative time (simple version)
    const getRelativeTime = (ts?: number) => {
        if (!ts) return "";
        const diff = Date.now() - ts;
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Updated < 1m ago";
        if (mins < 60) return `Updated ${mins}m ago`;
        const hours = Math.floor(mins / 60);
        return `Updated ${hours}h ago`;
    };

    return (
        <Link href={href} onClick={() => trigger('light')}>
            <div className="group w-full flex items-center justify-between p-4 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-900/50 hover:bg-neutral-50 dark:hover:bg-[#0d0d0d] hover:border-neutral-300 dark:hover:border-[#252525] active:scale-[0.99] transition-all duration-200 rounded-xl mb-3 cursor-pointer shadow-sm dark:shadow-none">
                {/* LEFT: Label & Description */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-neutral-900 dark:text-white group-hover:text-black dark:group-hover:text-white/90 transition-colors">{label}</span>
                        {/* Status Badge */}
                        <span className={cn(
                            "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded border",
                            finalColorClass
                        )}>
                            {status}
                        </span>
                    </div>
                    {description && (
                        <span className="text-xs text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-400 transition-colors">{description}</span>
                    )}
                </div>

                {/* RIGHT: Timestamp & Arrow */}
                <div className="flex items-center gap-4">
                    {updatedAt && (
                        <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-600 uppercase hidden sm:block">
                            {getRelativeTime(updatedAt)}
                        </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-neutral-600 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors transform group-hover:translate-x-1 duration-200" />
                </div>
            </div>
        </Link>
    );
}

