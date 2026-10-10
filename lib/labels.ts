import type { Dictionary } from "../dictionaries/es.ts";
import type { Coffee } from "./catalog.ts";
import { fill, formatPrice, levelWord } from "./format.ts";
import type { Locale } from "./i18n.ts";
import type { Match } from "./search/rank.ts";

export type Labels = Dictionary["labels"];

const join = (parts: string[]) => parts.join(" / ");

// Text for one "✓ / ✗" chip under a search result.
export function matchLabel(match: Match, coffee: Coffee, labels: Labels, lang: Locale): string {
  const { key } = match;
  switch (key.type) {
    case "notes":
      return join(key.values.map((v) => labels.notes[v]));
    case "method":
      return join(key.values.map((v) => labels.methods[v]));
    case "roast":
      return join(key.values.map((v) => labels.roasts[v]));
    case "origin":
      return join(key.values.map((v) => (labels.origins as Record<string, string>)[v] ?? v));
    case "level":
      return `${labels.attrs[key.attr]} ${labels.levels[key.attr][levelWord(coffee[key.attr])]}`;
    case "exclude":
      return fill(labels.without, { note: labels.notes[key.value] });
    case "price":
      return fill(labels.upTo, { price: formatPrice(key.max, lang) });
    case "decaf":
      return labels.decaf;
    case "no-decaf":
      return labels.caffeinated;
  }
}
