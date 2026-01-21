"use client";

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const AUTHORIZED_SYMBOLS = ['ES', 'NQ', 'MNQ', 'MES', 'YM', 'MYM', 'RTY', 'M2K', 'GC', 'CL'] as const;
export type FuturesSymbol = string; // Relaxed to string to allow dynamic watchlist

interface SymbolContextType {
    activeSymbol: FuturesSymbol;
    setActiveSymbol: (symbol: FuturesSymbol) => void;
    AUTHORIZED_SYMBOLS: typeof AUTHORIZED_SYMBOLS;
}

const SymbolContext = createContext<SymbolContextType | undefined>(undefined);

export function SymbolProvider({ children }: { children: ReactNode }) {
    // 1. Fetch Source of Truth from Convex
    const watchlist = useQuery(api.watchlist.get);
    const setActiveMutation = useMutation(api.watchlist.setActiveSymbol);

    // 2. Derive active symbol (Default NQ if loading/missing)
    const activeSymbol = watchlist ? (watchlist as any).active_symbol : "NQ";

    // 3. Setter Wrapper
    const handleSetActive = React.useCallback((symbol: FuturesSymbol) => {
        setActiveMutation({ symbol });
    }, [setActiveMutation]);

    const value = React.useMemo(() => ({
        activeSymbol,
        setActiveSymbol: handleSetActive,
        AUTHORIZED_SYMBOLS
    }), [activeSymbol, handleSetActive]);

    return (
        <SymbolContext.Provider value={value}>
            {children}
        </SymbolContext.Provider>
    );
}

export function useSymbol() {
    const context = useContext(SymbolContext);
    if (context === undefined) {
        throw new Error('useSymbol must be used within a SymbolProvider');
    }
    return context;
}
