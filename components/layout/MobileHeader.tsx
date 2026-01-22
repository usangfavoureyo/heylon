"use client";

import { Bell, MagnifyingGlass } from "@phosphor-icons/react";
import Image from "next/image";
import { StatusChip } from "@/components/ui/StatusChip";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";
import { SearchPage } from "@/components/search/SearchPage";

import { useHaptic } from "@/hooks/use-haptic";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function MobileHeader({ isVisible = true }: { isVisible?: boolean }) {
    const { trigger } = useHaptic();
    const unreadCount = useQuery(api.notifications.getUnreadCount) || 0;
    const [showSearch, setShowSearch] = useState(false);

    return (
        <>
            <header
                className={cn(
                    "lg:hidden fixed top-0 left-0 right-0 h-[60px] z-30 flex items-center justify-between px-4 bg-background/80 backdrop-blur-md border-b border-neutral-800 transition-all duration-300 ease-in-out",
                    !isVisible && "-translate-y-full opacity-0 pointer-events-none"
                )}
            >
                {/* Left: Brand */}
                <div className="flex items-center">
                    <div className="relative w-12 h-12 shrink-0">
                        <Image
                            src="/logo-white-v2.png" // TODO: Dark Mode Logo
                            alt="Heylon Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* Right: Status & Actions */}
                <div className="flex items-center gap-3">
                    <StatusChip status="open" showDot={true} label="OPEN" />

                    <div
                        onClick={() => {
                            trigger('light');
                            setShowSearch(true);
                        }}
                        className="w-10 h-10 rounded-full bg-card border border-neutral-800 flex items-center justify-center active:scale-95 transition-transform text-muted-foreground hover:text-foreground"
                    >
                        <MagnifyingGlass className="w-5 h-5" />
                    </div>

                    <Link
                        href="/notifications"
                        onClick={() => trigger('light')}
                        className="relative w-10 h-10 rounded-full bg-card border border-neutral-800 flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <Bell className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-card" />
                        )}
                    </Link>
                </div>
            </header>

            <SearchPage open={showSearch} onOpenChange={setShowSearch} />
        </>
    );
}
