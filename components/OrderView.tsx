"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";
import type { Dictionary } from "@/dictionaries";
import { fill, formatDate, formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { schedule } from "@/lib/order";
import { orderStore } from "./orderStore";
import { useHydrated } from "./useHydrated";

type Props = { lang: Locale; dict: Pick<Dictionary, "order" | "labels" | "cart"> };

export function OrderView({ lang, dict }: Props) {
  const hydrated = useHydrated();
  const order = useSyncExternalStore(orderStore.subscribe, orderStore.get, orderStore.serverSnapshot);
  const heading = useRef<HTMLHeadingElement>(null);
  const { order: copy, labels, cart } = dict;

  // Move focus to the confirmation so screen readers announce it after the redirect.
  useEffect(() => {
    if (order) heading.current?.focus();
  }, [order]);

  if (!hydrated) return <div className="min-h-[50vh]" aria-busy="true" />;

  if (!order) {
    return (
      <div className="flex flex-col items-start gap-4">
        <h1 className="font-display text-4xl uppercase">{copy.noneTitle}</h1>
        <p className="text-muted">{copy.noneBody}</p>
        <Link href={`/${lang}/shop`} className="btn btn-hot">
          {cart.goShop}
        </Link>
      </div>
    );
  }

  const when = schedule(order.date, order.delivery);
  const date = (iso: string) => formatDate(iso, lang);
  const price = (n: number) => formatPrice(n, lang);
  const scheduleText =
    order.delivery === "envio"
      ? fill(copy.shipSchedule, { roast: date(when.roast), from: date(when.from), to: date(when.to) })
      : fill(copy.pickupSchedule, { roast: date(when.roast), from: date(when.from) });

  return (
    <div className="grid gap-8">
      <div>
        <p className="text-sm uppercase tracking-widest text-hot">{fill(copy.number, { id: order.id })}</p>
        <h1 ref={heading} tabIndex={-1} className="mt-2 font-display text-4xl uppercase outline-none sm:text-6xl">
          {copy.title}
        </h1>
        <p className="mt-4 max-w-xl text-lg">{scheduleText}</p>
        <p className="mt-2 text-muted">{copy.thanks}</p>
      </div>

      <section className="max-w-xl rounded-2xl bg-panel p-5">
        <h2 className="font-display text-xl uppercase">{copy.items}</h2>
        <ul className="mt-4 grid gap-3 text-sm">
          {order.lines.map((line) => (
            <li key={`${line.slug}|${line.grind}|${line.size}`} className="flex justify-between gap-3">
              <span>
                {line.name} × {line.qty}
                <span className="block text-xs text-muted">
                  {labels.grinds[line.grind]} · {labels.sizes[line.size]}
                </span>
              </span>
              <span>{price(line.total)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 grid grid-cols-2 gap-y-1 border-t border-line pt-4 text-sm">
          <dt className="text-muted">{cart.subtotal}</dt>
          <dd className="text-right">{price(order.subtotal)}</dd>
          <dt className="text-muted">{cart.shipping}</dt>
          <dd className="text-right">{order.shipping === 0 ? cart.free : price(order.shipping)}</dd>
          <dt className="font-semibold">{cart.total}</dt>
          <dd className="text-right font-display text-lg text-hot">{price(order.total)}</dd>
        </dl>
      </section>

      <Link href={`/${lang}/shop`} className="btn btn-ghost self-start">
        {copy.back}
      </Link>
    </div>
  );
}
