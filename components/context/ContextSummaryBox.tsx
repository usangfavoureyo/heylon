"use client";

import { cn } from "@/lib/utils";

interface ContextSummaryBoxProps {
    overallState: 'SUPPORTIVE' | 'MIXED' | 'RESTRICTIVE';
    explanation: string;
}

export function ContextSummaryBox({ overallState, explanation }: ContextSummaryBoxProps) {
    const colorClass =
        overallState === 'SUPPORTIVE' ? "text-emerald-500" :
            overallState === 'RESTRICTIVE' ? "text-red-500" :
                "text-amber-500";

    return (
        <div className="bg-neutral-900/30 border border-white/5 rounded-xl p-4 mt-6">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Overall Assessment</h3>
            <div className="flex items-start gap-4">
                <div className={cn("text-lg font-bold tracking-tight", colorClass)}>
                    {overallState}
                </div>
                <div className="h-full w-px bg-white/10 mx-2" />
                <p className="text-sm text-neutral-400 leading-relaxed max-w-prose">
                    {explanation}
                </p>
            </div>
        </div>
    );
}
