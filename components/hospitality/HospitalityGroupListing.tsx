import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { HOSPITALITY_GROUPS, swatchColour, type HospitalityGroup } from "@/lib/hospitality";
import { PRODUCTS } from "@/lib/product-data";
import { NOT_SPECIFIED } from "@/lib/product-data";
import { TERRY_BASE, terryRangeSummary } from "@/lib/terry-towels";
import { bedLinenFamilyCardSummary } from "@/lib/bed-linen";
import { CARD_SHOTS, LINE_PHOTOS } from "@/lib/hospitality-photos";
import { ProductCard, type HospitalityCardProduct } from "@/components/hospitality/ProductCard";
import { Reveal } from "@/components/animation/Reveal";

/**
 * Product listing page for one Hospitality range, as a shared component.
 *
 * EXTRACTED FROM app/(marketing)/hospitality/[group]/page.tsx SO BED LINEN CAN
 * REUSE IT. Bed Linen now has its own literal route
 * (app/(marketing)/hospitality/bed-linen/), because it needs a family listing
 * page and product detail pages underneath it — a literal directory shadows
 * the dynamic [group] sibling for that whole path, including the exact
 * "/hospitality/bed-linen" URL, so that page needs its own file. Both routes
 * render the identical listing for every OTHER group, and this is the one
 * copy of that rendering.
 *
 * See the original for the fuller reasoning: every line in the range gets a
 * card, including the ones with no specification on the client's product
 * sheet — those say "Specification on request" rather than being hidden,
 * because a mega-menu link that lands on a page with no matching anchor is
 * worse than a card that is honest about not having a spec yet.
 */
export function HospitalityGroupListing({ group }: { group: HospitalityGroup }) {
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

          <p className="text-muted-foreground border-border mt-12 border-t pt-6 text-[13px] leading-relaxed">
            Colour swatches are indicative only — shades are matched from a physical sample when we
            quote.
            {specified < products.length ? (
              <>
                {" "}
                {products.length - specified} of these {products.length} lines are supplied to order
                and are not on our published specification sheet yet; ask and we will send the
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
 * THE MATERIAL LINE IS BUILT FROM THE CATALOGUE'S OWN DERIVED FACTS, not from
 * a second description written for this card. See the original file's
 * docblock (now here) for the fuller reasoning.
 */
function toCard(
  item: HospitalityGroup["items"][number],
  group: HospitalityGroup
): HospitalityCardProduct {
  const product = item.productSlug ? PRODUCTS[item.productSlug] : undefined;
  // The line's own photographs win over everything else; a line without any
  // keeps the stand-ins it had. See lib/hospitality-photos.ts.
  const photos = LINE_PHOTOS[item.slug]?.slice(0, CARD_SHOTS);

  if (item.href) {
    // Bed Linen's own items key their range summary by item.slug, which is
    // deliberately the same string as the matching family slug in
    // lib/bed-linen.ts — "flat-sheets", "mattress-protector" and so on.
    const material =
      item.href === TERRY_BASE
        ? terryRangeSummary()
        : group.slug === "bed-linen"
          ? bedLinenFamilyCardSummary(item.slug)
          : null;

    return {
      id: item.slug,
      name: item.name,
      href: item.href,
      quoteHref: item.href,
      ctaLabel: item.ctaLabel,
      material,
      colours: [],
      images: photos ?? group.fallbackImages.slice(0, 2),
      badge: null,
      rating: null,
    };
  }

  if (!product) {
    return {
      id: item.slug,
      name: item.name,
      href: `/quote?enquiry=${encodeURIComponent(item.name)}`,
      quoteHref: `/quote?enquiry=${encodeURIComponent(item.name)}`,
      material: null,
      colours: [],
      images: photos ?? group.fallbackImages.slice(0, 2),
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
    images:
      photos ??
      (product.galleryImageUrls.length
        ? product.galleryImageUrls
        : group.fallbackImages.slice(0, 2)),
    badge: null,
    rating: null,
  };
}
