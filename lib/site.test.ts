import { test } from "node:test";
import assert from "node:assert/strict";
import { portfolioUrl } from "./site.ts";

test("portfolioUrl apunta a # sin variable", () => {
  assert.equal(portfolioUrl("es", {}), "#");
});

test("portfolioUrl agrega el idioma y limpia la barra final", () => {
  assert.equal(portfolioUrl("en", { NEXT_PUBLIC_PORTFOLIO_URL: "https://nahuel.dev/" }), "https://nahuel.dev/en");
});
