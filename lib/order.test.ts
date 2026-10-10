import { test } from "node:test";
import assert from "node:assert/strict";
import { COFFEES } from "../data/coffees.ts";
import { priceCart } from "./cart.ts";
import { buildOrder, makeOrderId, parseOrder, schedule } from "./order.ts";

test("makeOrderId usa MNT- y 6 caracteres sin O, I, 0 ni 1", () => {
  assert.equal(makeOrderId(() => 0), "MNT-AAAAAA");
  assert.equal(makeOrderId(() => 0.9999), "MNT-999999");
  for (let i = 0; i < 50; i++) assert.match(makeOrderId(), /^MNT-[A-HJ-NP-Z2-9]{6}$/);
});

test("buildOrder copia precios y no guarda datos personales", () => {
  const cart = priceCart([{ slug: "huila", grind: "filtro", size: "250", qty: 2 }], COFFEES);
  const order = buildOrder(cart, "envio", "MNT-ABC234", "2026-10-09");
  assert.deepEqual(order, {
    id: "MNT-ABC234",
    date: "2026-10-09",
    delivery: "envio",
    lines: [{ slug: "huila", name: "Huila", grind: "filtro", size: "250", qty: 2, unitPrice: 14900, total: 29800 }],
    subtotal: 29800,
    shipping: 4500,
    total: 34300,
  });
  assert.ok(!JSON.stringify(order).includes("4242"));
});

test("parseOrder valida la forma", () => {
  const cart = priceCart([{ slug: "huila", grind: "grano", size: "250", qty: 1 }], COFFEES);
  const order = buildOrder(cart, "retiro", "MNT-ABC234", "2026-10-09");
  assert.deepEqual(parseOrder(JSON.parse(JSON.stringify(order))), order);
  assert.equal(parseOrder(null), null);
  assert.equal(parseOrder({ ...order, id: "X-1" }), null);
  assert.equal(parseOrder({ ...order, lines: [] }), null);
  assert.equal(parseOrder({ ...order, total: "mucho" }), null);
  assert.equal(parseOrder({ ...order, lines: [{ ...order.lines[0], grind: "turbo" }] }), null);
});

test("schedule: tostado el próximo martes y entrega en días hábiles", () => {
  assert.deepEqual(schedule("2026-10-09", "envio"), { roast: "2026-10-13", from: "2026-10-15", to: "2026-10-19" });
  assert.deepEqual(schedule("2026-10-13", "envio"), { roast: "2026-10-20", from: "2026-10-22", to: "2026-10-26" });
  assert.deepEqual(schedule("2026-10-09", "retiro"), { roast: "2026-10-13", from: "2026-10-14", to: "2026-10-14" });
});
