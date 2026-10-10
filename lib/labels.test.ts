import { test } from "node:test";
import assert from "node:assert/strict";
import { COFFEES } from "../data/coffees.ts";
import { en } from "../dictionaries/en.ts";
import { es } from "../dictionaries/es.ts";
import { findCoffee } from "./catalog.ts";
import { matchLabel } from "./labels.ts";

const huila = findCoffee(COFFEES, "huila")!;
const plain = (s: string) => s.replace(/\s/g, " ");

test("notas, métodos, tuestes y orígenes", () => {
  assert.equal(matchLabel({ key: { type: "notes", values: ["frutal", "chocolate"] }, ok: true }, huila, es.labels, "es"), "frutal / chocolate");
  assert.equal(matchLabel({ key: { type: "method", values: ["filtro"] }, ok: true }, huila, en.labels, "en"), "pour over");
  assert.equal(matchLabel({ key: { type: "roast", values: ["claro", "medio"] }, ok: true }, huila, es.labels, "es"), "tueste claro / tueste medio");
  assert.equal(matchLabel({ key: { type: "origin", values: ["etiopia", "kenia"] }, ok: false }, huila, es.labels, "es"), "Etiopía / Kenia");
});

test("los atributos describen el valor del café", () => {
  const acidity = { key: { type: "level", attr: "acidity", range: { max: 3 } }, ok: true } as const;
  assert.equal(matchLabel(acidity, huila, es.labels, "es"), "acidez media");
  assert.equal(matchLabel(acidity, huila, en.labels, "en"), "acidity medium");
  const body = { key: { type: "level", attr: "body", range: { max: 2 } }, ok: false } as const;
  assert.equal(matchLabel(body, findCoffee(COFFEES, "mogiana")!, es.labels, "es"), "cuerpo intenso");
});

test("filtros duros", () => {
  assert.equal(matchLabel({ key: { type: "exclude", value: "chocolate" }, ok: true }, huila, es.labels, "es"), "sin chocolate");
  assert.equal(plain(matchLabel({ key: { type: "price", max: 15000 }, ok: true }, huila, es.labels, "es")), "hasta $ 15.000");
  assert.equal(matchLabel({ key: { type: "decaf" }, ok: false }, huila, en.labels, "en"), "decaf");
  assert.equal(matchLabel({ key: { type: "no-decaf" }, ok: true }, huila, es.labels, "es"), "con cafeína");
  assert.equal(matchLabel({ key: { type: "no-decaf" }, ok: true }, huila, en.labels, "en"), "caffeinated");
});
