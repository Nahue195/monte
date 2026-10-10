import { test } from "node:test";
import assert from "node:assert/strict";
import type { Coffee } from "../catalog.ts";
import { emptyQuery } from "./interpret.ts";
import { levelScore, rank } from "./rank.ts";
import type { Query } from "./types.ts";

function make(partial: Partial<Coffee> & Pick<Coffee, "slug" | "name">): Coffee {
  return {
    country: { es: "Colombia", en: "Colombia" },
    region: "",
    farm: "",
    process: { es: "Lavado", en: "Washed" },
    varieties: [],
    roast: "medio",
    notes: { es: [], en: [] },
    noteTags: [],
    acidity: 3,
    body: 3,
    sweetness: 3,
    methods: [],
    decaf: false,
    prices: { "250": 10000, "1000": 30000 },
    color: "#000000",
    story: { es: "x", en: "x" },
    ...partial,
  };
}

const catalog: Coffee[] = [
  make({ slug: "alfa", name: "Alfa", noteTags: ["frutal"], methods: ["filtro"], acidity: 3, roast: "claro", prices: { "250": 14000, "1000": 40000 } }),
  make({ slug: "beta", name: "Beta", noteTags: ["chocolate"], methods: ["espresso"], acidity: 1, roast: "oscuro", country: { es: "Brasil", en: "Brazil" }, prices: { "250": 11000, "1000": 35000 } }),
  make({ slug: "gama", name: "Gama", noteTags: ["citrico", "floral"], methods: ["filtro"], acidity: 5, roast: "claro", country: { es: "Etiopía", en: "Ethiopia" }, prices: { "250": 18000, "1000": 50000 } }),
  make({ slug: "delta", name: "Delta", noteTags: ["chocolate", "caramelo"], methods: ["espresso", "filtro"], acidity: 2, decaf: true, prices: { "250": 13000, "1000": 38000 } }),
];

const q = (partial: Partial<Query>): Query => ({ ...emptyQuery(), ...partial });
const slugs = (r: ReturnType<typeof rank>) => r.results.map((x) => x.coffee.slug);

test("levelScore: dentro, a uno y lejos", () => {
  assert.equal(levelScore(3, { max: 3 }), 1);
  assert.equal(levelScore(4, { max: 3 }), 0.5);
  assert.equal(levelScore(5, { max: 3 }), 0);
  assert.equal(levelScore(2, { min: 4 }), 0);
  assert.equal(levelScore(4, { min: 3, max: 4 }), 1);
});

test("sin texto ni criterios muestra todo por nombre", () => {
  const r = rank(catalog, q({}), false);
  assert.equal(r.status, "all");
  assert.deepEqual(slugs(r), ["alfa", "beta", "delta", "gama"]);
  assert.deepEqual(r.results[0].matches, []);
});

test("texto sin nada reconocido avisa", () => {
  assert.equal(rank(catalog, q({}), true).status, "not-understood");
});

test("frutal + filtro + acidez ≤ 3 ordena por coincidencia", () => {
  const r = rank(catalog, q({ notes: ["frutal"], methods: ["filtro"], levels: { acidity: { max: 3 } } }), true);
  assert.equal(r.status, "matched");
  assert.deepEqual(slugs(r), ["alfa", "gama", "delta", "beta"]);
  assert.equal(r.results[0].score, 1);
  assert.equal(r.results[1].score, 0.75);
  const gamaAcidity = r.results[1].matches.find((m) => m.key.type === "level");
  assert.equal(gamaAcidity?.ok, false);
});

test("frutal incluye cítricos y frutos rojos", () => {
  const r = rank(catalog, q({ notes: ["frutal"] }), true);
  assert.deepEqual(slugs(r).slice(0, 2), ["alfa", "gama"]);
});

test("las notas excluidas sacan cafés de la lista", () => {
  const r = rank(catalog, q({ excludeNotes: ["chocolate"] }), true);
  assert.deepEqual(slugs(r), ["alfa", "gama"]);
  assert.ok(r.results.every((x) => x.score === 1 && x.matches.every((m) => m.ok)));
});

test("precio máximo y descafeinado son filtros duros", () => {
  assert.deepEqual(slugs(rank(catalog, q({ maxPrice: 12000 }), true)), ["beta"]);
  assert.deepEqual(slugs(rank(catalog, q({ decaf: true }), true)), ["delta"]);
});

test("si nada pasa los filtros duros, muestra los 3 más cercanos marcando lo que falla", () => {
  const r = rank(catalog, q({ maxPrice: 5000, notes: ["chocolate"] }), true);
  assert.equal(r.status, "none-pass");
  assert.equal(r.results.length, 3);
  assert.deepEqual(slugs(r).slice(0, 2), ["beta", "delta"]);
  for (const result of r.results) {
    assert.equal(result.matches.find((m) => m.key.type === "price")?.ok, false);
  }
});

test("completa hasta 3 con cafés cercanos", () => {
  const r = rank(catalog, q({ origins: ["colombia"] }), true);
  assert.deepEqual(slugs(r), ["alfa", "delta", "beta"]);
  assert.deepEqual(r.results.map((x) => x.close), [false, false, true]);
});

test("un criterio que nadie cumple igual devuelve 3 cercanos", () => {
  const r = rank(catalog, q({ methods: ["moka"] }), true);
  assert.equal(r.status, "matched");
  assert.equal(r.results.length, 3);
  assert.ok(r.results.every((x) => x.close));
});
