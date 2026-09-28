import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  FB_BASE,
  fbCardSummary,
  fbFamilySlugs,
  fbProductHref,
  getFbFamily,
  type FbProduct,
} from "@/lib/food-beverage";
import { ProductCard, type HospitalityCardProduct } from "@/components/hospitality/ProductCard";
import { Reveal } from "@/components/animation/Reveal";
import { ProductDetail, IMAGES } from "@/components/hospitality/FoodBevProductDetail";

/**
 * One segment, two kinds of page — the same shape as the Bed Linen family
 * route:
 *
 *   /hospitality/food-beverage/bar-mop      → the LISTING (three builds)
 *   /hospitality/food-beverage/flour-sack   → the DETAIL page directly
 *
 * Only Bar Mop and Aprons have more than one build on the sheet, so only
 * those two get a listing. The other seven families are one product each and
 * open straight to it — a listing page holding one card is a click that
 * exists only to be clicked through.
 */

export function generateStaticParams() {
  return fbFamilySlugs().map((family) => ({ family }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ family: string }>;
}): Promise<Metadata> {
  const { family } = await params;
  const members = getFbFamily(family);
  if (members.length === 0) return { title: "Not found" };

  const label = members[0].familyLabel;
  if (members.length === 1) {
    const p = members[0];
    return {
      title: `${label} — Food & Beverage`,
      description: `${p.name} in ${p.blend}, ${p.sizes.length === 1 ? p.sizes[0].size : `${p.sizes.length} sizes`} and ${p.colours.length} ${p.colours.length === 1 ? "colour" : "colours"}, with stock codes from our Food & Beverage sheet.`,
      alternates: { canonical: `${FB_BASE}/${family}` },
    };
  }

  return {
    title: `${label} — Food & Beverage`,
    description: `${members.length} ${label.toLowerCase()} builds from our Food & Beverage sheet — blend, weight, packing and a stock code per colour.`,
    alternates: { canonical: `${FB_BASE}/${family}` },
  };
}

export default async function FbFamilyPage({
  params,
}: {
  params: Promise<{ family: string }>;
}) {
  const { family } = await params;
  const members = getFbFamily(family);
  if (members.length === 0) notFound();

  if (members.length === 1) return <ProductDetail product={members[0]} />;

  return <FamilyListing members={members} />;
}

function FamilyListing({ members }: { members: FbProduct[] }) {
  const label = members[0].familyLabel;

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
                <Link href={FB_BASE} className="hover:text-foreground transition-colors">
                  Food &amp; Beverage
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
              {members.length} builds from our Food &amp; Beverage sheet, each with its own blend
              and weight. Open one to choose its colour and quantity.
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
            {members.map((product) => (
              <ProductCard key={product.slug} product={toCard(product)} />
            ))}
          </Reveal>
        </div>
      </section>
    </main>
  );
}

function toCard(product: FbProduct): HospitalityCardProduct {
  const href = fbProductHref(product);
  return {
    id: product.slug,
    name: product.name,
    href,
    quoteHref: href,
    ctaLabel: "View details",
    material: fbCardSummary(product),
    colours: [],
    images: IMAGES,
    badge: null,
    rating: null,
  };
}
