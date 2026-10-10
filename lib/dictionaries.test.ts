import { test } from "node:test";
import assert from "node:assert/strict";
import { COFFEES } from "../data/coffees.ts";
import { en } from "../dictionaries/en.ts";
import { es } from "../dictionaries/es.ts";
import { GRINDS } from "./cart.ts";
import { ATTRS, countryKey, METHODS, NOTE_TAGS, ROASTS, SIZES } from "./catalog.ts";
import { FIELD_ORDER } from "./checkout.ts";
import { LEXICON } from "./search/lexicon.ts";

function keys(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k)).sort();
}

const valueAt = (dict: object, path: string) =>
  path.split(".").reduce<unknown>((o, p) => (o as Record<string, unknown>)[p], dict);

test("es y en tienen exactamente las mismas claves", () => {
  assert.deepEqual(keys(en), keys(es));
});

test("ningún texto está vacío", () => {
  for (const dict of [es, en]) {
    const empty = keys(dict).filter((k) => valueAt(dict, k) === "");
    assert.deepEqual(empty, []);
  }
});

test("hay etiqueta para cada valor del catálogo", () => {
  for (const dict of [es, en]) {
    for (const tag of NOTE_TAGS) assert.ok(dict.labels.notes[tag], tag);
    for (const method of METHODS) assert.ok(dict.labels.methods[method], method);
    for (const roast of ROASTS) assert.ok(dict.labels.roasts[roast], roast);
    for (const grind of GRINDS) assert.ok(dict.labels.grinds[grind], grind);
    for (const size of SIZES) assert.ok(dict.labels.sizes[size], size);
    for (const attr of ATTRS) {
      assert.ok(dict.labels.attrs[attr], attr);
      for (const word of ["low", "mid", "high"] as const) assert.ok(dict.labels.levels[attr][word], `${attr}.${word}`);
    }
  }
});

test("hay nombre para cada origen que entiende el buscador", () => {
  const origins = new Set([
    ...COFFEES.map(countryKey),
    ...LEXICON.flatMap((e) => (e.term.kind === "origin" ? e.term.value : [])),
  ]);
  for (const dict of [es, en]) {
    for (const origin of origins) assert.ok((dict.labels.origins as Record<string, string>)[origin], origin);
  }
});

test("hay mensaje de error para cada campo del checkout", () => {
  for (const dict of [es, en]) {
    for (const field of FIELD_ORDER) {
      assert.ok(dict.checkout.errors[field], field);
      assert.ok(dict.checkout.fields[field], field);
    }
  }
});
