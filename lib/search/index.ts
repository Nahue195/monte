import type { Coffee, Method, Roast } from "../catalog.ts";
import { interpret } from "./interpret.ts";
import { rank, type SearchResult } from "./rank.ts";

export type { Match, MatchKey, Result, SearchResult, SearchStatus } from "./rank.ts";
export type { Query, Range } from "./types.ts";

export type Filters = { method?: Method | null; roast?: Roast | null };

export function search(coffees: Coffee[], text: string, filters: Filters = {}): SearchResult {
  const q = interpret(text);
  return rank(coffees, q, text.trim().length > 0, filters);
}
