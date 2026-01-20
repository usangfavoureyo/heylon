"use client";

import { usePathname } from "next/navigation";
import { ChevronLeft, ArrowLeft } from "lucide-react";
import { useBackNavigation } from "@/hooks/use-back-navigation";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/hooks/use-haptic";

const ROOT_ROUTES = ["/", "/signals", "/market", "/context", "/system"];

export function BackButton({ className }: { className?: string }) {
    const pathname = usePathname();
    const { handleBack } = useBackNavigation();
    const { trigger } = useHaptic();

    // Do not show on root level nav items
    if (ROOT_ROUTES.includes(pathname)) return null;

    return (
        <button
            onClick={() => {
                trigger('light');
                handleBack();
            }}
            className={cn(
                "w-9 h-9 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700 transition-all active:scale-95",
                className
            )}
            aria-label="Go Back"
        >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        </button>
    );
}
