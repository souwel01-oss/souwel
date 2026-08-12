import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/lib/site-config";
import { PRODUCTS } from "@/lib/product-data";

/**
 * Category listing (FR-002).
 *
 * These four routes were linked from the header, the footer and the homepage
 * carousel before they existed, so every one of those links 404'd. They are
 * static: the catalogue lives in lib/product-data.ts, the same source the
 * product pages and the quote picker read, so a product cannot appear here and
 * be missing there.
 *
 * TWO OF THE FOUR CATEGORIES HAVE NO PRODUCTS YET — institutional-laundry and
 * commercial-automotive were supplied as ranges without an item list. Those
 * pages say so and route the visitor to the quote form rather than rendering an
 * empty grid that reads like a fault.
 */

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return { title: "Not found" };

  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/categories/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const products = Object.values(PRODUCTS).filter((p) => p.categorySlug === category.slug);

  return (
    <main className="bg-background">
      {/* Header band. Uses the category photograph the homepage carousel already
          ships, so no new asset is required. */}
      <section className="bg-navy relative isolate overflow-hidden">
        <Image
          src={`/images/categories/${category.slug}.jpg`}
          alt={category.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div className="relative mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <nav aria-label="Breadcrumb" className="text-white/60">
            <ol className="flex items-center gap-2 text-[13px]">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-white/90">{category.name}</li>
            </ol>
          </nav>

          <h1 className="mt-5 text-3xl leading-tight font-semibold text-white sm:text-5xl">
            {category.name}
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/80 sm:text-lg">
            {category.description}
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        {products.length > 0 ? (
          <>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-foreground text-xl font-semibold">
                {products.length} product{products.length === 1 ? "" : "s"} in this range
              </h2>
              <Link
                href={`/quote`}
                className="text-primary text-sm font-semibold underline underline-offset-4"
              >
                Request a quote for several at once
              </Link>
            </div>

            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <li key={product.slug}>
                  <Link
                    href={`/products/${product.slug}`}
                    className="group border-border bg-card hover:border-primary/40 focus-visible:ring-ring block h-full overflow-hidden rounded-2xl border transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <div className="bg-white">
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={product.heroImageUrl}
                          alt={product.heroImageAlt}
                          fill
                          sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 90vw"
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-foreground text-base font-semibold">{product.name}</h3>
                      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                        {product.shortDescription}
                      </p>
                      <span className="text-primary mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
                        View specifications
                        <ArrowRight
                          aria-hidden
                          className="size-4 transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="border-border bg-card rounded-2xl border p-8 sm:p-12">
            <h2 className="text-foreground text-xl font-semibold">
              This range is quoted to specification
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl text-[15px] leading-relaxed">
              We have not published individual product pages for {category.name} yet. Tell us what
              you are specifying — composition, weight, finished size and volume — and our team will
              come back with options and pricing.
            </p>
            <Link
              href="/quote"
              className="bg-primary-strong text-primary-strong-foreground mt-6 inline-flex h-11 items-center gap-2 rounded-lg px-6 text-sm font-semibold transition-[filter] hover:brightness-110"
            >
              Request a quote
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
