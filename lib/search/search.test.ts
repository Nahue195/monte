import { test } from "node:test";
import assert from "node:assert/strict";
import { COFFEES } from "../../data/coffees.ts";
import { search } from "./index.ts";

test("la frase de ejemplo encuentra cafés frutales para filtro", () => {
  const r = search(COFFEES, "algo frutal para filtro, no muy ácido");
  assert.equal(r.status, "matched");
  const top = r.results.filter((x) => x.score === 1).map((x) => x.coffee.slug);
  assert.ok(top.includes("huila"), top.join(","));
  assert.ok(!top.includes("kirinyaga"), "kirinyaga tiene acidez 5");
});

test("chocolatoso para espresso pone primero cafés con chocolate y espresso", () => {
  const first = search(COFFEES, "chocolatoso para espresso").results[0].coffee;
  assert.ok(first.noteTags.includes("chocolate") && first.methods.includes("espresso"), first.slug);
});

test("descafeinado devuelve solo el decaf", () => {
  assert.deepEqual(search(COFFEES, "descafeinado").results.map((x) => x.coffee.slug), ["huila-decaf"]);
});

test("texto sin sentido muestra todo el catálogo y avisa", () => {
  const r = search(COFFEES, "xyz");
  assert.equal(r.status, "not-understood");
  assert.equal(r.results.length, 12);
  assert.deepEqual(r.results.slice(0, 3).map((x) => x.coffee.slug), ["guji", "huila", "mogiana"]);
});

test("los filtros se suman a la búsqueda", () => {
  const r = search(COFFEES, "", { method: "moka" });
  assert.equal(r.status, "matched");
  assert.ok(r.results.filter((x) => !x.close).every((x) => x.coffee.methods.includes("moka")));
});

test("búsqueda vacía sin filtros devuelve todo", () => {
  assert.equal(search(COFFEES, "   ").status, "all");
});

test("el filtro de método es un filtro duro", () => {
  const r = search(COFFEES, "frutal", { method: "espresso" });
  assert.equal(r.status, "matched");
  assert.ok(r.results.length > 0);
  assert.ok(r.results.every((x) => x.coffee.methods.includes("espresso")));
});

test("roast claro + método espresso sin coincidencias da none-pass", () => {
  assert.ok(!COFFEES.some((c) => c.roast === "claro" && c.methods.includes("espresso")));
  const r = search(COFFEES, "", { roast: "claro", method: "espresso" });
  assert.equal(r.status, "none-pass");
});

test("filtro tipeado + chip espresso: filtro sigue siendo suave", () => {
  const r = search(COFFEES, "filtro", { method: "espresso" });
  assert.ok(r.results.every((x) => x.coffee.methods.includes("espresso")));
  assert.ok(r.results.some((x) => x.matches.some((m) => m.key.type === "method" && m.key.values.includes("filtro"))));
});

test("excludeDecaf excluye el decaf", () => {
  const r = search(COFFEES, "no decaf");
  assert.equal(r.status, "matched");
  assert.ok(r.results.every((x) => !x.coffee.decaf));
});
