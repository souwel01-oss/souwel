import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  HOSPITALITY_GROUPS,
  getHospitalityGroup,
  swatchColour,
  type HospitalityGroup,
} from "@/lib/hospitality";
import { PRODUCTS } from "@/lib/product-data";
import { NOT_SPECIFIED } from "@/lib/product-data";
import { ProductCard, type HospitalityCardProduct } from "@/components/hospitality/ProductCard";
import { Reveal } from "@/components/animation/Reveal";

export function generateStaticParams() {
  return HOSPITALITY_GROUPS.map((g) => ({ group: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ group: string }>;
}): Promise<Metadata> {
  const { group: slug } = await params;
  const group = getHospitalityGroup(slug);
  if (!group) return { title: "Not found" };

  return {
    title: `${group.title} — Hospitality`,
    description: group.description,
    alternates: { canonical: `/hospitality/${group.slug}` },
  };
}

/**
 * Product listing page for one Hospitality range.
 *
 * THE JOIN HAPPENS HERE, on the server. lib/hospitality.ts holds the range and
 * carries no specifications; lib/product-data.ts holds the specifications and
 * knows nothing about ranges. Composing them in a Server Component is what
 * keeps the header's bundle free of twenty-four specification tables — see the
 * note at the top of lib/hospitality.ts.
 *
 * EVERY LINE IN THE RANGE GETS A CARD, including the twenty that have no
 * specification on the client's product sheet. Those cards say "Specification
 * on request" and send the buyer to the quote form. The alternative — hiding
 * them until a spec arrives — would mean the mega-menu offers a product and the
 * page it points at does not have it, which is the one thing an anchor link
 * must never do.
 */
export default async function HospitalityListingPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group: slug } = await params;
  const group = getHospitalityGroup(slug);
  if (!group) notFound();

  const products = group.items.map((item) => toCard(item, group));

  const specified = products.filter((p) => p.material !== null).length;

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
              <li className="text-foreground font-medium">{group.title}</li>
            </ol>
          </nav>

          <Reveal variant="fade-up">
            <h1 className="font-heading text-foreground mt-6 max-w-3xl text-3xl leading-[1.1] font-semibold text-balance sm:text-4xl lg:text-5xl">
              {group.title}
            </h1>
            <p className="text-muted-foreground mt-5 max-w-2xl text-[15.5px] leading-relaxed text-pretty">
              {group.intro}
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
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Reveal>

          {/* Said once under the grid rather than on every card. Two facts a
              buyer needs before they read a swatch or a spec line, and neither
              belongs repeated eleven times. */}
          <p className="text-muted-foreground border-border mt-12 border-t pt-6 text-[13px] leading-relaxed">
            Colour swatches are indicative only — shades are matched from a physical sample when we
            quote.
            {specified < products.length ? (
              <>
                {" "}
                {products.length - specified} of these {products.length} lines are supplied to
                order and are not on our published specification sheet yet; ask and we will send the
                construction detail with your quotation.
              </>
            ) : null}
          </p>
        </div>
      </section>

      {/* ── Other ranges ────────────────────────────────────────────────── */}
      <section className="border-premium/20 border-t py-12 sm:py-16">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <h2 className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
            The rest of the hospitality range
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {HOSPITALITY_GROUPS.filter((g) => g.slug !== group.slug).map((g) => (
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
 * One range line, joined to its specification if it has one.
 *
 * THE MATERIAL LINE IS BUILT FROM THE CATALOGUE'S OWN DERIVED FACTS, not from a
 * second description written for this card. Composition and finished size are
 * the two a hospitality buyer scans a grid for; everything else is on the
 * product page. `NOT_SPECIFIED` values are dropped rather than printed — an
 * em dash reads as information on a spec table and as damage in a one-line
 * summary.
 */
function toCard(
  item: HospitalityGroup["items"][number],
  group: HospitalityGroup
): HospitalityCardProduct {
  const product = item.productSlug ? PRODUCTS[item.productSlug] : undefined;

  if (!product) {
    return {
      id: item.slug,
      name: item.name,
      // Nothing to link to yet, so both targets are the quote form. A card
      // that navigates to a page which does not exist is worse than one that
      // takes the buyer straight to the thing they would have done next.
      href: `/quote?enquiry=${encodeURIComponent(item.name)}`,
      quoteHref: `/quote?enquiry=${encodeURIComponent(item.name)}`,
      material: null,
      colours: [],
      images: group.fallbackImages.slice(0, 2),
      badge: null,
      rating: null,
    };
  }

  const fact = (label: string) =>
    product.keyFacts.find((f) => f.label === label)?.value ?? NOT_SPECIFIED;

  const parts = [fact("Composition"), fact("Finished size")].filter(
    (v) => v !== NOT_SPECIFIED && v.length > 0
  );

  const colours = Array.from(new Set(product.variants.map((v) => v.colour)))
    .filter((c) => c !== NOT_SPECIFIED)
    .map((name) => ({ name, hex: swatchColour(name) }));

  return {
    id: item.slug,
    name: item.name,
    href: `/products/${product.slug}`,
    quoteHref: `/quote?product=${product.slug}`,
    material: parts.length ? parts.join(" · ") : null,
    colours,
    images: product.galleryImageUrls.length
      ? product.galleryImageUrls
      : group.fallbackImages.slice(0, 2),
    badge: null,
    rating: null,
  };
}
