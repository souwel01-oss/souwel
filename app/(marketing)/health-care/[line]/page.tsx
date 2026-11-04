import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  HEALTH_CARE_BASE,
  HEALTH_CARE_LINES,
  getHealthCareLine,
  healthCareLineHref,
} from "@/lib/health-care";
import {
  healthCareCardSummary,
  healthCareProductHref,
  healthCareProducts,
} from "@/lib/health-care-sheet";
import { healthCareProductShots } from "@/lib/health-care-photos";
import { CARD_SHOTS } from "@/lib/hospitality-photos";
import { ProductCard, type HospitalityCardProduct } from "@/components/hospitality/ProductCard";
import { Reveal } from "@/components/animation/Reveal";
import { RangeQuotePrompt } from "@/components/marketing/RangeQuotePrompt";

/**
 * One Health-Care category: a card for every product under its red heading on
 * the client's sheet. A card opens the product's own page, with its
 * specification and stock codes.
 *
 * A category with a single product has nothing to choose between, so it goes
 * straight to that product instead of showing a page with one card.
 */

export function generateStaticParams() {
  return HEALTH_CARE_LINES.map((line) => ({ line: line.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ line: string }>;
}): Promise<Metadata> {
  const { line: slug } = await params;
  const line = getHealthCareLine(slug);
  if (!line) return { title: "Not found" };

  return {
    title: `${line.name} — Health-Care`,
    description: line.intro,
    alternates: { canonical: healthCareLineHref(line) },
  };
}

export default async function HealthCareCategoryPage({
  params,
}: {
  params: Promise<{ line: string }>;
}) {
  const { line: slug } = await params;
  const line = getHealthCareLine(slug);
  if (!line) notFound();

  const products = healthCareProducts(line.slug);
  if (products.length === 1) redirect(healthCareProductHref(line.slug, products[0]));

  const cards: HospitalityCardProduct[] = products.map((product) => {
    const href = healthCareProductHref(line.slug, product);
    return {
      id: product.slug,
      name: product.name,
      href,
      quoteHref: href,
      ctaLabel: "View details",
      material: healthCareCardSummary(product) || null,
      colours: [],
      images: healthCareProductShots(line.slug, product.slug).slice(0, CARD_SHOTS),
      badge: null,
      rating: null,
    };
  });

  return (
    <main className="bg-background">
      <section className="border-premium/20 border-b">
        <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-12 sm:px-8 sm:pt-14 sm:pb-14">
          <nav aria-label="Breadcrumb">
            <ol className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-[13px]">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <ChevronRight aria-hidden className="size-3.5 shrink-0" />
              <li>
                <Link href={HEALTH_CARE_BASE} className="hover:text-foreground transition-colors">
                  Health-Care
                </Link>
              </li>
              <ChevronRight aria-hidden className="size-3.5 shrink-0" />
              <li className="text-foreground font-medium">{line.name}</li>
            </ol>
          </nav>

          <Reveal variant="fade-up">
            <h1
              className={`font-heading mt-6 text-3xl leading-[1.1] font-semibold sm:text-4xl lg:text-5xl ${
                line.alert ? "text-destructive" : "text-foreground"
              }`}
            >
              {line.name}
            </h1>
            <p className="text-muted-foreground mt-5 max-w-2xl text-[15.5px] leading-relaxed text-pretty">
              {line.intro}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <Reveal
            variant="fade-up"
            stagger
            batch
            className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
          >
            {cards.map((card) => (
              <ProductCard key={card.id} product={card} />
            ))}
          </Reveal>
        </div>
      </section>

      <section className="border-premium/20 border-t py-10">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <h2 className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
            The rest of the Health-Care range
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {HEALTH_CARE_LINES.filter((l) => l.slug !== line.slug).map((l) => (
              <li key={l.slug}>
                <Link
                  href={healthCareLineHref(l)}
                  className={`border-premium/35 hover:border-premium focus-visible:ring-ring inline-flex rounded-full border px-4 py-2 text-[13.5px] transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                    l.alert ? "text-destructive" : "text-foreground/80 hover:text-foreground"
                  }`}
                >
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <RangeQuotePrompt />
    </main>
  );
}
