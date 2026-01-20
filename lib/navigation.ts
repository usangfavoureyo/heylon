import {
    House,
    Lightning,
    ChartBar,
    Globe,
    Gear,
    List
} from "@phosphor-icons/react";

export const NAV_ITEMS = [
    {
        label: "Decision",
        href: "/",
        icon: House,
        color: "text-amber-500", // Brand / Primary
    },
    {
        label: "Watchlist",
        href: "/watchlist",
        icon: List,
        color: "text-slate-400", // Neutral
    },
    {
        label: "Signals",
        href: "/signals",
        icon: Lightning,
        color: "text-emerald-500", // Positive / Active
    },
    {
        label: "Market",
        href: "/market",
        icon: ChartBar,
        color: "text-slate-400", // Neutral
    },
    {
        label: "Context",
        href: "/context",
        icon: Globe,
        color: "text-slate-400", // Neutral
    },
    {
        label: "System",
        href: "/system",
        icon: Gear,
        color: "text-slate-500", // Neutral / Dim
    },
];
