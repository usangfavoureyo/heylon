/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_macro from "../actions/macro.js";
import type * as actions_market from "../actions/market.js";
import type * as actions_news from "../actions/news.js";
import type * as actions_push from "../actions/push.js";
import type * as actions_scrape from "../actions/scrape.js";
import type * as auth from "../auth.js";
import type * as context from "../context.js";
import type * as context_actions from "../context_actions.js";
import type * as context_query from "../context_query.js";
import type * as crons from "../crons.js";
import type * as decision from "../decision.js";
import type * as engine from "../engine.js";
import type * as events from "../events.js";
import type * as http from "../http.js";
import type * as jury from "../jury.js";
import type * as lib_viability from "../lib/viability.js";
import type * as logs from "../logs.js";
import type * as market from "../market.js";
import type * as notifications from "../notifications.js";
import type * as push from "../push.js";
import type * as raw_events from "../raw_events.js";
import type * as settings from "../settings.js";
import type * as signals from "../signals.js";
import type * as watchlist from "../watchlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/macro": typeof actions_macro;
  "actions/market": typeof actions_market;
  "actions/news": typeof actions_news;
  "actions/push": typeof actions_push;
  "actions/scrape": typeof actions_scrape;
  auth: typeof auth;
  context: typeof context;
  context_actions: typeof context_actions;
  context_query: typeof context_query;
  crons: typeof crons;
  decision: typeof decision;
  engine: typeof engine;
  events: typeof events;
  http: typeof http;
  jury: typeof jury;
  "lib/viability": typeof lib_viability;
  logs: typeof logs;
  market: typeof market;
  notifications: typeof notifications;
  push: typeof push;
  raw_events: typeof raw_events;
  settings: typeof settings;
  signals: typeof signals;
  watchlist: typeof watchlist;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
