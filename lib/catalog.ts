import { fold } from "./text.ts";

export const NOTE_TAGS = ["frutal", "citrico", "frutos-rojos", "chocolate", "caramelo", "floral", "nueces", "especiado"] as const;
export const METHODS = ["filtro", "espresso", "prensa", "moka", "cold-brew"] as const;
export const ROASTS = ["claro", "medio", "oscuro"] as const;
export const ATTRS = ["acidity", "body", "sweetness"] as const;
export const SIZES = ["250", "1000"] as const;

export type NoteTag = (typeof NOTE_TAGS)[number];
export type Method = (typeof METHODS)[number];
export type Roast = (typeof ROASTS)[number];
export type Attr = (typeof ATTRS)[number];
export type Size = (typeof SIZES)[number];
export type Level = 1 | 2 | 3 | 4 | 5;
export type Localized = { es: string; en: string };

export type Coffee = {
  slug: string;
  name: string;
  country: Localized;
  region: string;
  farm: string;
  process: Localized;
  varieties: string[];
  roast: Roast;
  notes: { es: string[]; en: string[] };
  noteTags: NoteTag[];
  acidity: Level;
  body: Level;
  sweetness: Level;
  methods: Method[];
  decaf: boolean;
  prices: Record<Size, number>;
  color: string;
  story: Localized;
  featured?: boolean;
};

export function findCoffee(catalog: Coffee[], slug: string): Coffee | undefined {
  return catalog.find((c) => c.slug === slug);
}

// Key the search lexicon uses for origins: "Costa Rica" → "costa rica".
export function countryKey(coffee: Coffee): string {
  return fold(coffee.country.es);
}
