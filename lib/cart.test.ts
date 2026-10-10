import { test } from "node:test";
import assert from "node:assert/strict";
import { COFFEES } from "../data/coffees.ts";
import { addLine, cartCount, lineKey, parseCart, priceCart, removeLine, setQty, type CartLine } from "./cart.ts";

const huila250: CartLine = { slug: "huila", grind: "grano", size: "250", qty: 1 };

test("agregar la misma combinación suma cantidad", () => {
  const lines = addLine(addLine([], huila250), { ...huila250, qty: 2 });
  assert.deepEqual(lines, [{ ...huila250, qty: 3 }]);
});

test("otra molienda o peso es otra línea", () => {
  const lines = addLine(addLine([], huila250), { ...huila250, grind: "filtro" });
  assert.equal(lines.length, 2);
  assert.equal(cartCount(lines), 2);
});

test("la cantidad se recorta a 1–10", () => {
  assert.equal(addLine([], { ...huila250, qty: 50 })[0].qty, 10);
  const key = lineKey(huila250);
  assert.equal(setQty([huila250], key, 12)[0].qty, 10);
  assert.deepEqual(setQty([huila250], key, 0), []);
  assert.deepEqual(removeLine([huila250], key), []);
});

test("precio, envío y envío gratis", () => {
  const one = priceCart([huila250], COFFEES);
  assert.equal(one.subtotal, 14900);
  assert.equal(one.shipping, 4500);
  assert.equal(one.total, 19400);
  assert.equal(one.freeShippingGap, 25100);

  const big = priceCart([{ ...huila250, size: "1000" }], COFFEES);
  assert.equal(big.subtotal, 50900);
  assert.equal(big.shipping, 0);
  assert.equal(big.freeShippingGap, 0);

  assert.equal(priceCart([huila250], COFFEES, "retiro").shipping, 0);
  assert.equal(priceCart([], COFFEES).shipping, 0);
});

test("priceCart ignora cafés que ya no existen", () => {
  const priced = priceCart([huila250, { ...huila250, slug: "borrado" }], COFFEES);
  assert.equal(priced.lines.length, 1);
  assert.equal(priced.lines[0].unitPrice, 14900);
});

test("parseCart descarta basura y recorta cantidades", () => {
  const raw = [
    huila250,
    { slug: "borrado", grind: "grano", size: "250", qty: 1 },
    { slug: "sidama", grind: "turbo", size: "250", qty: 1 },
    { slug: "sidama", grind: "grano", size: "500", qty: 1 },
    { slug: "sidama", grind: "grano", size: "250", qty: "abc" },
    { slug: "guji", grind: "filtro", size: "1000", qty: 99 },
    null,
    "x",
    { ...huila250, qty: 2 },
  ];
  assert.deepEqual(parseCart(raw, COFFEES), [
    { ...huila250, qty: 3 },
    { slug: "guji", grind: "filtro", size: "1000", qty: 10 },
  ]);
  assert.deepEqual(parseCart({ not: "an array" }, COFFEES), []);
});
