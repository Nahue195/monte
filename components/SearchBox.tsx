import Form from "next/form";
import { Search } from "lucide-react";
import type { Dictionary } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import { MAX_QUERY_LENGTH } from "@/lib/search/normalize";

type Props = { lang: Locale; dict: Dictionary["search"] };

export function SearchBox({ lang, dict }: Props) {
  return (
    <Form action={`/${lang}/shop`} role="search" className="flex items-center gap-2 rounded-full border border-field-line bg-panel focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-hot py-1.5 pl-4 pr-1.5">
      <Search size={18} aria-hidden className="shrink-0 text-muted" />
      <label htmlFor="home-q" className="sr-only">
        {dict.label}
      </label>
      <input
        id="home-q"
        name="q"
        type="search"
        maxLength={MAX_QUERY_LENGTH}
        placeholder={dict.placeholder}
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent py-2 text-base text-ink outline-none placeholder:text-muted"
      />
      <button type="submit" className="btn btn-hot h-10 shrink-0">
        {dict.submit}
      </button>
    </Form>
  );
}
