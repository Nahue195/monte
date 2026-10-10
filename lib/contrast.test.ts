import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { contrastRatio, parseTokens } from "./contrast.ts";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const tokens = parseTokens(css, ":root");

// Text color on the background it is used on (WCAG AA, normal text: 4.5:1).
const pairs: [string, string][] = [
  ["--ink", "--bg"],
  ["--ink", "--panel"],
  ["--muted", "--bg"],
  ["--muted", "--panel"],
  ["--hot", "--bg"],
  ["--hot", "--panel"],
  ["--bg", "--hot"],
  ["--ok", "--panel"],
  ["--bad", "--panel"],
  ["--bg", "--cream"],
  ["--cocoa", "--cream"],
  ["--bg", "--ink"],
];

test("contrastRatio calcula como WCAG", () => {
  assert.equal(contrastRatio("#000000", "#ffffff"), 21);
  assert.equal(contrastRatio("#ffffff", "#ffffff"), 1);
});

test("todos los pares de texto pasan AA", () => {
  for (const [fg, bg] of pairs) {
    assert.ok(tokens[fg] && tokens[bg], `faltan ${fg} o ${bg}`);
    const ratio = contrastRatio(tokens[fg], tokens[bg]);
    assert.ok(ratio >= 4.5, `${fg} sobre ${bg}: ${ratio.toFixed(2)}`);
  }
});
