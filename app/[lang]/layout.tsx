import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Archivo, Archivo_Black } from "next/font/google";
import "../globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getDictionary } from "@/dictionaries";
import { isLocale, locales } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

const display = Archivo_Black({ weight: "400", subsets: ["latin"], variable: "--font-archivo-black", display: "swap" });
const sans = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { meta } = getDictionary(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: meta.title, template: "%s · Monte" },
    description: meta.description,
    openGraph: {
      type: "website",
      siteName: "Monte",
      title: meta.title,
      description: meta.description,
      locale: lang === "es" ? "es_AR" : "en_US",
    },
  };
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <html lang={lang} className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <CartProvider>
          <a href="#main" className="skip-link">
            {dict.nav.skip}
          </a>
          <Header lang={lang} nav={dict.nav} locale={dict.locale} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer lang={lang} footer={dict.footer} />
        </CartProvider>
      </body>
    </html>
  );
}
