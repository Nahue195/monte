"use client";

import type { Dictionary } from "@/dictionaries";
import { fill } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import type { Result } from "@/lib/search";
import { useCartUi } from "./cart/CartProvider";
import { cartActions } from "./cart/store";
import { CoffeeCard } from "./CoffeeCard";
import { MatchList } from "./MatchList";

type Props = { result: Result; lang: Locale; dict: Pick<Dictionary, "shop" | "labels" | "product" | "cart"> };

export function ResultCard({ result, lang, dict }: Props) {
  const { openCart, announce } = useCartUi();
  const { coffee, matches, close } = result;
  const size = dict.labels.sizes["250"];

  const add = () => {
    cartActions.add({ slug: coffee.slug, grind: "grano", size: "250", qty: 1 });
    announce(fill(dict.cart.added, { name: coffee.name, size }));
    openCart();
  };

  return (
    <CoffeeCard
      coffee={coffee}
      lang={lang}
      sizeLabel={size}
      badge={close ? dict.shop.close : undefined}
      action={
        <button type="button" onClick={add} aria-label={fill(dict.product.addNamed, { name: coffee.name })} className="btn btn-hot h-9 px-4 text-xs">
          {dict.product.add}
        </button>
      }
    >
      <MatchList
        matches={matches}
        coffee={coffee}
        lang={lang}
        labels={dict.labels}
        title={dict.shop.matches}
        okText={dict.shop.ok}
        missingText={dict.shop.missing}
      />
    </CoffeeCard>
  );
}
