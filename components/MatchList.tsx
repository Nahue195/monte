import type { Coffee } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";
import { matchLabel, type Labels } from "@/lib/labels";
import type { Match } from "@/lib/search";

type Props = { matches: Match[]; coffee: Coffee; lang: Locale; labels: Labels; title: string; okText: string; missingText: string };

export function MatchList({ matches, coffee, lang, labels, title, okText, missingText }: Props) {
  if (matches.length === 0) return null;
  return (
    <ul aria-label={title} className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
      {matches.map((match, i) => (
        <li key={i} className={match.ok ? "text-ok" : "text-bad"}>
          {matchLabel(match, coffee, labels, lang)} <span aria-hidden>{match.ok ? "✓" : "✗"}</span>
          <span className="sr-only"> ({match.ok ? okText : missingText})</span>
        </li>
      ))}
    </ul>
  );
}
