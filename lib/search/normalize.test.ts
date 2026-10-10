import { test } from "node:test";
import assert from "node:assert/strict";
import { MAX_QUERY_LENGTH, normalize } from "./normalize.ts";

test("minúsculas, sin tildes ni signos", () => {
  assert.deepEqual(normalize("¿Algo FRUTAL, no muy ácido?"), ["algo", "frutal", "no", "muy", "acido"]);
  assert.deepEqual(normalize("Nariño"), ["narino"]);
});

test("unifica precios", () => {
  assert.deepEqual(normalize("menos de $15.000"), ["menos", "de", "15000"]);
  assert.deepEqual(normalize("hasta 15 mil"), ["hasta", "15000"]);
  assert.deepEqual(normalize("under 20k"), ["under", "20000"]);
  assert.deepEqual(normalize("hasta 1.500.000"), ["hasta", "1500000"]);
});

test("vacío y espacios devuelven lista vacía", () => {
  assert.deepEqual(normalize(""), []);
  assert.deepEqual(normalize("   ¿?  "), []);
});

test("recorta textos largos", () => {
  const tokens = normalize("cafe ".repeat(100));
  assert.ok(tokens.join(" ").length <= MAX_QUERY_LENGTH);
});
