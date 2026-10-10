"use client";

import { usePathname } from "next/navigation";
import { switchLocalePath, type Locale } from "@/lib/i18n";

type Props = { lang: Locale; label: string };

// Keeps the current route and query (search, filters) when switching language.
export function LocaleSwitch({ lang, label }: Props) {
  const pathname = usePathname();
  const other: Locale = lang === "es" ? "en" : "es";
  const href = switchLocalePath(pathname, other);

  return (
    <a
      href={href}
      hrefLang={other}
      lang={other}
      aria-label={label}
      onClick={(event) => {
        const rest = window.location.search + window.location.hash;
        if (!rest) return;
        event.preventDefault();
        window.location.assign(href + rest);
      }}
      className="inline-flex h-10 items-center rounded-full px-2 text-xs font-semibold uppercase tracking-widest text-muted transition-colors hover:text-ink"
    >
      {other}
    </a>
  );
}
