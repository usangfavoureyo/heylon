"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingScreen({ className }: { className?: string }) {
    return (
        <div className={cn("flex flex-col items-center justify-center h-full min-h-[50vh] w-full bg-background/50", className)}>
            <div className="relative">
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border-2 border-neutral-200 dark:border-neutral-800 opacity-20" />
                {/* Spinning Indicator */}
                <Loader2 className="w-8 h-8 text-neutral-900 dark:text-white animate-spin" strokeWidth={1.5} />
            </div>
        </div>
    );
}

export function PageLoading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm">
            <Loader2 className="w-10 h-10 text-neutral-900 dark:text-white animate-spin" strokeWidth={1} />
        </div>
    );
}
