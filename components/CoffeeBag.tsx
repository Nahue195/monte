import type { Coffee } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";

type Props = {
  coffee: Pick<Coffee, "name" | "color" | "country" | "process">;
  lang: Locale;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const HEIGHTS = { sm: "h-16", md: "h-40", lg: "h-72 sm:h-96" };

// Decorative bag: the coffee's color plus a label; the name is always in the text next to it.
export function CoffeeBag({ coffee, lang, size = "md", className = "" }: Props) {
  return (
    <div
      aria-hidden
      className={`bag flex items-end rounded-b-xl rounded-t-md p-3 ${HEIGHTS[size]} ${className}`}
      style={{ backgroundColor: coffee.color }}
    >
      {size !== "sm" && (
        <span className="rounded-sm bg-ink px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-bg">
          {coffee.name} · {coffee.country[lang]}
          {size === "lg" ? ` · ${coffee.process[lang]}` : ""}
        </span>
      )}
    </div>
  );
}
