"use client";

import { useState } from "react";
import type { Dictionary } from "@/dictionaries";
import { GRINDS, MAX_QTY, type Grind } from "@/lib/cart";
import { SIZES, type Coffee, type Size } from "@/lib/catalog";
import { fill, formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { useCartUi } from "./cart/CartProvider";
import { cartActions } from "./cart/store";
import { QtyStepper } from "./QtyStepper";

type Props = { coffee: Coffee; lang: Locale; dict: Pick<Dictionary, "product" | "labels" | "cart"> };

export function AddToCart({ coffee, lang, dict }: Props) {
  const { openCart, announce } = useCartUi();
  const [grind, setGrind] = useState<Grind>("grano");
  const [size, setSize] = useState<Size>("250");
  const [qty, setQty] = useState(1);

  const add = () => {
    cartActions.add({ slug: coffee.slug, grind, size, qty });
    announce(fill(dict.cart.added, { name: coffee.name, size: dict.labels.sizes[size] }));
    openCart();
  };

  return (
    <div className="mt-8 grid gap-5 rounded-2xl bg-panel p-5">
      <div>
        <label htmlFor="grind" className="text-xs uppercase tracking-widest text-muted">
          {dict.product.grind}
        </label>
        <select id="grind" value={grind} onChange={(e) => setGrind(e.target.value as Grind)} className="field mt-2">
          {GRINDS.map((g) => (
            <option key={g} value={g}>
              {dict.labels.grinds[g]}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="text-xs uppercase tracking-widest text-muted">{dict.product.size}</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {SIZES.map((s) => (
            <label
              key={s}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-line px-4 py-3 has-[:checked]:border-hot has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-hot"
            >
              <span className="flex items-center gap-2">
                <input type="radio" name="size" value={s} checked={size === s} onChange={() => setSize(s)} className="sr-only" />
                <span className="font-semibold">{dict.labels.sizes[s]}</span>
              </span>
              <span className="text-sm text-muted">{formatPrice(coffee.prices[s], lang)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <QtyStepper
          value={qty}
          max={MAX_QTY}
          onChange={setQty}
          label={dict.product.qty}
          increaseLabel={dict.cart.increase}
          decreaseLabel={dict.cart.decrease}
        />
        <p className="font-display text-2xl text-hot">{formatPrice(coffee.prices[size] * qty, lang)}</p>
      </div>

      <button type="button" onClick={add} className="btn btn-hot w-full">
        {dict.product.addToCart}
      </button>
    </div>
  );
}
