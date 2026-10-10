import type { Coffee, Method, Roast } from "../catalog.ts";
import { interpret } from "./interpret.ts";
import { rank, type SearchResult } from "./rank.ts";

export type { Match, MatchKey, Result, SearchResult, SearchStatus } from "./rank.ts";
export type { Query, Range } from "./types.ts";

export type Filters = { method?: Method | null; roast?: Roast | null };

export function search(coffees: Coffee[], text: string, filters: Filters = {}): SearchResult {
  const q = interpret(text);
  if (filters.method && !q.methods.includes(filters.method)) q.methods.push(filters.method);
  if (filters.roast && !q.roasts.includes(filters.roast)) q.roasts.push(filters.roast);
  return rank(coffees, q, text.trim().length > 0);
}
