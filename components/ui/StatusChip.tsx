import { cn } from "@/lib/utils";

interface StatusChipProps {
    status: 'open' | 'closed' | 'pre-market' | 'post-market' | 'low' | 'medium' | 'high' | 'bullish' | 'bearish' | 'neutral';
    label?: string;
    showDot?: boolean;
    className?: string;
}

export function StatusChip({ status, label, showDot = true, className }: StatusChipProps) {
    const config = {
        // POSITIVE (Green/Emerald)
        'open': { color: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' },
        'bullish': { color: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' },
        'low': { color: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' },

        // CRITICAL (Red) - Short, High Risk
        'bearish': { color: 'bg-red-500', text: 'text-red-500', border: 'border-red-500/20', bg: 'bg-red-500/10' },
        'high': { color: 'bg-red-500', text: 'text-red-500', border: 'border-red-500/20', bg: 'bg-red-500/10' },
        'short': { color: 'bg-red-500', text: 'text-red-500', border: 'border-red-500/20', bg: 'bg-red-500/10' },

        // WARNING / BRAND (Amber)
        'pre-market': { color: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500/20', bg: 'bg-amber-500/10' },
        'post-market': { color: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500/20', bg: 'bg-amber-500/10' },
        'medium': { color: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500/20', bg: 'bg-amber-500/10' },
        'wait': { color: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500/20', bg: 'bg-amber-500/10' },

        // NEUTRAL (Grey)
        'closed': { color: 'bg-neutral-500', text: 'text-neutral-500', border: 'border-neutral-500/20', bg: 'bg-neutral-500/10' },
        'neutral': { color: 'bg-neutral-500', text: 'text-neutral-500', border: 'border-neutral-500/20', bg: 'bg-neutral-500/10' },
    };

    const style = config[status] || config['neutral'];
    const displayText = label || status.replace('-', ' ').toUpperCase();

    return (
        <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1 rounded-md border text-xs font-normal tracking-wide backdrop-blur-sm shadow-sm min-w-[80px]",
            !showDot && "justify-center text-center",
            style.bg,
            style.border,
            style.text,
            className
        )}>
            {showDot && (
                <div className="relative flex items-center justify-center w-2 h-2 shrink-0">
                    <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", style.color)}></span>
                    <span className={cn("relative inline-flex rounded-full w-1.5 h-1.5", style.color)}></span>
                </div>
            )}
            <span className="uppercase leading-none pt-[1px]">{displayText}</span>
        </div>
    );
}
