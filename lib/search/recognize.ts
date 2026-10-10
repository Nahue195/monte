import { LEXICON, STOPWORDS } from "./lexicon.ts";
import type { Hit, Term } from "./types.ts";

const exact = new Map<string, Term>();
const singleWords: { word: string; term: Term }[] = [];
for (const { phrases, term } of LEXICON) {
  for (const phrase of phrases) {
    exact.set(phrase, term);
    if (!phrase.includes(" ")) singleWords.push({ word: phrase, term });
  }
}

// Damerau–Levenshtein, optimal string alignment variant (a swap of two letters costs 1).
export function editDistance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

function allowedTypos(word: string): number {
  if (word.length >= 7) return 2;
  return word.length >= 4 ? 1 : 0;
}

function fuzzyWord(word: string): Term | undefined {
  const allowed = allowedTypos(word);
  if (allowed === 0 || STOPWORDS.has(word) || /\d/.test(word)) return undefined;
  let best: { term: Term; distance: number } | undefined;
  for (const candidate of singleWords) {
    if (Math.abs(candidate.word.length - word.length) > allowed) continue;
    const distance = editDistance(word, candidate.word);
    if (distance <= allowed && (!best || distance < best.distance)) best = { term: candidate.term, distance };
  }
  return best?.term;
}

// Longest phrase first (3, 2, 1 words); single words may carry a typo.
export function recognize(tokens: string[]): Hit[] {
  const hits: Hit[] = [];
  let i = 0;
  while (i < tokens.length) {
    let advanced = false;
    for (const len of [3, 2, 1]) {
      if (i + len > tokens.length) continue;
      const phrase = tokens.slice(i, i + len).join(" ");
      const term = exact.get(phrase) ?? (len === 1 ? fuzzyWord(phrase) : undefined);
      if (!term) continue;
      if (term.kind === "price-cue") {
        const next = tokens[i + len];
        if (next === undefined || !/^\d+$/.test(next)) continue;
        hits.push({ term: { kind: "price", max: Number(next) }, start: i, end: i + len + 1 });
        i += len + 1;
      } else {
        hits.push({ term, start: i, end: i + len });
        i += len;
      }
      advanced = true;
      break;
    }
    if (!advanced) i++;
  }
  return hits;
}
