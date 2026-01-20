"use client";

import { isMobile, isTablet } from "react-device-detect";

// Helper to construct TradingView Deep Link
export const openTradingViewApp = (symbol: string) => {
    // 1. Resolve Symbol Format (e.g. NQ -> CME_MINI:NQ1!)
    // If simple symbol passed, we might need exchange if known, or let TV resolve.
    // TradingView URL format: https://www.tradingview.com/chart/?symbol={EXCHANGE}:{SYMBOL}
    // Deep link scheme: tradingview://chart?symbol={EXCHANGE}:{SYMBOL}

    const mapSymbol = (s: string) => {
        const u = s.toUpperCase();
        if (u === "NQ") return "CME_MINI:NQ1!";
        if (u === "ES") return "CME_MINI:ES1!";
        if (u === "YM") return "CME_MINI:YM1!";
        if (u === "RTY") return "CME_MINI:RTY1!";
        if (u === "GC") return "COMEX:GC1!";
        if (u === "CL") return "NYMEX:CL1!";
        return s; // Fallback
    };

    const tvSymbol = mapSymbol(symbol);
    const webUrl = `https://www.tradingview.com/chart/?symbol=${tvSymbol}`;

    // 2. Logic
    if (isMobile || isTablet) {
        // Try App Scheme
        const appScheme = `tradingview://chart?symbol=${tvSymbol}`;

        // Timeout Hack for Fallback
        const now = Date.now();
        const timeout = setTimeout(() => {
            if (Date.now() - now < 1500) {
                // App didn't open (page didn't hide), go to Store or Web
                // Going to Web is safer as it might prompt "Open in App" banner
                window.open(webUrl, '_blank');
            }
        }, 500);

        window.location.href = appScheme;
    } else {
        // Desktop: Open Web (which may trigger Desktop App if installed/configured deep linking)
        // Or specific desktop scheme if known? Usually web is best for desktop.
        window.open(webUrl, '_blank');
    }
};
