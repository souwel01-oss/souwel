import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  BATH_MAT_NOTE,
  TERRY_BASE,
  TERRY_PRODUCTS,
  getTerryFamily,
  getTerryProduct,
  hasBathMat,
  terryCardSummary,
  terryCaseStep,
  terryFamiliesNeedingChooser,
  terrySizeNames,
  type TerryProduct,
} from "@/lib/terry-towels";
import { CARD_SHOTS, terryPhotos } from "@/lib/hospitality-photos";
import { ProductCard, type HospitalityCardProduct } from "@/components/hospitality/ProductCard";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { TerrySpecPicker } from "@/components/hospitality/TerrySpecPicker";
import { TerrySpecTable } from "@/components/hospitality/TerrySpecTable";
import { SPEC_SECTION_ID, RangeOrderListProvider } from "@/components/hospitality/RangeOrderList";
import { Reveal } from "@/components/animation/Reveal";

/**
 * One segment, two kinds of page.
 *
 * `/hospitality/terry-towels/classic-terry-towels`      → the CHOOSER
 * `/hospitality/terry-towels/classic-terry-towels-100-cotton` → the DETAIL page
 *
 * They share a route because they answer the same question — "which towel?" —
 * at two levels of the same range, and splitting them into a static folder per
 * family would hard-code "classic-terry-towels" into the file tree. A second
 * duplicated name on the client's sheet then works with no new files: it gets a
 * chooser the moment two products share a `family`.
 */

export function generateStaticParams() {
  return [
    ...TERRY_PRODUCTS.map((p) => ({ item: p.slug })),
    ...terryFamiliesNeedingChooser().map((family) => ({ item: family })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ item: string }>;
}): Promise<Metadata> {
  const { item } = await params;

  const family = terryFamiliesNeedingChooser().includes(item) ? getTerryFamily(item) : null;
  if (family?.length) {
    return {
      title: `${family[0].name} — Terry Towels`,
      description: `${family[0].name} in ${family.map((p) => p.blend).join(" and ")}. Choose the blend to see sizes and weights.`,
      alternates: { canonical: `${TERRY_BASE}/${item}` },
    };
  }

  const product = getTerryProduct(item);
  if (!product) return { title: "Not found" };

  return {
    title: `${product.name} — ${product.blend}`,
    description: `${product.name} in ${product.blend} with a ${product.hem.toLowerCase()} hem, made in ${terrySizeNames(
      product
    )
      .map((s) => s.toLowerCase())
      .join(", ")}.`,
    alternates: { canonical: `${TERRY_BASE}/${product.slug}` },
  };
}

export default async function TerryItemPage({ params }: { params: Promise<{ item: string }> }) {
  const { item } = await params;

  if (terryFamiliesNeedingChooser().includes(item)) {
    return <FamilyChooser family={getTerryFamily(item)} />;
  }

  const product = getTerryProduct(item);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}

/* ─────────────────────────────────────────────────────────────────────────────
   The chooser
   ────────────────────────────────────────────────────────────────────────── */

/**
 * Two products, one name.
 *
 * The whole job of this page is to make the blend impossible to miss, so it is
 * printed twice: once in the card's summary line and once as a heading above
 * each card. On the range listing the two cards sit among five others and the
 * shared name reads as a duplicate; here they sit side by side, which is what
 * turns it into a choice.
 */
function FamilyChooser({ family }: { family: TerryProduct[] }) {
  const name = family[0].name;

  return (
    <main className="bg-background">
      <section className="border-premium/20 border-b">
        <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-12 sm:px-8 sm:pt-14 sm:pb-16">
          <Crumbs trail={[{ label: name }]} />

          <Reveal variant="fade-up">
            <h1 className="font-heading text-foreground mt-6 max-w-3xl text-3xl leading-[1.1] font-semibold text-balance sm:text-4xl lg:text-5xl">
              {name}
            </h1>
            <p className="text-muted-foreground mt-5 max-w-2xl text-[15.5px] leading-relaxed text-pretty">
              {name} is made in {family.length} blends. They share a name and a{" "}
              {family[0].hem.toLowerCase()} hem, and differ in what they are woven from — which
              changes the weight, the handle and how they come out of a commercial wash. Pick the
              blend to see its sizes.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <Reveal
            variant="fade-up"
            stagger
            className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2"
          >
            {family.map((product) => (
              <div key={product.slug}>
                {/* The blend as a heading above the card, not only inside it.
                    Two identical card titles side by side read as a rendering
                    fault until something tells you which is which. */}
                <p className="text-accent-gold mb-3 text-[11px] font-semibold tracking-[0.16em] uppercase">
                  {product.blend}
                </p>
                <ProductCard product={toDetailCard(product)} />
              </div>
            ))}
          </Reveal>
        </div>
      </section>
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   The detail page
   ────────────────────────────────────────────────────────────────────────── */

function ProductDetail({ product }: { product: TerryProduct }) {
  const images = terryPhotos(product.slug);
  const sizes = product.lines;
  const siblings = getTerryFamily(product.family);
  const hasChooser = siblings.length > 1;

  return (
    // Provider around both interactive sections, so the picker in the hero and
    // the table further down share one list. The prose and the gallery inside
    // it stay server-rendered — a provider does not pull its children into the
    // client bundle.
    <RangeOrderListProvider
      product={{
        kind: "terry",
        slug: product.slug,
        // The blend is part of the name here and nowhere else on the page:
        // two products are both "Classic Terry Towels", and in the quote list
        // there is no heading above the row to say which one this is.
        name: `${product.name} (${product.blend})`,
        image: images[0].src,
        // Straight to this construction, not through terryProductHref — that
        // sends a shared name to its chooser, and the buyer has chosen.
        href: `${TERRY_BASE}/${product.slug}`,
      }}
      lineMeta={sizes.map((line) => ({
        sku: line.sku,
        // The unit in the label: the drawer shows the bare number.
        label: `${line.name} ${line.dimensions}, in dozens`,
        step: terryCaseStep(line),
      }))}
    >
      <main className="bg-background">
        <section className="border-premium/20 border-b">
          <div className="mx-auto w-full max-w-6xl px-5 py-5 sm:px-8">
            <Crumbs
              trail={[
                ...(hasChooser
                  ? [{ label: product.name, href: `${TERRY_BASE}/${product.family}` }]
                  : []),
                { label: hasChooser ? product.blend : product.name },
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
                  Terry Towels
                </p>
                <h1 className="font-heading text-foreground mt-4 text-4xl leading-[1.08] font-semibold text-balance sm:text-5xl">
                  {product.name}
                </h1>
                {/* The blend sits directly under the name on every one of these
                  pages, not only the two that share a name. It is the first
                  thing on the client's sheet after the product itself. */}
                <p className="text-accent-gold mt-3 text-[13px] font-semibold tracking-[0.14em] uppercase">
                  {product.blend}
                </p>

                <p className="text-muted-foreground mt-5 leading-relaxed text-pretty">
                  Woven in {product.blend.toLowerCase()} with a {product.hem.toLowerCase()} hem, and
                  made in {sizes.length} {sizes.length === 1 ? "size" : "sizes"}. Every figure below
                  comes from our towel sheet.
                </p>
              </Reveal>

              <Reveal variant="fade-up" delay={0.1}>
                <TerrySpecPicker
                  blend={product.blend}
                  hem={product.hem}
                  note={hasBathMat(product) ? BATH_MAT_NOTE : undefined}
                  sizes={sizes.map(({ sku, name, dimensions, weight, weightPer, dozenPerCase }) => ({
                    sku,
                    name,
                    dimensions,
                    weight,
                    weightPer,
                    dozenPerCase,
                  }))}
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
                Written to be read against your tender document. Add the sizes you need and the
                quantities, then send the whole list as one request.
              </p>
            </Reveal>

            <div className="mt-10">
              <TerrySpecTable
                productSlug={product.slug}
                rows={sizes.map(({ sku, name, dimensions, weight, weightPer, dozenPerCase }) => ({
                  sku,
                  name,
                  dimensions,
                  weight,
                  weightPer,
                  dozenPerCase,
                }))}
              />
            </div>
          </div>
        </section>

        {/* ── The rest of the range ────────────────────────────────────────── */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <h2 className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
              {hasChooser ? "The other blend" : "Other terry constructions"}
            </h2>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {(hasChooser ? siblings : TERRY_PRODUCTS)
                .filter((p) => p.slug !== product.slug)
                .map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`${TERRY_BASE}/${p.slug}`}
                      className="border-premium/35 text-foreground/80 hover:border-premium hover:text-foreground focus-visible:ring-ring inline-flex rounded-full border px-4 py-2 text-[13.5px] transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    >
                      {p.name}
                      <span className="text-muted-foreground ml-2">{p.blend}</span>
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

/* ─────────────────────────────────────────────────────────────────────────── */

function Crumbs({ trail }: { trail: { label: string; href?: string }[] }) {
  const fixed = [
    { label: "Home", href: "/" },
    { label: "Hospitality", href: "/hospitality" },
    { label: "Bath Linen", href: "/hospitality/bath-linen" },
    { label: "Terry Towels", href: TERRY_BASE },
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

/** A card that points straight at the product's own page, chooser or not. */
function toDetailCard(product: TerryProduct): HospitalityCardProduct {
  const href = `${TERRY_BASE}/${product.slug}`;
  return {
    id: product.slug,
    name: product.name,
    href,
    quoteHref: href,
    ctaLabel: "View details",
    material: terryCardSummary(product),
    colours: [],
    images: terryPhotos(product.slug).slice(0, CARD_SHOTS),
    badge: null,
    rating: null,
  };
}
