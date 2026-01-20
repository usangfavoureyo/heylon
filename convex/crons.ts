import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// 1. News Pulse (NewsAPI) - High Frequency (15m)
crons.interval(
    "fetch-news",
    { minutes: 15 },
    internal.actions.news.fetchNews,
    {}
);

// 2. Macro Pulse (Myfxbook RSS) - Medium Frequency (4h)
crons.interval(
    "fetch-macro",
    { hours: 4 },
    internal.actions.macro.fetchCalendar,
    {}
);



// 5. Automated Risk Management (Heartbeat) - 1m
crons.interval(
    "update-risk-state",
    { minutes: 1 },
    internal.context.updateRiskState,
    {}
);

// 6. Market Data (Yahoo Finance) - Every 5 minutes during market hours
crons.interval(
    "fetch-market-data",
    { minutes: 5 },
    internal.actions.market.fetchMarketData,
    {}
);

export default crons;
