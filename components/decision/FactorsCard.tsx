"use client";

import { CheckCircle, XCircle } from "@phosphor-icons/react";

interface FactorsCardProps {
    supports: string[];
    blockers: string[];
}

import { GlobalCard as Card } from "@/components/ui/GlobalCard";

// ...

export function FactorsCard({ supports, blockers }: FactorsCardProps) {
    const hasData = supports.length > 0 || blockers.length > 0;

    return (
        <Card className="p-6 h-full" noPadding={false}>
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-4 block">Decision Logic</span>

            {!hasData ? (
                <div className="flex items-center justify-center h-24 text-neutral-600 text-sm italic">
                    Analyzing market conditions...
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Blockers (Priority) */}
                    {blockers.length > 0 && (
                        <div className="space-y-2">
                            <span className="text-[10px] uppercase text-red-500/80 font-bold tracking-widest">Vetoes / Blockers</span>
                            {blockers.map((b, i) => (
                                <div key={i} className="flex items-start gap-2 text-red-400">
                                    <XCircle className="w-4 h-4 mt-0.5 shrink-0" weight="fill" />
                                    <span className="text-sm">{b.replace(/_/g, " ")}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Supports */}
                    {supports.length > 0 && (
                        <div className="space-y-2">
                            <span className="text-[10px] uppercase text-emerald-500/80 font-bold tracking-widest">Supporting Factors</span>
                            {supports.map((s, i) => (
                                <div key={i} className="flex items-start gap-2 text-emerald-400">
                                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" weight="fill" />
                                    <span className="text-sm">{s.replace(/_/g, " ")}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}
