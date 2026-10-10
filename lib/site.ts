import type { Locale } from "./i18n.ts";

type Env = Record<string, string | undefined>;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

// Pending: set NEXT_PUBLIC_PORTFOLIO_URL to the portfolio's final domain.
export function portfolioUrl(lang: Locale, env: Env = process.env): string {
  const base = env.NEXT_PUBLIC_PORTFOLIO_URL?.replace(/\/+$/, "");
  return base ? `${base}/${lang}` : "#";
}
