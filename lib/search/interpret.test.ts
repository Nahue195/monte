import { test } from "node:test";
import assert from "node:assert/strict";
import { emptyQuery, hasCriteria, interpret } from "./interpret.ts";
import type { Query } from "./types.ts";

// `recognized` is checked in its own test; the table compares everything else.
const expected = (partial: Partial<Query>): Query => ({ ...emptyQuery(), ...partial });
const strip = (q: Query): Query => ({ ...q, recognized: 0 });

const cases: [string, Partial<Query>][] = [
  ["", {}],
  ["algo frutal para filtro, no muy ácido", { notes: ["frutal"], methods: ["filtro"], levels: { acidity: { max: 3 } } }],
  ["chocolatoso para espresso", { notes: ["chocolate"], methods: ["espresso"] }],
  ["something fruity for pour over, not too acidic", { notes: ["frutal"], methods: ["filtro"], levels: { acidity: { max: 3 } } }],
  ["bien dulce", { levels: { sweetness: { min: 4 } } }],
  ["dulce", { levels: { sweetness: { min: 3 } } }],
  ["nada ácido", { levels: { acidity: { max: 2 } } }],
  ["poco ácido y con cuerpo", { levels: { acidity: { max: 2 }, body: { min: 3 } } }],
  ["muy poco ácido", { levels: { acidity: { max: 2 } } }],
  ["sin chocolate", { excludeNotes: ["chocolate"] }],
  ["descafeinado", { decaf: true }],
  ["sin cafeína", { decaf: true }],
  ["menos de 15 mil", { maxPrice: 15000 }],
  ["hasta $20.000", { maxPrice: 20000 }],
  ["barato", { maxPrice: 13000 }],
  ["barato, menos de 12000", { maxPrice: 12000 }],
  ["frutla para filtor", { notes: ["frutal"], methods: ["filtro"] }],
  ["etiopía floral", { origins: ["etiopia"], notes: ["floral"] }],
  ["algo africano", { origins: ["etiopia", "kenia"] }],
  ["suave", { levels: { body: { max: 2 } } }],
  ["tueste claro", { roasts: ["claro"] }],
  ["claro y oscuro", { roasts: ["claro", "oscuro"] }],
  ["no muy ácido ni amargo", { levels: { acidity: { max: 3 } }, roasts: ["claro", "medio"] }],
  ["dulce de leche", { notes: ["caramelo"] }],
  ["cold brew chocolatoso", { methods: ["cold-brew"], notes: ["chocolate"] }],
  ["very sweet and nutty", { levels: { sweetness: { min: 4 } }, notes: ["nueces"] }],
  ["moka", { methods: ["moka"] }],
  ["frutal y chocolate", { notes: ["frutal", "chocolate"] }],
  ["algo caro", {}],
  ["quiero café rico", {}],
  ["xyz", {}],
  // S1 low modifiers
  ["baja acidez", { levels: { acidity: { max: 2 } } }],
  ["acidez baja", { levels: { acidity: { max: 2 } } }],
  ["low acid", { levels: { acidity: { max: 2 } } }],
  ["low acidity", { levels: { acidity: { max: 2 } } }],
  ["less acidic", { levels: { acidity: { max: 2 } } }],
  ["nothing too acidic", { levels: { acidity: { max: 3 } } }],
  ["no demasiado ácido", { levels: { acidity: { max: 3 } } }],
  ["cuerpo bajo", { levels: { body: { max: 2 } } }],
  ["low body", { levels: { body: { max: 2 } } }],
  ["dulzor bajo", { levels: { sweetness: { max: 2 } } }],
  // S2 negation cues
  ["no me gusta el chocolate", { excludeNotes: ["chocolate"] }],
  ["no me gustan los cítricos", { excludeNotes: ["citrico"] }],
  ["no quiero nada ácido", { levels: { acidity: { max: 2 } } }],
  ["odio lo amargo", { roasts: ["claro", "medio"] }],
  ["I don't like chocolate", { excludeNotes: ["chocolate"] }],
  ["don't want anything acidic", { levels: { acidity: { max: 2 } } }],
  ["no me gusta el chocolate, quiero algo frutal", { excludeNotes: ["chocolate"], notes: ["frutal"] }],
  // S3 negated decaf
  ["que no sea descafeinado", { excludeDecaf: true }],
  ["not decaf", { excludeDecaf: true }],
  ["no decaf", { excludeDecaf: true }],
  ["sin descafeinar", { excludeDecaf: true }],
  // S5 ignored quantities
  ["medio kilo", {}],
  ["1/2 kilo de chocolatoso", { notes: ["chocolate"] }],
  ["half kilo", {}],
];

for (const [text, partial] of cases) {
  test(`interpret: "${text}"`, () => {
    assert.deepEqual(strip(interpret(text)), expected(partial));
  });
}

test("recognized cuenta las coincidencias", () => {
  assert.equal(interpret("frutal para filtro").recognized, 2);
  assert.equal(interpret("quiero café rico").recognized, 0);
});

test("textos larguísimos no rompen", () => {
  assert.equal(interpret("a ".repeat(500)).recognized, 0);
});

test("hasCriteria distingue consultas vacías", () => {
  assert.equal(hasCriteria(interpret("quiero café rico")), false);
  assert.equal(hasCriteria(interpret("barato")), true);
  assert.equal(hasCriteria(interpret("sin chocolate")), true);
});

test("las cantidades ignoradas no cuentan como reconocidas", () => {
  assert.equal(interpret("medio kilo").recognized, 0);
  assert.equal(interpret("medio kilo chocolatoso").recognized, 1);
});
