"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface SheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
    title?: string;
    className?: string; // Content class
}

export function Sheet({ open, onOpenChange, children, title, className }: SheetProps) {
    // Close on Escape
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) {
                onOpenChange(false);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, onOpenChange]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => onOpenChange(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:z-50"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 20, stiffness: 300, mass: 0.8 }}
                        className={cn(
                            "fixed top-0 right-0 bottom-0 w-full max-w-md bg-neutral-900 border-l border-neutral-800 z-50 shadow-2xl flex flex-col focus:outline-none",
                            className
                        )}
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Internal Header if needed, or pass via children */}
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
