import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { terryListingEntries, type TerryListingEntry } from "@/lib/terry-towels";
import { ProductCard, type HospitalityCardProduct } from "@/components/hospitality/ProductCard";
import { Reveal } from "@/components/animation/Reveal";

export const metadata: Metadata = {
  title: "Terry Towels — Hospitality",
  description:
    "Nine terry constructions for hotel and resort bathrooms — classic terry, dobby, quad cam, pique weave, piano key, cabana pool and sauna — with stock codes, weights and case packs for every size.",
  alternates: { canonical: "/hospitality/terry-towels" },
};

/**
 * The Terry Towels range.
 *
 * THIS PAGE SITS WHERE THREE LINES USED TO. Bath Linen previously listed
 * Washcloths, Hand towels and Bath towels as three products with one
 * specification each. The client's towel sheet is organised the other way
 * round: seven CONSTRUCTIONS, each made in up to four of those sizes. So the
 * size is a choice made inside a product rather than the product itself, and
 * this page lists the constructions.
 *
 * ONE CARD PER PRODUCT NAME, NOT PER SHEET ROW. The sheet has seven rows but
 * six products a buyer would name: Classic Terry Towels appears twice, once per
 * blend. Its card names both blends inside itself and opens the chooser, where
 * the two sit side by side. Two cards under one title would have read as a
 * duplicate long before anyone reached the line of body text separating them.
 */

/** Stand-ins. There is no photography for these seven — see lib/terry-towels.ts. */
const IMAGES = [
  { src: "/images/products/towels.jpg", alt: "Stack of folded white towels" },
  { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
];

export default function TerryTowelsPage() {
  const cards = terryListingEntries().map(toCard);

  return (
    <main className="bg-background">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <section className="border-premium/20 border-b">
        <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-12 sm:px-8 sm:pt-14 sm:pb-16">
          <nav aria-label="Breadcrumb">
            <ol className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-[13px]">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <ChevronRight aria-hidden className="size-3.5 shrink-0" />
              <li>
                <Link href="/hospitality" className="hover:text-foreground transition-colors">
                  Hospitality
                </Link>
              </li>
              <ChevronRight aria-hidden className="size-3.5 shrink-0" />
              <li>
                <Link
                  href="/hospitality/bath-linen"
                  className="hover:text-foreground transition-colors"
                >
                  Bath Linen
                </Link>
              </li>
              <ChevronRight aria-hidden className="size-3.5 shrink-0" />
              <li className="text-foreground font-medium">Terry Towels</li>
            </ol>
          </nav>

          <Reveal variant="fade-up">
            <h1 className="font-heading text-foreground mt-6 max-w-3xl text-3xl leading-[1.1] font-semibold text-balance sm:text-4xl lg:text-5xl">
              Terry Towels
            </h1>
            <p className="text-muted-foreground mt-5 max-w-2xl text-[15.5px] leading-relaxed text-pretty">
              Every construction on our towel sheet, each made in the sizes a property actually
              orders. Choose the construction first — it decides how the towel feels and how it
              holds up in the laundry — then the size, weight and stock code on the product page.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Grid ────────────────────────────────────────────────────────── */}
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

          <p className="text-muted-foreground border-border mt-12 border-t pt-6 text-[13px] leading-relaxed">
            Weights and stock codes are quoted as they appear on our towel sheet. Sizes shown are
            the ones each construction is made in — where a size is not listed against a
            construction, it is not part of that build.
          </p>
        </div>
      </section>

      {/* ── Back to the range ───────────────────────────────────────────── */}
      <section className="border-premium/20 border-t py-12 sm:py-16">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <h2 className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
            The rest of the hospitality range
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {[
              { slug: "bed-linen", title: "Bed Linen" },
              { slug: "bath-linen", title: "Bath Linen" },
              { slug: "table-linen", title: "Table Linen" },
              { slug: "kitchen-linen", title: "Kitchen Linen" },
              { slug: "pool-fitness-spa-salon", title: "Pool, Fitness, Spa & Salon" },
            ].map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/hospitality/${g.slug}`}
                  className="border-premium/35 text-foreground/80 hover:border-premium hover:text-foreground focus-visible:ring-ring inline-flex rounded-full border px-4 py-2 text-[13.5px] transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

/**
 * The card's button says "View details", not "Request a quote".
 *
 * A quote for one of these needs a size chosen — the weight, and therefore the
 * price, changes with it. Sending the buyer straight to the form from here
 * would produce a request that Sales has to bounce back with "which size?", so
 * the card opens the page where that choice is made.
 */
function toCard(entry: TerryListingEntry): HospitalityCardProduct {
  return {
    id: entry.key,
    name: entry.name,
    href: entry.href,
    quoteHref: entry.href,
    ctaLabel: "View details",
    // One line for a single build, one per blend where the name covers several.
    material: entry.lines.length > 1 ? entry.lines : entry.lines[0],
    colours: [],
    images: IMAGES,
    badge: null,
    rating: null,
  };
}
