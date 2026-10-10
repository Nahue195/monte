import type { Dictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import { portfolioUrl } from "@/lib/site";

type Props = { lang: Locale; footer: Dictionary["footer"] };

export function Footer({ lang, footer }: Props) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>{footer.concept}</p>
        <a href={portfolioUrl(lang)} className="font-semibold text-ink underline-offset-4 transition-colors hover:text-hot hover:underline">
          {footer.portfolio} →
        </a>
      </div>
    </footer>
  );
}
