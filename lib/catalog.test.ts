import { test } from "node:test";
import assert from "node:assert/strict";
import { COFFEES } from "../data/coffees.ts";
import { ATTRS, countryKey, findCoffee, METHODS, NOTE_TAGS } from "./catalog.ts";
import { fold } from "./text.ts";

test("fold saca tildes y mayúsculas", () => {
  assert.equal(fold("Etiopía ÁCIDO Ñandú"), "etiopia acido nandu");
});

test("hay 12 cafés con slugs únicos y válidos", () => {
  assert.equal(COFFEES.length, 12);
  const slugs = COFFEES.map((c) => c.slug);
  assert.equal(new Set(slugs).size, 12);
  for (const slug of slugs) assert.match(slug, /^[a-z0-9-]+$/);
});

test("cada café tiene datos coherentes", () => {
  for (const c of COFFEES) {
    for (const attr of ATTRS) {
      assert.ok(Number.isInteger(c[attr]) && c[attr] >= 1 && c[attr] <= 5, `${c.slug}.${attr}`);
    }
    assert.ok(c.noteTags.length > 0 && c.noteTags.every((t) => NOTE_TAGS.includes(t)), `${c.slug} noteTags`);
    assert.ok(c.methods.length > 0 && c.methods.every((m) => METHODS.includes(m)), `${c.slug} methods`);
    assert.equal(c.notes.es.length, c.notes.en.length, `${c.slug} notes`);
    assert.ok(Number.isInteger(c.prices["250"]) && c.prices["250"] > 0, `${c.slug} precio 250`);
    assert.ok(c.prices["1000"] > c.prices["250"], `${c.slug} precio 1000`);
    assert.match(c.color, /^#[0-9a-f]{6}$/i);
    assert.ok(c.story.es && c.story.en, `${c.slug} story`);
  }
});

test("los destacados son huila, guji y mogiana", () => {
  assert.deepEqual(COFFEES.filter((c) => c.featured).map((c) => c.slug), ["huila", "guji", "mogiana"]);
});

test("solo huila-decaf es descafeinado", () => {
  assert.deepEqual(COFFEES.filter((c) => c.decaf).map((c) => c.slug), ["huila-decaf"]);
});

test("findCoffee y countryKey", () => {
  assert.equal(findCoffee(COFFEES, "sidama")?.name, "Sidama");
  assert.equal(findCoffee(COFFEES, "nope"), undefined);
  assert.equal(countryKey(findCoffee(COFFEES, "tarrazu")!), "costa rica");
  assert.equal(countryKey(findCoffee(COFFEES, "guji")!), "etiopia");
});
