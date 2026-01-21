"use client";

import { ReactNode, useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/hooks/use-haptic";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import {
    Bell,
    MagnifyingGlass,
    CaretLeft,
    CaretRight,
    SignIn
} from "@phosphor-icons/react";

import { MobileHeader } from "./layout/MobileHeader";
import { Clock } from "./layout/Clock";
import { useSwipeNavigation } from "@/hooks/use-swipe-navigation";
import { SymbolProvider } from "./providers/SymbolProvider";
import { StatusChip } from "./ui/StatusChip";
import { DesktopSearch } from "./search/DesktopSearch";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { useTheme } from "next-themes";

// --- SIDEBAR ITEM COMPONENT ---
function SidebarItem({
    icon: Icon,
    label,
    href,
    active = false,
    collapsed = false,
    onClick
}: {
    icon: any,
    label: string,
    href: string,
    active?: boolean,
    collapsed?: boolean,
    onClick?: () => void
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                "relative py-3 mb-1 cursor-pointer transition-all duration-200 group flex items-center",
                collapsed ? "justify-center px-0" : "justify-start px-6 gap-3 border-l-2",
                active
                    ? (collapsed ? "text-white" : "border-white bg-white/5 text-white") // HIGH CONTRAST ACTIVE
                    : "border-transparent text-neutral-500 hover:text-white hover:bg-white/5" // HIGH CONTRAST HOVER
            )}
        >
            {/* Icon Container */}
            <div className={cn(
                "p-1.5 rounded-md transition-colors",
                collapsed && active ? "bg-white/10 text-white" : ""
            )}>
                <Icon weight={active ? "fill" : "regular"} className="w-5 h-5 shrink-0" />
            </div>

            {!collapsed && (
                <span className={cn(
                    "text-sm font-medium truncate transition-colors",
                    active ? "text-white" : "group-hover:text-white"
                )}>
                    {label}
                </span>
            )}

            {/* Hover Tooltip for Collapsed State */}
            {collapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-neutral-900 border border-white/10 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl rounded-md">
                    {label}
                </div>
            )}
        </Link>
    );
}


function UnreadIndicator() {
    // We isolate this to avoid re-rendering the whole shell on notification updates
    const unreadCount = useQuery(api.notifications.getUnreadCount) || 0;

    if (unreadCount === 0) return null;

    return (
        <div className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
    );
}

export default function AppShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { trigger } = useHaptic();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollDirection = useScrollDirection(scrollContainerRef);
    const isNavVisible = scrollDirection === "up";

    // Sidebar State
    const [sidebarWidth, setSidebarWidth] = useState(256);
    const isCollapsed = sidebarWidth < 180;

    const toggleSidebar = useCallback(() => {
        trigger('medium');
        setSidebarWidth(prev => prev > 100 ? 80 : 256);
    }, [trigger]);

    // Swipe Navigation
    const swipeHandlers = useSwipeNavigation();



    // --- MAIN CONTENT AREA ---
    return (
        <SymbolProvider>

            <div className="flex h-screen w-full bg-background text-foreground font-sans overflow-hidden">
                {/* --- DESKTOP SIDEBAR (Legacy UI) --- */}
                <aside
                    className="hidden lg:flex bg-card border-r border-neutral-800 flex-col items-stretch py-6 shrink-0 relative z-20 transition-all duration-300 ease-out will-change-[width]"
                    style={{ width: sidebarWidth }}
                >
                    {/* Toggle Line / Handle */}
                    <div
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors z-50 mr-[-0.5px] flex items-center justify-center group"
                        onClick={toggleSidebar}
                        title="Click to Toggle Sidebar"
                    >
                        <div className="w-4 h-8 bg-card border border-neutral-800 rounded-full items-center justify-center hidden group-hover:flex -mr-4 shadow-lg">
                            {isCollapsed ? <CaretRight className="w-3 h-3 text-foreground" /> : <CaretLeft className="w-3 h-3 text-foreground" />}
                        </div>
                    </div>

                    {/* Logo Area */}
                    <div className={cn(
                        "mb-8 flex items-center transition-all",
                        isCollapsed ? "justify-center" : "px-6 justify-start"
                    )}>
                        <div className="relative w-12 h-12 shrink-0">
                            <Image
                                src="/logo-white-v2.png"
                                alt="Heylon Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 w-full space-y-1 overflow-y-auto pr-0 no-scrollbar">
                        {NAV_ITEMS.map((item) => (
                            <SidebarItem
                                key={item.href}
                                icon={item.icon}
                                label={item.label}
                                href={item.href}
                                active={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                                collapsed={isCollapsed}
                                onClick={() => trigger('light')}
                            />
                        ))}
                    </nav>

                    {/* Footer / User */}
                    <div className="mt-auto w-full pt-4 border-t border-neutral-800 px-6 pb-6">
                        <button
                            onClick={() => {
                                trigger('medium');
                                document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                                window.location.href = "/login";
                            }}
                            className={cn(
                                "flex items-center gap-3 text-muted-foreground hover:text-white hover:bg-white/5 transition-all duration-200 group w-full rounded-md p-2",
                                isCollapsed ? "justify-center px-0" : "justify-start px-2"
                            )}
                        >
                            <SignIn className="w-5 h-5 shrink-0 scale-x-[-1]" />
                            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
                        </button>
                    </div>
                </aside>

                {/* --- MAIN CONTENT AREA --- */}
                <main className="flex-1 flex flex-col overflow-hidden pb-16 lg:pb-0 relative bg-background">

                    {/* Desktop Header (Legacy UI) */}
                    <div className="hidden lg:flex h-16 items-center justify-between px-6 border-b border-neutral-800 bg-background shrink-0">
                        {/* Search */}
                        <div className="flex items-center gap-4 w-1/3">
                            <DesktopSearch />
                        </div>

                        {/* Right Side: Time & Status */}
                        <div className="flex items-center gap-6">
                            {/* Isolated Clock Component to prevent AppShell re-renders */}
                            <Clock />
                        </div>

                        <StatusChip status="open" label="MARKET OPEN" showDot={true} className="hidden md:inline-flex" />

                        <Link href="/notifications" className="relative w-9 h-9 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center cursor-pointer transition-colors text-emerald-500">
                            <Bell className="w-4 h-4 font-bold" weight="bold" />
                            {/* Single Amber Dot for Unread Notifications */}
                            <UnreadIndicator />
                        </Link>
                    </div>
            </div>

            {/* Mobile Header (Sticky Top) */}
            <MobileHeader isVisible={isNavVisible} />

            {/* Scrollable Content with Swipe Detection */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto no-scrollbar relative w-full pt-[60px] lg:pt-0"
                {...swipeHandlers}
            >
                {children}
            </div>
        </main>

                {/* --- MOBILE BOTTOM NAV (Phosphor Icons) --- */ }
    <nav
        className={cn(
            "fixed bottom-0 left-0 right-0 h-16 bg-black border-t border-neutral-800 lg:hidden flex items-center justify-around z-50 px-2 pb-safe transition-transform duration-300 ease-in-out",
            !isNavVisible && "translate-y-full"
        )}
    >
        {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            const handleNavClick = (e: React.MouseEvent) => {
                trigger('light');
                if (isActive && scrollContainerRef.current) {
                    e.preventDefault();
                    scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                }
            };

            return (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors active:scale-95 duration-150",
                        isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                >
                    <Icon
                        weight={isActive ? "fill" : "regular"}
                        className={cn(
                            "w-6 h-6 transition-transform",
                            isActive ? "text-foreground scale-110" : ""
                        )}
                    />
                    {/* Label Removed per Phase 13 */}
                </Link>
            );
        })}
    </nav>
            </div >
        </SymbolProvider >
    );
}
