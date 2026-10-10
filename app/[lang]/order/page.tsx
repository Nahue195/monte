import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderView } from "@/components/OrderView";
import { getDictionary } from "@/dictionaries";
import { isLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/order">): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? { title: getDictionary(lang).order.title, robots: { index: false } } : {};
}

export default async function OrderPage({ params }: PageProps<"/[lang]/order">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { order, labels, cart } = getDictionary(lang);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <OrderView lang={lang} dict={{ order, labels, cart }} />
    </div>
  );
}
