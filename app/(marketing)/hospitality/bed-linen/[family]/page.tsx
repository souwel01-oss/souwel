import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  bedLinenFamilySlugs,
  bedLinenCardSummary,
  bedLinenProductHref,
  bedLinenSizesFor,
  getBedLinenFamily,
  type BedLinenProduct,
} from "@/lib/bed-linen";
import { ProductCard, type HospitalityCardProduct } from "@/components/hospitality/ProductCard";
import { Reveal } from "@/components/animation/Reveal";
import { ProductDetail, IMAGES } from "@/components/hospitality/BedLinenProductDetail";

/**
 * One segment, two kinds of page — the same trick as
 * app/(marketing)/hospitality/terry-towels/[item]/page.tsx, one level up:
 *
 *   /hospitality/bed-linen/flat-sheets         → the LISTING (4 products)
 *   /hospitality/bed-linen/mattress-protector  → the DETAIL page directly
 *
 * A family with more than one member gets a listing; a family with exactly
 * one — Mattress Protector, Pillow Protector — has no listing page to show,
 * so this route renders its detail page in place of one. There is
 * deliberately no chooser step in between the way Classic Terry Towels has
 * one: those four/three products are not the same name wearing different
 * blends, they are four/three genuinely different rows the brief asked to be
 * shown as separate cards.
 */

export function generateStaticParams() {
  return bedLinenFamilySlugs().map((family) => ({ family }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ family: string }>;
}): Promise<Metadata> {
  const { family } = await params;
  const members = getBedLinenFamily(family);
  if (members.length === 0) return { title: "Not found" };

  if (members.length === 1) {
    const product = members[0];
    return {
      title: `${product.familyLabel} — Bed Linen`,
      description: `${product.name}, made in ${bedLinenSizesFor(product).length} bed sizes. Specification from our hospitality sheet.`,
      alternates: { canonical: `/hospitality/bed-linen/${family}` },
    };
  }

  return {
    title: `${members[0].familyLabel} — Bed Linen`,
    description: `${members.length} ${members[0].familyLabel.toLowerCase()} builds from our hospitality sheet — thread count, blend, hem and finished size for each.`,
    alternates: { canonical: `/hospitality/bed-linen/${family}` },
  };
}

export default async function BedLinenFamilyPage({
  params,
}: {
  params: Promise<{ family: string }>;
}) {
  const { family } = await params;
  const members = getBedLinenFamily(family);
  if (members.length === 0) notFound();

  if (members.length === 1) {
    return <ProductDetail product={members[0]} />;
  }

  return <FamilyListing family={family} members={members} />;
}

function FamilyListing({ family, members }: { family: string; members: BedLinenProduct[] }) {
  const label = members[0].familyLabel;
  const cards = members.map(toCard);

  return (
    <main className="bg-background">
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
                <Link href="/hospitality/bed-linen" className="hover:text-foreground transition-colors">
                  Bed Linen
                </Link>
              </li>
              <ChevronRight aria-hidden className="size-3.5 shrink-0" />
              <li className="text-foreground font-medium">{label}</li>
            </ol>
          </nav>

          <Reveal variant="fade-up">
            <h1 className="font-heading text-foreground mt-6 max-w-3xl text-3xl leading-[1.1] font-semibold text-balance sm:text-4xl lg:text-5xl">
              {label}
            </h1>
            <p className="text-muted-foreground mt-5 max-w-2xl text-[15.5px] leading-relaxed text-pretty">
              {members.length} builds from our hospitality sheet, each with its own thread count,
              blend and hem. Open a product to choose its bed size and quantity.
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

      <section className="border-premium/20 border-t py-12 sm:py-16">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <h2 className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
            The rest of Bed Linen
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {["flat-sheets", "fitted-sheets", "pillow-case", "duvet-cover", "mattress-protector", "pillow-protector"]
              .filter((f) => f !== family)
              .map((f) => {
                const sibling = getBedLinenFamily(f);
                return (
                  <li key={f}>
                    <Link
                      href={
                        sibling.length > 1 ? `/hospitality/bed-linen/${f}` : bedLinenProductHref(sibling[0])
                      }
                      className="border-premium/35 text-foreground/80 hover:border-premium hover:text-foreground focus-visible:ring-ring inline-flex rounded-full border px-4 py-2 text-[13.5px] transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    >
                      {sibling[0]?.familyLabel ?? f}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      </section>
    </main>
  );
}

function toCard(product: BedLinenProduct): HospitalityCardProduct {
  const href = bedLinenProductHref(product);
  return {
    id: product.slug,
    name: product.name,
    href,
    quoteHref: href,
    ctaLabel: "View details",
    material: bedLinenCardSummary(product),
    colours: [],
    images: IMAGES,
    badge: null,
    rating: null,
  };
}
