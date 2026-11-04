import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  HEALTH_CARE_BASE,
  getHealthCareLine,
  healthCareLineHref,
} from "@/lib/health-care";
import {
  HEALTH_CARE_PRODUCTS,
  getHealthCareProduct,
  healthCareProductHref,
  healthCareProducts,
  healthCareStep,
  healthCareUnit,
} from "@/lib/health-care-sheet";
import { healthCareProductShots } from "@/lib/health-care-photos";
import { swatchColour } from "@/lib/hospitality";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { SpaSalonSpecPicker } from "@/components/hospitality/SpaSalonSpecPicker";
import { SpaSalonSpecTable } from "@/components/hospitality/SpaSalonSpecTable";
import { SPEC_SECTION_ID, RangeOrderListProvider } from "@/components/hospitality/RangeOrderList";
import { Reveal } from "@/components/animation/Reveal";

/**
 * A Health-Care product page: one row of the client's category sheet.
 *
 * The same shape as the Spa Salon product page, whose picker and table it
 * reuses: a hero with a picker, then a specification table that doubles as the
 * order form. What is picked is whatever the sheet gives a code for: a weight,
 * a size, a shade or a design.
 *
 * THE GALLERY IS THE PRODUCT'S where the shoot has a folder for it, else its
 * category's. See HEALTH_CARE_SHEET_PHOTOS in lib/health-care-photos.ts.
 */

export function generateStaticParams() {
  return Object.entries(HEALTH_CARE_PRODUCTS).flatMap(([line, list]) =>
    list.map((p) => ({ line, product: p.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ line: string; product: string }>;
}): Promise<Metadata> {
  const { line, product: slug } = await params;
  const category = getHealthCareLine(line);
  const product = getHealthCareProduct(line, slug);
  if (!category || !product) return { title: "Not found" };

  return {
    title: `${product.name} — ${category.name}`,
    description: `${product.name}${product.blend ? `, ${product.blend}` : ""}, with stock codes${
      product.packing ? ` and ${product.packing.toLowerCase()} packing` : ""
    }.`,
    alternates: { canonical: healthCareProductHref(line, product) },
  };
}

export default async function HealthCareProductPage({
  params,
}: {
  params: Promise<{ line: string; product: string }>;
}) {
  const { line, product: slug } = await params;
  const category = getHealthCareLine(line);
  const product = getHealthCareProduct(line, slug);
  if (!category || !product) notFound();

  const images = healthCareProductShots(category.slug, product.slug);
  const step = healthCareStep(product);
  const unit = healthCareUnit(product);
  const noun = product.variantLabel.toLowerCase();
  const isColour = product.variantLabel === "Colour";
  const options = product.variants.map((v) => ({
    sku: v.sku,
    colour: v.label,
    ...(isColour ? { hex: swatchColour(v.label) } : {}),
  }));

  const facts = [
    product.blend ? { label: "Blend", value: product.blend } : null,
    ...product.facts,
    product.packing ? { label: "Packing", value: product.packing } : null,
  ].filter((f): f is { label: string; value: string } => Boolean(f));

  const siblings = healthCareProducts(category.slug).filter((p) => p.slug !== product.slug);

  return (
    <RangeOrderListProvider
      product={{
        kind: "hcp",
        slug: product.slug,
        name: product.name,
        image: images[0].src,
        href: healthCareProductHref(category.slug, product),
      }}
      lineMeta={product.variants.map((v) => ({ sku: v.sku, label: v.label, step }))}
    >
      <main className="bg-background">
        <section className="border-premium/20 border-b">
          <div className="mx-auto w-full max-w-6xl px-5 py-5 sm:px-8">
            <nav aria-label="Breadcrumb">
              <ol className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-[13px]">
                {[
                  { label: "Home", href: "/" },
                  { label: "Health-Care", href: HEALTH_CARE_BASE },
                  { label: category.name, href: healthCareLineHref(category) },
                  { label: product.name, href: undefined },
                ].map((crumb, i, all) => (
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
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-14">
            <Reveal variant="fade-up">
              <ProductGallery images={images} />
            </Reveal>

            <div className="flex flex-col justify-center">
              <Reveal variant="fade-up">
                <p
                  className={`text-xs font-semibold tracking-[0.22em] uppercase ${
                    category.alert ? "text-destructive" : "text-premium"
                  }`}
                >
                  {category.name}
                </p>
                <h1 className="font-heading text-foreground mt-4 text-4xl leading-[1.08] font-semibold text-balance sm:text-5xl">
                  {product.name}
                </h1>
                <p className="text-muted-foreground mt-5 leading-relaxed text-pretty">
                  {product.variants.length === 1
                    ? "One stock code, taken from our Health-Care sheet."
                    : `${product.variants.length} stock codes, one for each ${noun}. Every figure below comes from our Health-Care sheet.`}
                </p>
              </Reveal>

              <Reveal variant="fade-up" delay={0.1}>
                <SpaSalonSpecPicker
                  facts={facts}
                  pack={step}
                  colours={options}
                  noun={noun}
                  unit={unit}
                />
              </Reveal>
            </div>
          </div>
        </section>

        <section
          id={SPEC_SECTION_ID}
          className="bg-platinum/25 border-premium/20 scroll-mt-24 border-y py-14 sm:py-20"
        >
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <Reveal variant="fade-up">
              <h2 className="font-heading text-3xl font-semibold sm:text-4xl">Specification</h2>
              <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
                Written to be read against your tender document. Add the quantities you need, then
                send the whole list as one request.
              </p>
            </Reveal>

            <div className="mt-10">
              <SpaSalonSpecTable
                productSlug={product.slug}
                pack={step}
                rows={options}
                noun={noun}
                unit={unit}
                quoteParam="hcp"
                rangeHref={healthCareLineHref(category)}
              />
            </div>
          </div>
        </section>

        {siblings.length > 0 ? (
          <section className="py-12 sm:py-16">
            <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
              <h2 className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
                More in {category.name}
              </h2>
              <ul className="mt-5 flex flex-wrap gap-2.5">
                {siblings.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={healthCareProductHref(category.slug, p)}
                      className="border-premium/35 text-foreground/80 hover:border-premium hover:text-foreground focus-visible:ring-ring inline-flex rounded-full border px-4 py-2 text-[13.5px] transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    >
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </main>
    </RangeOrderListProvider>
  );
}
