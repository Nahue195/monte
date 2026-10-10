import Link from "next/link";

// Bilingual on purpose: the global 404 does not know the visitor's language.
export function NotFoundView() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-start gap-6 px-4 py-24 sm:px-6">
      <p className="font-display text-7xl text-hot">404</p>
      <h1 className="font-display text-3xl uppercase sm:text-5xl">Este café no existe</h1>
      <p lang="en" className="text-muted">
        This coffee doesn&apos;t exist.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/es/shop" className="btn btn-hot">
          Ir a la tienda
        </Link>
        <Link href="/en/shop" lang="en" className="btn btn-ghost">
          Go to the shop
        </Link>
      </div>
    </section>
  );
}
