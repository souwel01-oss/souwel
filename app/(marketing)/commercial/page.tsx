import type { Metadata } from "next";
import { COMMERCIAL_GROUPS, commercialItemHref, type CommercialItem } from "@/lib/commercial";
import { LINE_PHOTOS, STAND_INS } from "@/lib/commercial-photos";
import { CARD_SHOTS } from "@/lib/hospitality-photos";
import { catalogueSummary } from "@/lib/catalogue-summary";
import { ProductCard, type HospitalityCardProduct } from "@/components/hospitality/ProductCard";
import { Reveal } from "@/components/animation/Reveal";
import { RangeVideoBand } from "@/components/marketing/RangeVideoBand";
import { RangeQuotePrompt } from "@/components/marketing/RangeQuotePrompt";

export const metadata: Metadata = {
  title: "Commercial",
  description:
    "Textiles for automotive workshops, airline cabins and galleys, and the institutional laundries that serve hotels and hospitals.",
  alternates: { canonical: "/commercial" },
};

/**
 * The Commercial range: one section per group in lib/commercial.ts, in the
 * client's order, each with a card per line.
 *
 * ONE PAGE RATHER THAN A PAGE PER GROUP. Hospitality's groups run to nine
 * lines and earn listing pages of their own; these run to two, six and two,
 * and three short pages would each be mostly header. Each section carries the
 * group's slug as its id, so a line page's breadcrumb lands on its own group.
 */

export default function CommercialPage() {
  return (
    <main className="bg-background">
      <RangeVideoBand name="commercial" label="Commercial Textiles" />

      {/* The same heading as the Hospitality page, so the ranges open alike. */}
      <section className="border-premium/20 border-b">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <Reveal variant="fade-up">
            <p className="text-premium text-[13px] font-semibold tracking-[0.14em] uppercase">
              Commercial
            </p>
            <h1 className="font-heading text-foreground mt-3 max-w-3xl text-4xl leading-[1.08] font-semibold text-balance sm:text-5xl">
              Commercial Textiles
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed text-pretty">
              Textiles for the automotive workshop, the airline cabin and galley, and the
              institutional laundries that serve hotels and hospitals.
            </p>
          </Reveal>

          {/* A jump row, so Airline's six lines are one click from the top. */}
          <ul className="mt-8 flex flex-wrap gap-2.5">
            {COMMERCIAL_GROUPS.map((group) => (
              <li key={group.slug}>
                <a
                  href={`#${group.slug}`}
                  className="border-premium/35 text-foreground/80 hover:border-premium hover:text-foreground focus-visible:ring-ring inline-flex rounded-full border px-4 py-2 text-[13.5px] transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  {group.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {COMMERCIAL_GROUPS.map((group, i) => (
        <section
          key={group.slug}
          id={group.slug}
          // Clears the sticky header when a jump link or breadcrumb lands here.
          className={`scroll-mt-24 py-12 sm:py-16 ${i > 0 ? "border-premium/20 border-t" : ""}`}
        >
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <Reveal variant="fade-up">
              <h2 className="font-heading text-foreground text-2xl font-semibold sm:text-3xl">
                {group.title}
              </h2>
              <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed text-pretty">
                {group.description}
              </p>
            </Reveal>

            <Reveal
              variant="fade-up"
              stagger
              batch
              className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
            >
              {group.items.map((item) => (
                <ProductCard key={item.slug} product={toCard(item)} />
              ))}
            </Reveal>
          </div>
        </section>
      ))}

      <RangeQuotePrompt />
    </main>
  );
}

function toCard(item: CommercialItem): HospitalityCardProduct {
  const href = commercialItemHref(item);
  return {
    id: item.slug,
    name: item.name,
    href,
    quoteHref: href,
    // A range link opens a whole range; anything else opens its own page.
    ctaLabel: item.href ? "View the range" : "View details",
    material: item.href ? item.intro : catalogueSummary(item.productSlugs),
    colours: [],
    images: (LINE_PHOTOS[item.slug] ?? STAND_INS).slice(0, CARD_SHOTS),
    badge: null,
    rating: null,
  };
}
