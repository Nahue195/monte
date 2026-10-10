export const locales = ["es", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

// Parses an Accept-Language header and returns the best supported locale.
export function pickLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale;

  const ranked = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.split(";");
      const qParam = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const quality = qParam ? Number(qParam.slice(2)) : 1;
      return {
        lang: tag.trim().toLowerCase().split("-")[0],
        quality: Number.isFinite(quality) ? quality : 0,
        index,
      };
    })
    .filter((entry) => entry.lang && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  for (const { lang } of ranked) {
    if (isLocale(lang)) return lang;
  }
  return defaultLocale;
}

// Same URL with the locale as path, keeping the query string (UTM and friends).
export function localizedUrl(requestUrl: string, locale: Locale): URL {
  const url = new URL(requestUrl);
  url.pathname = `/${locale}`;
  return url;
}

export function intlLocale(lang: Locale): string {
  return lang === "es" ? "es-AR" : "en-US";
}

// "/es/shop" → "/en/shop": routes are the same in both languages.
export function switchLocalePath(pathname: string, to: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && isLocale(segments[0])) segments.shift();
  return `/${[to, ...segments].join("/")}`;
}
