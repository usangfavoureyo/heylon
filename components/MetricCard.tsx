import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
    title: string;
    value: string;
    subtext: string;
    status: 'bullish' | 'bearish' | 'neutral' | 'high' | 'medium' | 'low';
    icon: LucideIcon;
}

export function MetricCard({
    title,
    value,
    subtext,
    status,
    icon: Icon
}: MetricCardProps) {
    const colorMap = {
        bullish: "text-blue-500", // biased-buy
        bearish: "text-orange-500", // biased-sell
        neutral: "text-neutral-400",
        high: "text-red-500",
        medium: "text-amber-500",
        low: "text-emerald-500"
    };

    const bgMap = {
        bullish: "from-blue-500/20",
        bearish: "from-orange-500/20",
        neutral: "from-white/5",
        high: "from-red-500/20",
        medium: "from-amber-500/20",
        low: "from-emerald-500/20"
    };

    return (
        <div className="relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 backdrop-blur-sm group transition-all hover:border-neutral-700">
            {/* Glow Effect */}
            <div className={cn(
                "absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br to-transparent blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500",
                bgMap[status]
            )} />

            <div className="flex items-start justify-between relative z-10 mb-4">
                <span className="text-neutral-500 text-sm font-medium tracking-wide">{title}</span>
                <Icon className={cn("w-5 h-5", colorMap[status])} />
            </div>

            <div className="relative z-10">
                <div className={cn("text-2xl font-normal tracking-tight mb-1", colorMap[status])}>
                    {value}
                </div>
                <div className="text-xs text-neutral-500 font-normal truncate">{subtext}</div>
            </div>
        </div>
    );
}
