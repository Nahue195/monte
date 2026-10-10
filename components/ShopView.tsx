"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { COFFEES } from "@/data/coffees";
import type { Dictionary } from "@/dictionaries";
import { METHODS, ROASTS, type Method, type Roast } from "@/lib/catalog";
import { fill } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { search } from "@/lib/search";
import { MAX_QUERY_LENGTH } from "@/lib/search/normalize";
import { ExampleChips } from "./ExampleChips";
import { ResultCard } from "./ResultCard";
import { useFlip } from "./useFlip";

type Props = { lang: Locale; dict: Pick<Dictionary, "search" | "shop" | "labels" | "product" | "cart"> };

const asMethod = (v: string | null) => (METHODS as readonly string[]).includes(v ?? "") ? (v as Method) : null;
const asRoast = (v: string | null) => (ROASTS as readonly string[]).includes(v ?? "") ? (v as Roast) : null;

export function ShopView({ lang, dict }: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [text, setText] = useState(() => params.get("q") ?? "");
  const method = asMethod(params.get("m"));
  const roast = asRoast(params.get("r"));
  const query = useDeferredValue(text);
  const result = useMemo(() => search(COFFEES, query, { method, roast }), [query, method, roast]);
  const flip = useFlip(result.results.map((r) => r.coffee.slug));

  const writeUrl = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(window.location.search);
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  // Keep the URL shareable without rewriting it on every keystroke.
  useEffect(() => {
    const id = setTimeout(() => writeUrl({ q: text.trim() || null }), 300);
    return () => clearTimeout(id);
  }, [text, writeUrl]);

  const n = result.results.length;
  const statusText =
    result.status === "all"
      ? fill(dict.shop.all, { n })
      : result.status === "matched"
        ? `${fill(dict.shop.results, { n })} · ${dict.shop.sortedBy}`
        : result.status === "none-pass"
          ? dict.shop.nonePass
          : dict.shop.notUnderstood;

  return (
    <div>
      <div role="search" className="flex items-center gap-2 rounded-full border border-line bg-panel py-1.5 pl-4 pr-1.5">
        <Search size={18} aria-hidden className="shrink-0 text-muted" />
        <input
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_QUERY_LENGTH))}
          maxLength={MAX_QUERY_LENGTH}
          aria-label={dict.search.label}
          placeholder={dict.search.placeholder}
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-ink outline-none placeholder:text-muted"
        />
        {text && (
          <button
            type="button"
            onClick={() => setText("")}
            aria-label={dict.search.clear}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted hover:text-ink"
          >
            <X size={18} aria-hidden />
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6">
        <FilterGroup
          label={dict.shop.method}
          anyLabel={dict.shop.any}
          options={METHODS.map((m) => ({ value: m, label: dict.labels.methods[m] }))}
          current={method}
          onChange={(value) => writeUrl({ m: value })}
        />
        <FilterGroup
          label={dict.shop.roast}
          anyLabel={dict.shop.any}
          options={ROASTS.map((r) => ({ value: r, label: dict.labels.roasts[r] }))}
          current={roast}
          onChange={(value) => writeUrl({ r: value })}
        />
      </div>

      <p role="status" aria-live="polite" className="mt-6 text-sm text-muted" data-testid="results-status">
        {statusText}
      </p>
      {result.status === "not-understood" && (
        <ExampleChips lang={lang} label={dict.search.examplesLabel} examples={dict.search.examples} onPick={setText} />
      )}

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.results.map((r) => (
          <li key={r.coffee.slug} ref={flip(r.coffee.slug)}>
            <ResultCard result={r} lang={lang} dict={dict} />
          </li>
        ))}
      </ul>
    </div>
  );
}

type FilterGroupProps = {
  label: string;
  anyLabel: string;
  options: { value: string; label: string }[];
  current: string | null;
  onChange: (value: string | null) => void;
};

function FilterGroup({ label, anyLabel, options, current, onChange }: FilterGroupProps) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="text-xs uppercase tracking-widest text-muted">{label}</span>
      <button type="button" className="chip" aria-pressed={current === null} onClick={() => onChange(null)}>
        {anyLabel}
      </button>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="chip"
          aria-pressed={current === option.value}
          onClick={() => onChange(current === option.value ? null : option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
