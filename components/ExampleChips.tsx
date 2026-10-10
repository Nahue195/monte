"use client";

import Link from "next/link";
import type { Locale } from "@/lib/i18n";

type Props = { lang: Locale; label: string; examples: string[]; onPick?: (example: string) => void };

export function ExampleChips({ lang, label, examples, onPick }: Props) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="text-xs uppercase tracking-widest text-muted">{label}</span>
      {examples.map((example) =>
        onPick ? (
          <button key={example} type="button" className="chip" onClick={() => onPick(example)}>
            {example}
          </button>
        ) : (
          <Link key={example} href={`/${lang}/shop?q=${encodeURIComponent(example)}`} className="chip">
            {example}
          </Link>
        ),
      )}
    </div>
  );
}
