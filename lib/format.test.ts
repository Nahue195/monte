import { test } from "node:test";
import assert from "node:assert/strict";
import { fill, formatDate, formatPrice, levelWord } from "./format.ts";

const plain = (s: string) => s.replace(/\s/g, " ");

test("formatPrice usa pesos sin decimales", () => {
  assert.equal(plain(formatPrice(14900, "es")), "$ 14.900");
  assert.equal(plain(formatPrice(14900, "en")), "ARS 14,900");
});

test("formatDate muestra día de la semana y fecha", () => {
  assert.equal(formatDate("2026-10-13", "es"), "martes, 13 de octubre");
  assert.equal(formatDate("2026-10-13", "en"), "Tuesday, October 13");
});

test("fill reemplaza variables y deja las desconocidas", () => {
  assert.equal(fill("{n} cafés para vos", { n: 3 }), "3 cafés para vos");
  assert.equal(fill("hola {x}", {}), "hola {x}");
});

test("levelWord agrupa 1–5 en bajo, medio y alto", () => {
  assert.deepEqual([1, 2, 3, 4, 5].map(levelWord), ["low", "low", "mid", "high", "high"]);
});
