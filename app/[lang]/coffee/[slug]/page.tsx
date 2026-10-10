import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/AddToCart";
import { CoffeeBag } from "@/components/CoffeeBag";
import { COFFEES } from "@/data/coffees";
import { getDictionary } from "@/dictionaries";
import { ATTRS, findCoffee } from "@/lib/catalog";
import { fill } from "@/lib/format";
import { isLocale } from "@/lib/i18n";

export const dynamicParams = false;

export function generateStaticParams() {
  return COFFEES.map((coffee) => ({ slug: coffee.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/coffee/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const coffee = findCoffee(COFFEES, slug);
  if (!isLocale(lang) || !coffee) return {};
  return { title: coffee.name, description: coffee.story[lang] };
}

export default async function CoffeePage({ params }: PageProps<"/[lang]/coffee/[slug]">) {
  const { lang, slug } = await params;
  const coffee = findCoffee(COFFEES, slug);
  if (!isLocale(lang) || !coffee) notFound();
  const { product, labels, cart } = getDictionary(lang);

  const facts: [string, string][] = [
    [product.origin, `${coffee.country[lang]} · ${coffee.region}`],
    [product.farm, coffee.farm],
    [product.process, coffee.process[lang]],
    [product.varieties, coffee.varieties.join(", ")],
    [product.roast, labels.roasts[coffee.roast]],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href={`/${lang}/shop`} className="text-sm text-muted transition-colors hover:text-hot">
        ← {product.back}
      </Link>
      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <CoffeeBag coffee={coffee} lang={lang} size="lg" className="md:sticky md:top-24 md:self-start" />
        <div>
          <h1 className="font-display text-5xl uppercase sm:text-6xl">{coffee.name}</h1>
          <p className="mt-2 text-muted">{coffee.notes[lang].join(" · ")}</p>
          {coffee.decaf && (
            <span className="mt-3 inline-block rounded-full border border-hot px-3 py-1 text-xs uppercase tracking-wider text-hot">
              {product.decaf}
            </span>
          )}
          <p className="mt-6 text-lg">{coffee.story[lang]}</p>

          <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            {facts.map(([term, value]) => (
              <div key={term} className="contents">
                <dt className="text-muted">{term}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mt-8 text-xs uppercase tracking-widest text-muted">{product.profile}</h2>
          <ul className="mt-3 grid gap-3">
            {ATTRS.map((attr) => (
              <li key={attr} className="grid grid-cols-[6rem_1fr] items-center gap-3 text-sm">
                <span className="capitalize">{labels.attrs[attr]}</span>
                <span role="img" aria-label={`${labels.attrs[attr]}: ${fill(product.outOf, { n: coffee[attr] })}`} className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <span key={step} className={`h-2 flex-1 rounded-full ${step <= coffee[attr] ? "bg-hot" : "bg-line"}`} />
                  ))}
                </span>
              </li>
            ))}
          </ul>

          <h2 className="mt-8 text-xs uppercase tracking-widest text-muted">{product.methods}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {coffee.methods.map((method) => (
              <li key={method} className="rounded-full border border-line px-3 py-1 text-sm">
                {labels.methods[method]}
              </li>
            ))}
          </ul>

          <AddToCart coffee={coffee} lang={lang} dict={{ product, labels, cart }} />
        </div>
      </div>
    </div>
  );
}
