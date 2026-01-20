"use client";

import { CaretDown } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CollapsibleCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    defaultOpenMobile?: boolean;
}

import { GlobalCard as Card } from "@/components/ui/GlobalCard";

// ...

export function CollapsibleCard({ title, children, className, defaultOpenMobile = false }: CollapsibleCardProps) {
    const [isOpen, setIsOpen] = useState(defaultOpenMobile);

    return (
        <Card className={cn("transition-all", className)} noPadding={false}>
            {/* Desktop Header (Static) / Mobile Header (Clickable) */}
            <div
                className="p-6 flex items-center justify-between cursor-pointer lg:cursor-default"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">{title}</span>
                <CaretDown className={cn("w-4 h-4 text-neutral-500 lg:hidden transition-transform", isOpen && "rotate-180")} />
            </div>

            {/* Content Area */}
            <div className="hidden lg:block px-6 pb-6">
                {children}
            </div>

            {/* Mobile Animation */}
            <div className="lg:hidden">
                <AnimatePresence initial={false}>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-6 pb-6"
                        >
                            {children}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Card>
    );
}
