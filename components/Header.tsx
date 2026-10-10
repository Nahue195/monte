"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { Dictionary } from "@/dictionaries";
import { cartCount } from "@/lib/cart";
import { fill } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { useCartUi } from "./cart/CartProvider";
import { useCartLines } from "./cart/store";
import { LocaleSwitch } from "./LocaleSwitch";

type Props = { lang: Locale; nav: Dictionary["nav"]; locale: Dictionary["locale"] };

export function Header({ lang, nav, locale }: Props) {
  const count = cartCount(useCartLines());
  const { openCart } = useCartUi();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <Link href={`/${lang}`} aria-label={nav.home} className="font-display text-xl tracking-[0.25em]">
          MONTE
        </Link>
        <nav className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest sm:gap-2">
          <Link href={`/${lang}/shop`} className="rounded-full px-3 py-3 transition-colors hover:text-hot">
            {nav.shop}
          </Link>
          <Link href={`/${lang}#origen`} className="hidden rounded-full px-3 py-3 transition-colors hover:text-hot sm:inline">
            {nav.origin}
          </Link>
          <LocaleSwitch lang={lang} label={locale.label} />
          <button
            type="button"
            onClick={openCart}
            aria-label={fill(nav.cart, { n: count })}
            data-testid="cart-button"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-panel"
          >
            <ShoppingBag size={18} aria-hidden />
            {count > 0 && (
              <span
                aria-hidden
                className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-hot px-1 text-[10px] font-bold text-bg"
              >
                {count}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
