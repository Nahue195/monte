import Link from "next/link";
import type { ReactNode } from "react";
import type { Coffee } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { CoffeeBag } from "./CoffeeBag";

type Props = {
  coffee: Coffee;
  lang: Locale;
  sizeLabel: string;
  badge?: string;
  action?: ReactNode;
  children?: ReactNode;
};

export function CoffeeCard({ coffee, lang, sizeLabel, badge, action, children }: Props) {
  return (
    <article className="flex h-full flex-col rounded-2xl bg-panel p-3" data-testid="coffee-card" data-slug={coffee.slug}>
      <Link href={`/${lang}/coffee/${coffee.slug}`} className="group block rounded-xl">
        <CoffeeBag coffee={coffee} lang={lang} />
        <h3 className="mt-3 font-display text-lg uppercase transition-colors group-hover:text-hot">{coffee.name}</h3>
      </Link>
      <p className="text-sm text-muted">
        {coffee.country[lang]} · {coffee.notes[lang].join(", ")}
      </p>
      {badge && (
        <span className="mt-2 self-start rounded-full border border-line px-2 py-0.5 text-[11px] uppercase tracking-wider text-muted">
          {badge}
        </span>
      )}
      {children}
      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        <p className="text-sm">
          <span className="font-semibold text-hot">{formatPrice(coffee.prices["250"], lang)}</span>
          <span className="text-muted"> · {sizeLabel}</span>
        </p>
        {action}
      </div>
    </article>
  );
}
