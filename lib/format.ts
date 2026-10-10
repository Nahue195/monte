import { intlLocale, type Locale } from "./i18n.ts";

export function formatPrice(amount: number, lang: Locale): string {
  return new Intl.NumberFormat(intlLocale(lang), {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string, lang: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(lang), {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}

export function levelWord(n: number): "low" | "mid" | "high" {
  if (n <= 2) return "low";
  return n === 3 ? "mid" : "high";
}
