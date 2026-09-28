import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  SPA_SALON_BASE,
  SPA_SALON_PRODUCTS,
  getSpaSalonProduct,
  type SpaSalonProduct,
} from "@/lib/spa-salon";
import { swatchColour } from "@/lib/hospitality";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { SpaSalonSpecPicker } from "@/components/hospitality/SpaSalonSpecPicker";
import { SpaSalonSpecTable } from "@/components/hospitality/SpaSalonSpecTable";
import { SPEC_SECTION_ID, RangeOrderListProvider } from "@/components/hospitality/RangeOrderList";
import { Reveal } from "@/components/animation/Reveal";

/**
 * A Spa & Salon product page.
 *
 * SAME SHAPE AS THE TERRY AND BED LINEN DETAIL PAGES — hero with a picker,
 * then a specification table that doubles as the order form, then the quote
 * request. What is being picked differs: these four products are one size
 * each and come in several colours, so the colour is the orderable line.
 *
 * NO LISTING PAGE ABOVE THESE. Each is a single product, so the mega-menu
 * points straight here the same way Mattress Protector does — a listing page
 * holding one card is a click that exists only to be clicked through.
 */

/** Stand-ins. There is no photography for these four yet. */
const IMAGES = [
  { src: "/images/products/towels.jpg", alt: "Stack of folded white towels" },
  { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
];

export function generateStaticParams() {
  return SPA_SALON_PRODUCTS.map((p) => ({ item: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ item: string }>;
}): Promise<Metadata> {
  const { item } = await params;
  const product = getSpaSalonProduct(item);
  if (!product) return { title: "Not found" };

  return {
    title: `${product.name} — Spa Salon`,
    description: `${product.name} at ${product.size}${
      product.weight ? `, ${product.weight}` : ""
    }, in ${product.colours.map((c) => c.colour.toLowerCase()).join(", ")}.`,
    alternates: { canonical: `${SPA_SALON_BASE}/${product.slug}` },
  };
}

export default async function SpaSalonItemPage({
  params,
}: {
  params: Promise<{ item: string }>;
}) {
  const { item } = await params;
  const product = getSpaSalonProduct(item);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}

function ProductDetail({ product }: { product: SpaSalonProduct }) {
  const colours = product.colours.map((c) => ({
    sku: c.sku,
    colour: c.colour,
    hex: swatchColour(c.colour),
  }));

  const facts = [
    { label: "Thread Count", value: product.threadCount },
    { label: "Size", value: product.size },
    { label: "Weight", value: product.weight },
    { label: "Pack", value: `${product.pack} pcs` },
  ].filter((f): f is { label: string; value: string } => Boolean(f.value));

  return (
    <RangeOrderListProvider>
      <main className="bg-background">
        <section className="border-premium/20 border-b">
          <div className="mx-auto w-full max-w-6xl px-5 py-5 sm:px-8">
            <Crumbs label={product.name} />
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
                  Spa Salon
                </p>
                <h1 className="font-heading text-foreground mt-4 text-4xl leading-[1.08] font-semibold text-balance sm:text-5xl">
                  {product.name}
                </h1>

                <p className="text-muted-foreground mt-5 leading-relaxed text-pretty">
                  {product.size}
                  {product.weight ? `, ${product.weight}` : ""}, supplied in{" "}
                  {product.colours.length}{" "}
                  {product.colours.length === 1 ? "colour" : "colours"} with a stock code each.
                  Every figure below comes from our salon sheet.
                </p>
              </Reveal>

              <Reveal variant="fade-up" delay={0.1}>
                <SpaSalonSpecPicker facts={facts} pack={product.pack} colours={colours} />
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
                Written to be read against your tender document. Add the colours you need and the
                quantities, then send the whole list as one request.
              </p>
            </Reveal>

            <div className="mt-10">
              <SpaSalonSpecTable
                productSlug={product.slug}
                pack={product.pack}
                rows={colours}
              />
            </div>
          </div>
        </section>

        {/* ── The rest of the range ────────────────────────────────────────── */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <h2 className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
              The rest of the range
            </h2>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {SPA_SALON_PRODUCTS.filter((p) => p.slug !== product.slug).map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`${SPA_SALON_BASE}/${p.slug}`}
                    className="border-premium/35 text-foreground/80 hover:border-premium hover:text-foreground focus-visible:ring-ring inline-flex rounded-full border px-4 py-2 text-[13.5px] transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    {p.name}
                    <span className="text-muted-foreground ml-2">{p.size}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </RangeOrderListProvider>
  );
}

function Crumbs({ label }: { label: string }) {
  const trail = [
    { label: "Home", href: "/" },
    { label: "Hospitality", href: "/hospitality" },
    { label: "Spa Salon", href: SPA_SALON_BASE },
    { label },
  ];

  return (
    <nav aria-label="Breadcrumb">
      <ol className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-[13px]">
        {trail.map((crumb, i, all) => (
          <li key={crumb.label} className="flex items-center gap-1.5">
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
