import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/CheckoutForm";
import { getDictionary } from "@/dictionaries";
import { isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/checkout">): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? { title: getDictionary(lang).checkout.title, robots: { index: false } } : {};
}

export default async function Checkout({ params }: PageProps<"/[lang]/checkout">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { checkout, labels, cart } = getDictionary(lang);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-display text-4xl uppercase sm:text-5xl">{checkout.title}</h1>
      <CheckoutForm lang={lang} dict={{ checkout, labels, cart }} />
    </div>
  );
}
