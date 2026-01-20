"use client";

import { useSymbol } from "@/components/providers/SymbolProvider";
import { BackButton } from "@/components/BackButton";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function MarketStructurePage() {
    const { activeSymbol } = useSymbol();

    return (
        <div className="flex flex-col min-h-full bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 p-6 md:p-8 w-full">
            <div className="flex items-center gap-4 mb-8">
                <BackButton />
                <div>
                    <h1 className="text-xl font-medium text-neutral-900 dark:text-white">Market Structure</h1>
                    <p className="text-sm text-neutral-500">Order Flow & MSS State</p>
                </div>
            </div>

            <div className="p-8 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center text-neutral-500 text-sm">
                Structure visualization module pending.
            </div>
        </div>
    );
}
