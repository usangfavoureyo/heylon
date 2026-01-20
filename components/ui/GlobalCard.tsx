"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface CardProps extends HTMLMotionProps<"div"> {
    noHover?: boolean;
    noPadding?: boolean;
}

export const GlobalCard = forwardRef<HTMLDivElement, CardProps>(({ className, children, noHover = false, noPadding = false, ...props }, ref) => {
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }} // Fast, non-elastic
            whileHover={!noHover ? { y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.5)" } : undefined}
            whileTap={!noHover ? { y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.5)" } : undefined}
            className={cn(
                // Structure
                "relative flex flex-col overflow-hidden",
                // Stroke & Radius (System Token)
                "border border-neutral-200 dark:border-neutral-800 rounded-xl transition-colors",
                // Background & Shadow
                "bg-white dark:bg-black shadow-sm dark:shadow-none hover:bg-neutral-50 dark:hover:bg-white/5",
                // Padding (Optional toggle)
                !noPadding && "p-4",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
});

GlobalCard.displayName = "GlobalCard";
