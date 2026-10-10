import { SIZES, type Coffee, type Size } from "./catalog.ts";

export const CART_KEY = "monte:cart:v1";
export const GRINDS = ["grano", "filtro", "espresso", "prensa"] as const;
export const MAX_QTY = 10;
export const FREE_SHIPPING_FROM = 40000;
export const SHIPPING_COST = 4500;

export type Grind = (typeof GRINDS)[number];
export type Delivery = "envio" | "retiro";
export type CartLine = { slug: string; grind: Grind; size: Size; qty: number };
export type PricedLine = CartLine & { coffee: Coffee; unitPrice: number; total: number };
export type PricedCart = { lines: PricedLine[]; subtotal: number; shipping: number; total: number; freeShippingGap: number };

const clampQty = (qty: number) => Math.min(MAX_QTY, Math.max(1, Math.trunc(qty)));

export function lineKey(line: Pick<CartLine, "slug" | "grind" | "size">): string {
  return `${line.slug}|${line.grind}|${line.size}`;
}

export function addLine(lines: CartLine[], line: CartLine): CartLine[] {
  const key = lineKey(line);
  if (lines.some((l) => lineKey(l) === key)) {
    return lines.map((l) => (lineKey(l) === key ? { ...l, qty: clampQty(l.qty + line.qty) } : l));
  }
  return [...lines, { ...line, qty: clampQty(line.qty) }];
}

export function removeLine(lines: CartLine[], key: string): CartLine[] {
  return lines.filter((l) => lineKey(l) !== key);
}

export function setQty(lines: CartLine[], key: string, qty: number): CartLine[] {
  if (qty < 1) return removeLine(lines, key);
  return lines.map((l) => (lineKey(l) === key ? { ...l, qty: clampQty(qty) } : l));
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.qty, 0);
}

// Prices always come from the catalog, never from what was stored.
export function priceCart(lines: CartLine[], catalog: Coffee[], delivery: Delivery = "envio"): PricedCart {
  const priced = lines.flatMap((line): PricedLine[] => {
    const coffee = catalog.find((c) => c.slug === line.slug);
    if (!coffee) return [];
    const unitPrice = coffee.prices[line.size];
    return [{ ...line, coffee, unitPrice, total: unitPrice * line.qty }];
  });
  const subtotal = priced.reduce((sum, l) => sum + l.total, 0);
  const free = subtotal >= FREE_SHIPPING_FROM;
  const shipping = priced.length === 0 || delivery === "retiro" || free ? 0 : SHIPPING_COST;
  return {
    lines: priced,
    subtotal,
    shipping,
    total: subtotal + shipping,
    freeShippingGap: free ? 0 : FREE_SHIPPING_FROM - subtotal,
  };
}

export function parseCart(raw: unknown, catalog: Coffee[]): CartLine[] {
  if (!Array.isArray(raw)) return [];
  let lines: CartLine[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const { slug, grind, size, qty } = item as Record<string, unknown>;
    if (typeof slug !== "string" || !catalog.some((c) => c.slug === slug)) continue;
    if (!GRINDS.includes(grind as Grind) || !SIZES.includes(size as Size)) continue;
    if (typeof qty !== "number" || !Number.isFinite(qty) || qty < 1) continue;
    lines = addLine(lines, { slug, grind: grind as Grind, size: size as Size, qty });
  }
  return lines;
}
