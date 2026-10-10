# Monte

A specialty coffee shop that doesn't exist: brand, store and a search box that understands what you mean. A concept project by Nahuel Martinez.

## The idea

Most coffee shops make you pick by origin names you don't know. Monte lets you say what you like ("something fruity for pour over, not too acidic") and explains why each coffee fits.

## What it does

- **Natural-language search** in Spanish and English, with no AI: a hand-built interpreter.
- **Catalog of 12 coffees** with flavor profile, origin, process and brew methods.
- **Cart** that survives reloads and syncs across tabs, with free-shipping progress.
- **Simulated checkout** with inline validation (Luhn, Argentine postal codes) and an order confirmation. Nothing is charged and no data leaves the browser.

## How the search works

1. **Normalize**: lowercase, strip accents, unify prices ("15 mil", "$15.000", "15k" → 15000).
2. **Recognize**: match a bilingual lexicon, longest phrase first, tolerating typos (edit distance with transpositions, so "frutla" → "frutal").
3. **Modify**: read up to two words before each match for negation and intensity ("no muy ácido" → acidity ≤ 3, "sin chocolate" → exclude).
4. **Rank**: weighted score with hard filters (price, decaf, exclusions), partial credit for near misses, and a ✓ / ✗ explanation per result.

Every step is a pure function with table-driven tests.

## Decisions

- **No backend.** Everything is static and deploys for free; the cart and the last order live in `localStorage` behind a small external store with an in-memory fallback.
- **No AI.** The search is predictable, instant and explainable, and costs nothing per query.
- **No photos.** Coffee bags are drawn in CSS, so the brand stays consistent and light.
- **Accessible by default.** AA contrast is checked by a test, the cart is a native `<dialog>`, and result counts are announced to screen readers.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Node's built-in test runner.

## Run it locally

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # unit tests
npm run lint
npm run build
```

Optional: set `NEXT_PUBLIC_PORTFOLIO_URL` to point the footer link to the portfolio.
