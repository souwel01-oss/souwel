import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  BED_LINEN_BASE,
  bedLinenSizesFor,
  getBedLinenFamily,
  type BedLinenProduct,
} from "@/lib/bed-linen";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { BedLinenSpecPicker } from "@/components/hospitality/BedLinenSpecPicker";
import { BedLinenSpecTable } from "@/components/hospitality/BedLinenSpecTable";
import {
  BED_LINEN_SPEC_SECTION_ID,
  BedLinenOrderListProvider,
} from "@/components/hospitality/BedLinenOrderList";
import { Reveal } from "@/components/animation/Reveal";

/**
 * The Bed Linen product detail page — hero picker, then the specification
 * table and order list. Mirrors the ProductDetail half of
 * app/(marketing)/hospitality/terry-towels/[item]/page.tsx exactly; see that
 * file's docblock for why the picker and table share a context instead of
 * being threaded through props.
 *
 * A SHARED COMPONENT, NOT INLINED IN ONE ROUTE, because two routes render it:
 * app/(marketing)/hospitality/bed-linen/[family]/page.tsx for a single-member
 * family (Mattress Protector, Pillow Protector — no listing page above it),
 * and .../[family]/[slug]/page.tsx for one product picked off a multi-member
 * family's listing (Flat Sheets, Fitted Sheets, Pillow Case, Duvet Cover).
 */

/** Stand-ins. There is no photography for these sixteen rows yet. */
export const IMAGES = [
  { src: "/images/products/bed-sheets.jpg", alt: "Bed made up in white sheets and pillows" },
  { src: "/images/products/duvet-covers.jpg", alt: "White duvet cover draped across a bed" },
];

export function ProductDetail({ product }: { product: BedLinenProduct }) {
  const sizes = bedLinenSizesFor(product);
  const siblings = getBedLinenFamily(product.family);
  const hasListing = siblings.length > 1;

  const facts = [
    { label: "Thread Count", value: product.threadCount },
    { label: "Design", value: product.design },
    { label: "Quality", value: product.quality },
    { label: "Blend", value: product.blend },
    { label: "Hem", value: product.hem },
  ].filter((f): f is { label: string; value: string } => Boolean(f.value));

  return (
    <BedLinenOrderListProvider>
      <main className="bg-background">
        <section className="border-premium/20 border-b">
          <div className="mx-auto w-full max-w-6xl px-5 py-5 sm:px-8">
            <Crumbs
              trail={[
                ...(hasListing
                  ? [{ label: product.familyLabel, href: `${BED_LINEN_BASE}/${product.family}` }]
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
              <ProductGallery images={IMAGES} />
            </Reveal>

            <div className="flex flex-col justify-center">
              <Reveal variant="fade-up">
                <p className="text-premium text-xs font-semibold tracking-[0.22em] uppercase">
                  Bed Linen
                </p>
                <h1 className="font-heading text-foreground mt-4 text-4xl leading-[1.08] font-semibold text-balance sm:text-5xl">
                  {product.name}
                </h1>

                <p className="text-muted-foreground mt-5 leading-relaxed text-pretty">
                  Made in {sizes.length} {sizes.length === 1 ? "bed size" : "bed sizes"}. Every
                  figure below comes from our hospitality sheet.
                </p>
              </Reveal>

              <Reveal variant="fade-up" delay={0.1}>
                <BedLinenSpecPicker
                  facts={facts}
                  casePack={product.pcsPerCase}
                  sizes={sizes.map(({ size, dimensions, sku }) => ({
                    key: size.key,
                    name: size.name,
                    dimensions,
                    sku,
                  }))}
                />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Specification, and the order list ───────────────────────────── */}
        <section
          id={BED_LINEN_SPEC_SECTION_ID}
          className="bg-platinum/25 border-premium/20 scroll-mt-24 border-y py-14 sm:py-20"
        >
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <Reveal variant="fade-up">
              <h2 className="font-heading text-3xl font-semibold sm:text-4xl">Specification</h2>
              <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
                Written to be read against your tender document. Add the sizes you need and the
                quantities, then send the whole list as one request.
              </p>
            </Reveal>

            <div className="mt-10">
              <BedLinenSpecTable
                productSlug={product.slug}
                casePack={product.pcsPerCase}
                rows={sizes.map(({ size, dimensions, sku }) => ({
                  sizeKey: size.key,
                  name: size.name,
                  dimensions,
                  sku,
                }))}
              />
            </div>
          </div>
        </section>

        {/* ── The rest of the range ────────────────────────────────────────── */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <h2 className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
              {hasListing ? `Other ${product.familyLabel.toLowerCase()}` : "Other Bed Linen products"}
            </h2>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {hasListing ? (
                siblings
                  .filter((p) => p.slug !== product.slug)
                  .map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`${BED_LINEN_BASE}/${p.family}/${p.slug}`}
                        className="border-premium/35 text-foreground/80 hover:border-premium hover:text-foreground focus-visible:ring-ring inline-flex rounded-full border px-4 py-2 text-[13.5px] transition-colors focus-visible:ring-2 focus-visible:outline-none"
                      >
                        {p.name}
                      </Link>
                    </li>
                  ))
              ) : (
                <li>
                  <Link
                    href={BED_LINEN_BASE}
                    className="border-premium/35 text-foreground/80 hover:border-premium hover:text-foreground focus-visible:ring-ring inline-flex rounded-full border px-4 py-2 text-[13.5px] transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    Back to Bed Linen
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </section>
      </main>
    </BedLinenOrderListProvider>
  );
}

function Crumbs({ trail }: { trail: { label: string; href?: string }[] }) {
  const fixed = [
    { label: "Home", href: "/" },
    { label: "Hospitality", href: "/hospitality" },
    { label: "Bed Linen", href: BED_LINEN_BASE },
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
