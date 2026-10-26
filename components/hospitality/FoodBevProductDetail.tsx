import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  FB_BASE,
  fbCaseStep,
  fbProductHref,
  fbUnit,
  getFbFamily,
  type FbProduct,
} from "@/lib/food-beverage";
import { swatchColour } from "@/lib/hospitality";
import { LINE_PHOTOS, shotsInColours, type Shot } from "@/lib/hospitality-photos";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { FoodBevSpecPicker } from "@/components/hospitality/FoodBevSpecPicker";
import { FoodBevSpecTable } from "@/components/hospitality/FoodBevSpecTable";
import { SPEC_SECTION_ID, RangeOrderListProvider } from "@/components/hospitality/RangeOrderList";
import { Reveal } from "@/components/animation/Reveal";

/**
 * A Food & Beverage product page — hero picker, then the specification table
 * and order list. Mirrors the Terry, Bed Linen and Spa & Salon detail pages;
 * see components/hospitality/BedLinenProductDetail.tsx for why the picker and
 * the table share a context instead of being threaded through props.
 *
 * A SHARED COMPONENT, NOT INLINED IN ONE ROUTE, because two routes render it:
 * the family route for a single-build family (Flour Sack, Glass Towel and the
 * rest), and the product route for one build of Bar Mop or Aprons.
 */

/** Stand-ins, for the lines the client's shoot does not cover. */
const IMAGES = [
  { src: "/images/products/bar-mops.jpg", alt: "Rolled white cotton bar mops stacked together" },
  { src: "/images/products/napkins.jpg", alt: "Folded white linen napkin fabric in soft light" },
];

/**
 * The family's photographs in the colours this build is made in, or the
 * stand-ins where none are. Narrowed by colour because a family's builds do
 * not share a colour list — see lib/hospitality-photos.ts.
 */
export function fbImages(product: FbProduct): Shot[] {
  const shots = shotsInColours(LINE_PHOTOS[product.family], product.colours);
  return shots.length ? shots : IMAGES;
}

export function ProductDetail({ product }: { product: FbProduct }) {
  const images = fbImages(product);
  const siblings = getFbFamily(product.family);
  const hasListing = siblings.length > 1;

  const sizes = product.sizes.map((s) => s.size);
  const colours = product.colours.map((colour) => ({ colour, hex: swatchColour(colour) }));

  // "<size>|<colour>" is the picker's lookup key: the sheet gives a code per
  // PAIR, and the pair is what the buyer has to settle before there is
  // anything to order.
  const skus = Object.fromEntries(product.lines.map((l) => [`${l.size}|${l.colour}`, l.sku]));
  const packingBySize = Object.fromEntries(
    product.sizes.flatMap((s) => (s.packing ? [[s.size, s.packing]] : []))
  );

  const facts = [
    { label: "Description", value: product.description },
    { label: "Blend", value: product.blend },
    { label: "Weight", value: product.weight },
    // Size and packing are a fixed fact only where there is one of them;
    // where there are several they are a choice, and the picker shows them
    // as buttons instead.
    ...(sizes.length === 1 ? [{ label: "Size", value: sizes[0] }] : []),
    ...(sizes.length === 1 && product.sizes[0].packing
      ? [{ label: "Packing", value: product.sizes[0].packing }]
      : []),
    ...(colours.length === 1 ? [{ label: "Colour", value: colours[0].colour }] : []),
  ].filter((f): f is { label: string; value: string } => Boolean(f.value));

  const unit = fbUnit(product);
  const stepBySize = Object.fromEntries(sizes.map((s) => [s, fbCaseStep(product, s)]));

  return (
    <RangeOrderListProvider
      product={{
        kind: "fb",
        slug: product.slug,
        name: product.name,
        image: images[0].src,
        href: fbProductHref(product),
      }}
      // The size is in the label only where there is more than one — the same
      // rule the table uses for its Size column.
      lineMeta={product.lines.map((l) => ({
        sku: l.sku,
        // The unit in the label too: the drawer shows the bare number.
        label: `${sizes.length > 1 ? `${l.colour} ${l.size}` : l.colour}, in ${
          unit === "dz" ? "dozens" : "pieces"
        }`,
        step: stepBySize[l.size] ?? 1,
      }))}
    >
      <main className="bg-background">
        <section className="border-premium/20 border-b">
          <div className="mx-auto w-full max-w-6xl px-5 py-5 sm:px-8">
            <Crumbs
              trail={[
                ...(hasListing
                  ? [{ label: product.familyLabel, href: `${FB_BASE}/${product.family}` }]
                  : []),
                { label: hasListing ? product.name : product.familyLabel },
              ]}
            />
          </div>
        </section>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-14">
            <Reveal variant="fade-up">
              <ProductGallery images={images} />
            </Reveal>

            <div className="flex flex-col justify-center">
              <Reveal variant="fade-up">
                <p className="text-premium text-xs font-semibold tracking-[0.22em] uppercase">
                  Food &amp; Beverage
                </p>
                <h1 className="font-heading text-foreground mt-4 text-4xl leading-[1.08] font-semibold text-balance sm:text-5xl">
                  {product.name}
                </h1>

                <p className="text-muted-foreground mt-5 leading-relaxed text-pretty">
                  {sizes.length === 1 ? sizes[0] : `${sizes.length} sizes`} in{" "}
                  {colours.length === 1
                    ? colours[0].colour.toLowerCase()
                    : `${colours.length} colours`}
                  , each with its own stock code. Every figure below comes from our Food &amp;
                  Beverage sheet.
                </p>
              </Reveal>

              <Reveal variant="fade-up" delay={0.1}>
                <FoodBevSpecPicker
                  facts={facts}
                  sizes={sizes}
                  colours={colours}
                  skus={skus}
                  unit={unit}
                  stepBySize={stepBySize}
                  packingBySize={packingBySize}
                />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Specification, and the order list ───────────────────────────── */}
        {/* scroll-mt clears the sticky header when "Next" jumps here. */}
        <section
          id={SPEC_SECTION_ID}
          className="bg-platinum/25 border-premium/20 scroll-mt-24 border-y py-14 sm:py-20"
        >
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <Reveal variant="fade-up">
              <h2 className="font-heading text-3xl font-semibold sm:text-4xl">Specification</h2>
              <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
                Written to be read against your tender document. Add the lines you need and the
                quantities, then send the whole list as one request.
              </p>
            </Reveal>

            <div className="mt-10">
              <FoodBevSpecTable
                productSlug={product.slug}
                showSize={sizes.length > 1}
                unit={unit}
                rows={product.lines.map((l) => ({
                  sku: l.sku,
                  size: l.size,
                  colour: l.colour,
                  hex: swatchColour(l.colour),
                  step: stepBySize[l.size] ?? 1,
                }))}
              />
            </div>
          </div>
        </section>

        {/* ── The rest of the range ────────────────────────────────────────── */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <h2 className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
              {hasListing
                ? `Other ${product.familyLabel.toLowerCase()} builds`
                : "The rest of the range"}
            </h2>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {hasListing ? (
                siblings
                  .filter((p) => p.slug !== product.slug)
                  .map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`${FB_BASE}/${p.family}/${p.slug}`}
                        className="border-premium/35 text-foreground/80 hover:border-premium hover:text-foreground focus-visible:ring-ring inline-flex rounded-full border px-4 py-2 text-[13.5px] transition-colors focus-visible:ring-2 focus-visible:outline-none"
                      >
                        {p.name}
                      </Link>
                    </li>
                  ))
              ) : (
                <li>
                  <Link
                    href={FB_BASE}
                    className="border-premium/35 text-foreground/80 hover:border-premium hover:text-foreground focus-visible:ring-ring inline-flex rounded-full border px-4 py-2 text-[13.5px] transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    Back to Food &amp; Beverage
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </section>
      </main>
    </RangeOrderListProvider>
  );
}

function Crumbs({ trail }: { trail: { label: string; href?: string }[] }) {
  const fixed = [
    { label: "Home", href: "/" },
    { label: "Hospitality", href: "/hospitality" },
    { label: "Food & Beverage", href: FB_BASE },
  ];

  return (
    <nav aria-label="Breadcrumb">
      <ol className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-[13px]">
        {[...fixed, ...trail].map((crumb, i, all) => (
          <li key={crumb.label + i} className="flex items-center gap-1.5">
            {i > 0 ? <ChevronRight aria-hidden className="size-3.5 shrink-0" /> : null}
            {crumb.href && i < all.length - 1 ? (
              <Link href={crumb.href} className="hover:text-foreground transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span
                aria-current={i === all.length - 1 ? "page" : undefined}
                className="text-foreground font-medium"
              >
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
