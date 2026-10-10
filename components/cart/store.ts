"use client";

import { useSyncExternalStore } from "react";
import { COFFEES } from "@/data/coffees";
import { addLine, CART_KEY, parseCart, removeLine, setQty, type CartLine } from "@/lib/cart";
import { createPersisted } from "@/lib/persisted";

const EMPTY: CartLine[] = [];

export const cartStore = createPersisted<CartLine[]>(CART_KEY, (raw) => parseCart(raw, COFFEES), EMPTY);

export function useCartLines(): CartLine[] {
  return useSyncExternalStore(cartStore.subscribe, cartStore.get, cartStore.serverSnapshot);
}

export const cartActions = {
  add: (line: CartLine) => cartStore.set(addLine(cartStore.get(), line)),
  setQty: (key: string, qty: number) => cartStore.set(setQty(cartStore.get(), key, qty)),
  remove: (key: string) => cartStore.set(removeLine(cartStore.get(), key)),
  clear: () => cartStore.set(EMPTY),
};
