import { ATTRS, countryKey, type Attr, type Coffee, type Method, type NoteTag, type Roast } from "../catalog.ts";
import type { Query, Range } from "./types.ts";

export const NOTE_FAMILY: Record<NoteTag, NoteTag[]> = {
  frutal: ["frutal", "citrico", "frutos-rojos"],
  citrico: ["citrico"],
  "frutos-rojos": ["frutos-rojos"],
  chocolate: ["chocolate"],
  caramelo: ["caramelo"],
  floral: ["floral"],
  nueces: ["nueces"],
  especiado: ["especiado"],
};

export type MatchKey =
  | { type: "notes"; values: NoteTag[] }
  | { type: "method"; values: Method[] }
  | { type: "roast"; values: Roast[] }
  | { type: "origin"; values: string[] }
  | { type: "level"; attr: Attr; range: Range }
  | { type: "exclude"; value: NoteTag }
  | { type: "price"; max: number }
  | { type: "decaf" }
  | { type: "no-decaf" };

export type Match = { key: MatchKey; ok: boolean };
export type Result = { coffee: Coffee; score: number; matches: Match[]; close: boolean };
export type SearchStatus = "all" | "matched" | "not-understood" | "none-pass";
export type SearchResult = { status: SearchStatus; results: Result[] };

type Soft = { key: MatchKey; weight: number; score: (c: Coffee) => number };
type Hard = { key: MatchKey; pass: (c: Coffee) => boolean };

const family = (notes: NoteTag[]) => notes.flatMap((n) => NOTE_FAMILY[n]);
const hasAny = (c: Coffee, tags: NoteTag[]) => c.noteTags.some((t) => tags.includes(t));

export function levelScore(value: number, range: Range): number {
  const distance =
    range.min !== undefined && value < range.min
      ? range.min - value
      : range.max !== undefined && value > range.max
        ? value - range.max
        : 0;
  if (distance === 0) return 1;
  return distance === 1 ? 0.5 : 0;
}

export type RankFilters = { method?: Method | null; roast?: Roast | null };

function criteria(q: Query, filters: RankFilters): { soft: Soft[]; hard: Hard[] } {
  const soft: Soft[] = [];
  const hard: Hard[] = [];
  if (q.notes.length) {
    const tags = family(q.notes);
    soft.push({ key: { type: "notes", values: q.notes }, weight: 3, score: (c) => (hasAny(c, tags) ? 1 : 0) });
  }
  if (q.methods.length) {
    soft.push({ key: { type: "method", values: q.methods }, weight: 3, score: (c) => (c.methods.some((m) => q.methods.includes(m)) ? 1 : 0) });
  }
  if (q.roasts.length) {
    soft.push({ key: { type: "roast", values: q.roasts }, weight: 2, score: (c) => (q.roasts.includes(c.roast) ? 1 : 0) });
  }
  if (q.origins.length) {
    soft.push({ key: { type: "origin", values: q.origins }, weight: 2, score: (c) => (q.origins.includes(countryKey(c)) ? 1 : 0) });
  }
  for (const attr of ATTRS) {
    const range = q.levels[attr];
    if (range) soft.push({ key: { type: "level", attr, range }, weight: 2, score: (c) => levelScore(c[attr], range) });
  }
  for (const note of q.excludeNotes) {
    const tags = NOTE_FAMILY[note];
    hard.push({ key: { type: "exclude", value: note }, pass: (c) => !hasAny(c, tags) });
  }
  if (q.maxPrice !== undefined) {
    const max = q.maxPrice;
    hard.push({ key: { type: "price", max }, pass: (c) => c.prices["250"] <= max });
  }
  if (q.decaf) hard.push({ key: { type: "decaf" }, pass: (c) => c.decaf });
  if (q.excludeDecaf) hard.push({ key: { type: "no-decaf" }, pass: (c) => !c.decaf });
  // Quick filters are hard. A typed criterion identical to the filter would show the same chip twice, so drop it.
  const dropSoft = (type: "method" | "roast", value: string) => {
    const i = soft.findIndex((s) => s.key.type === type && (s.key as { values: string[] }).values.length === 1 && (s.key as { values: string[] }).values[0] === value);
    if (i >= 0) soft.splice(i, 1);
  };
  if (filters.method) {
    const m = filters.method;
    dropSoft("method", m);
    hard.push({ key: { type: "method", values: [m] }, pass: (c) => c.methods.includes(m) });
  }
  if (filters.roast) {
    const ro = filters.roast;
    dropSoft("roast", ro);
    hard.push({ key: { type: "roast", values: [ro] }, pass: (c) => c.roast === ro });
  }
  return { soft, hard };
}

const byName = (a: Coffee, b: Coffee) => a.name.localeCompare(b.name, "es");
const byScoreThenName = (a: Result, b: Result) => b.score - a.score || byName(a.coffee, b.coffee);

export function rank(coffees: Coffee[], q: Query, hasText: boolean, filters: RankFilters = {}): SearchResult {
  const { soft, hard } = criteria(q, filters);

  if (soft.length === 0 && hard.length === 0) {
    const ordered = [...coffees].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || byName(a, b));
    return {
      status: hasText ? "not-understood" : "all",
      results: ordered.map((coffee) => ({ coffee, score: 0, matches: [], close: false })),
    };
  }

  const possible = soft.reduce((sum, s) => sum + s.weight, 0);
  const evaluated = coffees.map((coffee) => {
    const scores = soft.map((s) => s.score(coffee));
    const got = soft.reduce((sum, s, i) => sum + s.weight * scores[i], 0);
    const passes = hard.map((h) => h.pass(coffee));
    const matches: Match[] = [
      ...soft.map((s, i) => ({ key: s.key, ok: scores[i] === 1 })),
      ...hard.map((h, i) => ({ key: h.key, ok: passes[i] })),
    ];
    const result: Result = { coffee, score: possible ? got / possible : 1, matches, close: false };
    return { result, passesAll: passes.every(Boolean) };
  });
  evaluated.sort((a, b) => byScoreThenName(a.result, b.result));

  const passing = evaluated.filter((e) => e.passesAll).map((e) => e.result);
  if (passing.length === 0) {
    return { status: "none-pass", results: evaluated.slice(0, 3).map((e) => e.result) };
  }

  const hits = passing.filter((r) => r.score > 0);
  const fill = passing
    .filter((r) => r.score === 0)
    .slice(0, Math.max(0, 3 - hits.length))
    .map((r) => ({ ...r, close: true }));
  return { status: "matched", results: [...hits, ...fill] };
}
