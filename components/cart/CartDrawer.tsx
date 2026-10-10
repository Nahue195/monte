"use client";

import Link from "next/link";
import { Trash2, X } from "lucide-react";
import { COFFEES } from "@/data/coffees";
import type { Dictionary } from "@/dictionaries";
import { FREE_SHIPPING_FROM, lineKey, MAX_QTY, priceCart } from "@/lib/cart";
import { fill, formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { Dialog } from "../Dialog";
import { QtyStepper } from "../QtyStepper";
import { useCartUi } from "./CartProvider";
import { cartActions, useCartLines } from "./store";

type Props = { lang: Locale; dict: Pick<Dictionary, "cart" | "labels"> };

export function CartDrawer({ lang, dict }: Props) {
  const { isOpen, closeCart, message } = useCartUi();
  const priced = priceCart(useCartLines(), COFFEES);
  const { cart, labels } = dict;
  const price = (n: number) => formatPrice(n, lang);
  const progress = Math.min(100, Math.round((priced.subtotal / FREE_SHIPPING_FROM) * 100));

  return (
    <Dialog open={isOpen} onClose={closeCart} labelledBy="cart-title">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="cart-title" className="font-display text-xl uppercase">
            {cart.title}
          </h2>
          {/* The provider's own live region sits outside the modal dialog, which is inert while open. */}
          <p role="status" aria-live="polite" className="sr-only">
            {isOpen ? message : ""}
          </p>
          <button
            type="button"
            onClick={closeCart}
            aria-label={cart.close}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-panel"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        {priced.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-start gap-4 px-5 py-8">
            <p className="text-muted">{cart.empty}</p>
            <Link href={`/${lang}/shop`} onClick={closeCart} className="btn btn-hot">
              {cart.goShop}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {priced.lines.map((line) => {
                const key = lineKey(line);
                return (
                  <li key={key} className="flex gap-4 py-4" data-testid="cart-line">
                    <div aria-hidden className="bag h-16 w-12 shrink-0 rounded-b-lg rounded-t-sm" style={{ backgroundColor: line.coffee.color }} />
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{line.coffee.name}</p>
                          <p className="text-xs text-muted">
                            {labels.grinds[line.grind]} · {labels.sizes[line.size]}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">{price(line.total)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <QtyStepper
                          value={line.qty}
                          min={1}
                          max={MAX_QTY}
                          onChange={(qty) => cartActions.setQty(key, qty)}
                          label={fill(cart.qty, { name: line.coffee.name })}
                          increaseLabel={cart.increase}
                          decreaseLabel={cart.decrease}
                        />
                        <button
                          type="button"
                          onClick={() => cartActions.remove(key)}
                          aria-label={fill(cart.remove, { name: line.coffee.name })}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted hover:text-bad"
                        >
                          <Trash2 size={16} aria-hidden />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="grid gap-3 border-t border-line px-5 py-5 text-sm">
              <div>
                <p className={priced.freeShippingGap > 0 ? "text-muted" : "text-ok"}>
                  {priced.freeShippingGap > 0 ? fill(cart.gap, { amount: price(priced.freeShippingGap) }) : `${cart.freeReached} ✓`}
                </p>
                <div aria-hidden className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                  <div className="h-full bg-hot transition-[width] duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-y-1">
                <dt className="text-muted">{cart.subtotal}</dt>
                <dd className="text-right">{price(priced.subtotal)}</dd>
                <dt className="text-muted">{cart.shipping}</dt>
                <dd className="text-right">{priced.shipping === 0 ? cart.free : price(priced.shipping)}</dd>
                <dt className="font-semibold">{cart.total}</dt>
                <dd className="text-right font-display text-lg text-hot" data-testid="cart-total">
                  {price(priced.total)}
                </dd>
              </dl>
              <Link href={`/${lang}/checkout`} onClick={closeCart} className="btn btn-hot w-full">
                {cart.checkout}
              </Link>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
