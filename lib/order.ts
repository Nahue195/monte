import { SIZES, type Size } from "./catalog.ts";
import { GRINDS, type Delivery, type Grind, type PricedCart } from "./cart.ts";
import { addBusinessDays, nextWeekday } from "./dates.ts";

export const ORDER_KEY = "monte:order:v1";
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const TUESDAY = 2;

export type OrderLine = { slug: string; name: string; grind: Grind; size: Size; qty: number; unitPrice: number; total: number };
export type Order = {
  id: string;
  date: string;
  delivery: Delivery;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
};

export function makeOrderId(random: () => number = Math.random): string {
  let id = "MNT-";
  for (let i = 0; i < 6; i++) id += ALPHABET[Math.floor(random() * ALPHABET.length)];
  return id;
}

// Only what the confirmation page needs: no contact or card data.
export function buildOrder(cart: PricedCart, delivery: Delivery, id: string, date: string): Order {
  return {
    id,
    date,
    delivery,
    lines: cart.lines.map((l) => ({
      slug: l.slug,
      name: l.coffee.name,
      grind: l.grind,
      size: l.size,
      qty: l.qty,
      unitPrice: l.unitPrice,
      total: l.total,
    })),
    subtotal: cart.subtotal,
    shipping: cart.shipping,
    total: cart.total,
  };
}

const isNumber = (value: unknown) => typeof value === "number" && Number.isFinite(value);

function isOrderLine(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return false;
  const l = raw as Record<string, unknown>;
  return (
    typeof l.slug === "string" &&
    typeof l.name === "string" &&
    GRINDS.includes(l.grind as Grind) &&
    SIZES.includes(l.size as Size) &&
    [l.qty, l.unitPrice, l.total].every(isNumber)
  );
}

export function parseOrder(raw: unknown): Order | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || !/^MNT-[A-Z2-9]{6}$/.test(o.id)) return null;
  if (typeof o.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(o.date)) return null;
  if (o.delivery !== "envio" && o.delivery !== "retiro") return null;
  if (!Array.isArray(o.lines) || o.lines.length === 0 || !o.lines.every(isOrderLine)) return null;
  if (![o.subtotal, o.shipping, o.total].every(isNumber)) return null;
  return raw as Order;
}

// We roast on Tuesdays; shipping takes 2–4 business days, pickup opens the next business day.
export function schedule(date: string, delivery: Delivery): { roast: string; from: string; to: string } {
  const roast = nextWeekday(date, TUESDAY);
  if (delivery === "retiro") {
    const from = addBusinessDays(roast, 1);
    return { roast, from, to: from };
  }
  return { roast, from: addBusinessDays(roast, 2), to: addBusinessDays(roast, 4) };
}
