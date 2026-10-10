import { test } from "node:test";
import assert from "node:assert/strict";
import { normalize } from "./normalize.ts";
import { editDistance, recognize } from "./recognize.ts";

const terms = (text: string) => recognize(normalize(text)).map((h) => h.term);

test("editDistance cuenta transposiciones como 1", () => {
  assert.equal(editDistance("frutla", "frutal"), 1);
  assert.equal(editDistance("filtor", "filtro"), 1);
  assert.equal(editDistance("cafe", "cafe"), 0);
  assert.equal(editDistance("moka", "mate"), 3);
});

test("reconoce notas y métodos", () => {
  assert.deepEqual(terms("algo frutal para filtro"), [
    { kind: "note", value: "frutal" },
    { kind: "method", value: "filtro" },
  ]);
});

test("prefiere la frase más larga", () => {
  assert.deepEqual(terms("dulce de leche"), [{ kind: "note", value: "caramelo" }]);
  assert.deepEqual(terms("prensa francesa"), [{ kind: "method", value: "prensa" }]);
  assert.deepEqual(terms("sin cafeína"), [{ kind: "decaf" }]);
});

test("guarda la posición de cada coincidencia", () => {
  const hits = recognize(normalize("no muy ácido"));
  assert.deepEqual(hits, [{ term: { kind: "level", attr: "acidity", dir: "up" }, start: 2, end: 3 }]);
});

test("tolera errores de tipeo", () => {
  assert.deepEqual(terms("frutla"), [{ kind: "note", value: "frutal" }]);
  assert.deepEqual(terms("filtor"), [{ kind: "method", value: "filtro" }]);
  assert.deepEqual(terms("espreso"), [{ kind: "method", value: "espresso" }]);
});

test("no corrige palabras comunes ni cortas", () => {
  assert.deepEqual(terms("algo caro"), []);
  assert.deepEqual(terms("pero rico"), []);
  assert.deepEqual(terms("xyz"), []);
});

test("precio solo con número a continuación", () => {
  assert.deepEqual(terms("menos de 15 mil"), [{ kind: "price", max: 15000 }]);
  assert.deepEqual(terms("hasta"), []);
  assert.deepEqual(terms("barato"), [{ kind: "cheap" }]);
});

test("orígenes y regiones", () => {
  assert.deepEqual(terms("etiopía"), [{ kind: "origin", value: ["etiopia"] }]);
  assert.deepEqual(terms("algo africano"), [{ kind: "origin", value: ["etiopia", "kenia"] }]);
  assert.deepEqual(terms("costa rica"), [{ kind: "origin", value: ["costa rica"] }]);
});
