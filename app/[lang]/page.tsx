import Link from "next/link";
import { notFound } from "next/navigation";
import { CoffeeBag } from "@/components/CoffeeBag";
import { CoffeeCard } from "@/components/CoffeeCard";
import { ExampleChips } from "@/components/ExampleChips";
import { SearchBox } from "@/components/SearchBox";
import { COFFEES } from "@/data/coffees";
import { getDictionary } from "@/dictionaries";
import { findCoffee } from "@/lib/catalog";
import { isLocale } from "@/lib/i18n";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const hero = findCoffee(COFFEES, "huila")!;
  const featured = COFFEES.filter((c) => c.featured);

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.3fr_1fr] md:py-20">
        <div className="motion-safe:animate-rise">
          <h1 className="font-display text-[clamp(3rem,11vw,7rem)] uppercase leading-[0.9]">
            {dict.home.heroA}
            <br />
            {dict.home.heroB}
            <br />
            <span className="text-hot">{dict.home.heroC}</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted">{dict.home.lead}</p>
          <div className="mt-8 max-w-xl">
            <SearchBox lang={lang} dict={dict.search} />
          </div>
          <ExampleChips lang={lang} label={dict.search.examplesLabel} examples={dict.search.examples} />
        </div>
        <CoffeeBag coffee={hero} lang={lang} size="lg" className="motion-safe:animate-rise motion-safe:[animation-delay:120ms]" />
      </section>

      <section id="origen" className="scroll-mt-16 bg-cream text-bg">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-2">
          <h2 className="font-display text-3xl uppercase leading-tight sm:text-5xl">{dict.home.storyTitle}</h2>
          <div>
            <p className="text-lg text-cocoa">{dict.home.storyBody}</p>
            <ul className="mt-6 grid gap-2">
              {dict.home.storyPoints.map((point) => (
                <li key={point} className="flex items-center gap-3 font-semibold">
                  <span aria-hidden className="h-2 w-2 rounded-full bg-bg" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl uppercase">{dict.home.featuredTitle}</h2>
          <Link href={`/${lang}/shop`} className="text-sm font-semibold text-hot underline-offset-4 hover:underline">
            {dict.home.seeAll} →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((coffee) => (
            <CoffeeCard key={coffee.slug} coffee={coffee} lang={lang} sizeLabel={dict.labels.sizes["250"]} />
          ))}
        </div>
      </section>
    </>
  );
}
