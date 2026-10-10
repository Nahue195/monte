import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <h1 className="px-4 py-20 font-display text-6xl uppercase">Monte</h1>;
}
