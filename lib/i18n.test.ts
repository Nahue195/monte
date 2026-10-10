import { test } from "node:test";
import assert from "node:assert/strict";
import { localizedUrl, pickLocale, switchLocalePath } from "./i18n.ts";

test("pickLocale respeta la preferencia y cae en español", () => {
  assert.equal(pickLocale("en-US,en;q=0.9"), "en");
  assert.equal(pickLocale("fr-FR,en;q=0.5,es;q=0.8"), "es");
  assert.equal(pickLocale("de"), "es");
  assert.equal(pickLocale(null), "es");
});

test("localizedUrl conserva el query string", () => {
  assert.equal(localizedUrl("https://monte.dev/?utm_source=x", "en").toString(), "https://monte.dev/en?utm_source=x");
});

test("switchLocalePath cambia solo el primer segmento", () => {
  assert.equal(switchLocalePath("/es/shop", "en"), "/en/shop");
  assert.equal(switchLocalePath("/en/coffee/huila", "es"), "/es/coffee/huila");
  assert.equal(switchLocalePath("/es", "en"), "/en");
  assert.equal(switchLocalePath("/", "en"), "/en");
});
