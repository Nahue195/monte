import { ROASTS } from "../catalog.ts";
import { normalize } from "./normalize.ts";
import { recognize } from "./recognize.ts";
import type { Query, Range, Term } from "./types.ts";

export const CHEAP_MAX = 13000;

const MILD_NEGATIONS = ["no muy", "no tan", "not very", "not too", "nothing too", "no demasiado"];
const LOWERS = new Set(["bajo", "baja", "low", "less", "little"]);
// Phrases that negate the next recognized term when it starts within CUE_WINDOW tokens of the cue's end.
const NEGATION_CUES = [
  "no me gusta", "no me gustan", "no quiero", "odio", "detesto", "i don t like", "don t like", "do not like",
  "i hate", "hate", "dislike", "don t want", "do not want", "i do not want",
].map((c) => c.split(" "));
const CUE_WINDOW = 4;
const NEGATIONS = new Set(["no", "nada", "sin", "poco", "poca", "ni", "not", "without"]);
const INTENSIFIERS = new Set(["muy", "bien", "re", "super", "mas", "bastante", "very", "really", "more", "extra"]);

type Modifier = "mild-neg" | "neg" | "low" | "up" | null;

export function emptyQuery(): Query {
  return { notes: [], excludeNotes: [], methods: [], roasts: [], origins: [], levels: {}, decaf: false, excludeDecaf: false, recognized: 0 };
}

export function hasCriteria(q: Query): boolean {
  return (
    q.notes.length + q.excludeNotes.length + q.methods.length + q.roasts.length + q.origins.length > 0 ||
    Object.keys(q.levels).length > 0 ||
    q.maxPrice !== undefined ||
    q.decaf ||
    q.excludeDecaf
  );
}

function cueEnds(tokens: string[]): number[] {
  const ends: number[] = [];
  for (const cue of NEGATION_CUES) {
    for (let i = 0; i + cue.length <= tokens.length; i++) {
      if (cue.every((w, k) => tokens[i + k] === w)) ends.push(i + cue.length);
    }
  }
  return ends;
}

function modifierOf(before: string[], after?: string): Modifier {
  const joined = before.join(" ");
  if (MILD_NEGATIONS.some((m) => joined.endsWith(m))) return "mild-neg";
  if (before.some((w) => NEGATIONS.has(w))) return "neg";
  if (before.some((w) => LOWERS.has(w)) || (after !== undefined && LOWERS.has(after))) return "low";
  if (before.some((w) => INTENSIFIERS.has(w))) return "up";
  return null;
}

const add = <T>(list: T[], value: T) => {
  if (!list.includes(value)) list.push(value);
};

function levelRange(dir: "up" | "down", mod: Modifier): Range {
  if (dir === "down" || mod === "low") return { max: 2 };
  if (mod === "mild-neg") return { max: 3 };
  if (mod === "neg") return { max: 2 };
  return mod === "up" ? { min: 4 } : { min: 3 };
}

function apply(q: Query, term: Term, mod: Modifier) {
  const negated = mod === "neg" || mod === "mild-neg";
  switch (term.kind) {
    case "note":
      if (negated) {
        add(q.excludeNotes, term.value);
        q.notes = q.notes.filter((n) => n !== term.value);
      } else if (!q.excludeNotes.includes(term.value)) {
        add(q.notes, term.value);
      }
      break;
    case "method":
      if (!negated) add(q.methods, term.value);
      break;
    case "roast":
      for (const roast of negated ? ROASTS.filter((r) => r !== term.value) : [term.value]) add(q.roasts, roast);
      break;
    case "origin":
      if (!negated) for (const origin of term.value) add(q.origins, origin);
      break;
    case "level":
      q.levels[term.attr] = levelRange(term.dir, mod);
      break;
    case "decaf":
      if (negated) q.excludeDecaf = true;
      else q.decaf = true;
      break;
    case "ignore":
      break;
    case "cheap":
      q.maxPrice = Math.min(q.maxPrice ?? Infinity, CHEAP_MAX);
      break;
    case "price":
      q.maxPrice = Math.min(q.maxPrice ?? Infinity, term.max);
      break;
    case "price-cue":
      break;
  }
}

export function interpret(text: string): Query {
  const tokens = normalize(text);
  const hits = recognize(tokens);
  const ends = cueEnds(tokens);
  const q = emptyQuery();
  let previousEnd = 0;
  for (const hit of hits) {
    const before = tokens.slice(Math.max(previousEnd, hit.start - 2), hit.start);
    let mod = modifierOf(before, tokens[hit.end]);
    // A cue only reaches the first term after it, so "no me gusta el chocolate, quiero frutal" keeps frutal.
    if (mod === null || mod === "up" || mod === "low") {
      if (ends.some((e) => e >= previousEnd && e <= hit.start && hit.start - e <= CUE_WINDOW)) mod = "neg";
    }
    if (hit.term.kind !== "ignore") apply(q, hit.term, mod);
    previousEnd = hit.end;
  }
  q.recognized = hits.filter((h) => h.term.kind !== "ignore").length;
  return q;
}
