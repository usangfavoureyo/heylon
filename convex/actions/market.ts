"use node";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

const SYMBOLS_MAP: Record<string, string> = {
    "ES": "ES=F",
    "NQ": "NQ=F",
    "YM": "YM=F",
    "RTY": "RTY=F",
    "GC": "GC=F",
    "CL": "CL=F",
    "MNQ": "MNQ=F",
    "MES": "MES=F",
};

export const fetchMarketData = internalAction({
    args: {},
    handler: async (ctx) => {
        const symbols = Object.keys(SYMBOLS_MAP);

        // Fetch in parallel
        await Promise.all(symbols.map(async (sym) => {
            const ticker = SYMBOLS_MAP[sym];
            try {
                const url = `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1m&range=1d`;
                const res = await fetch(url);
                const data = await res.json();

                const meta = data?.chart?.result?.[0]?.meta;
                if (!meta) return;

                const price = meta.regularMarketPrice;
                const prevClose = meta.chartPreviousClose;

                if (typeof price === 'number' && typeof prevClose === 'number') {
                    const change = price - prevClose;
                    const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

                    await ctx.runMutation(internal.market.update, {
                        symbol: sym,
                        price,
                        change,
                        changePercent
                    });
                }
            } catch (e) {
                console.error(`Failed to fetch ${sym}:`, e);
            }
        }));
    }
});
