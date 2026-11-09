import type { Metadata } from "next";
import { HEALTH_CARE_LINES, healthCareLineHref, type HealthCareLine } from "@/lib/health-care";
import { LINE_PHOTOS, STAND_INS } from "@/lib/health-care-photos";
import { CARD_SHOTS } from "@/lib/hospitality-photos";
import { healthCareProducts } from "@/lib/health-care-sheet";
import { ProductCard, type HospitalityCardProduct } from "@/components/hospitality/ProductCard";
import { Reveal } from "@/components/animation/Reveal";
import { RangeQuotePrompt } from "@/components/marketing/RangeQuotePrompt";

export const metadata: Metadata = {
  title: "Health-Care",
  description:
    "Towels, blankets, gowns and bed linen for the ward, the nursery, the treatment room and the hyperbaric chamber, with a stock code for every product.",
  alternates: { canonical: "/health-care" },
};

/**
 * The Health-Care range: one card per line in lib/health-care.ts.
 *
 * Every card opens the line's own page rather than the quote form, including
 * the five lines with no specification: those pages still carry the
 * photographs, and a buyer looking at a gown wants to see it before asking.
 */

export default function HealthCarePage() {
  const cards = HEALTH_CARE_LINES.map(toCard);

  return (
    <main className="bg-background">
      {/* The same heading as the Hospitality page, so the ranges open alike. */}
      <section className="border-premium/20 border-b">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <Reveal variant="fade-up">
            <p className="text-premium text-[13px] font-semibold tracking-[0.14em] uppercase">
              Health-Care
            </p>
            <h1 className="font-heading text-foreground mt-3 max-w-3xl text-4xl leading-[1.08] font-semibold text-balance sm:text-5xl">
              Health-Care Linens
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed text-pretty">
              Towels, blankets, gowns and bed linen for the ward, the nursery and the treatment
              room. Open a category to see its products, then a product for its specification and
              stock codes.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <ProductCard key={card.id} product={card} />
            ))}
          </div>

        </div>
      </section>

      <RangeQuotePrompt />
    </main>
  );
}

function productCount(slug: string): string {
  const n = healthCareProducts(slug).length;
  return `${n} ${n === 1 ? "product" : "products"}`;
}

function toCard(line: HealthCareLine): HospitalityCardProduct {
  const href = healthCareLineHref(line);
  return {
    id: line.slug,
    name: line.name,
    href,
    quoteHref: href,
    ctaLabel: "View details",
    material: productCount(line.slug),
    colours: [],
    images: (LINE_PHOTOS[line.slug] ?? STAND_INS).slice(0, CARD_SHOTS),
    badge: null,
    rating: null,
    alert: line.alert,
  };
}
