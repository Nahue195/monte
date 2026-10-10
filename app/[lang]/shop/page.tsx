import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CoffeeCard } from "@/components/CoffeeCard";
import { ShopView } from "@/components/ShopView";
import { COFFEES } from "@/data/coffees";
import { getDictionary } from "@/dictionaries";
import { isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/shop">): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? { title: getDictionary(lang).shop.title } : {};
}

export default async function Shop({ params }: PageProps<"/[lang]/shop">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { search, shop, labels, product, cart } = getDictionary(lang);

  // Without JS (or before hydration) the full catalog is still there.
  const fallback = (
    <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {COFFEES.map((coffee) => (
        <li key={coffee.slug}>
          <CoffeeCard coffee={coffee} lang={lang} sizeLabel={labels.sizes["250"]} />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 font-display text-4xl uppercase sm:text-5xl">{shop.title}</h1>
      <Suspense fallback={fallback}>
        <ShopView lang={lang} dict={{ search, shop, labels, product, cart }} />
      </Suspense>
    </div>
  );
}
