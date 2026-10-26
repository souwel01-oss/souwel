import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RangeLinePage } from "@/components/catalog/RangeLinePage";
import { PRODUCTS, getProduct } from "@/lib/product-data";
import { CATEGORIES, categoryHref } from "@/lib/site-config";

/**
 * Product detail page (FR-008).
 *
 * THIS IS NOT A SHOP PAGE. There is no price, no stock figure and nothing to
 * pay for. A textile buyer checks whether the build matches their
 * specification, picks the rows they need with a quantity each, and asks for
 * a quote.
 *
 * The page itself is the shared catalogue page in
 * components/catalog/RangeLinePage.tsx. It has the same shape as every
 * Hospitality product page, so ordering works the same everywhere on the site.
 */

export function generateStaticParams() {
  return Object.keys(PRODUCTS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} — Souwel`,
      description: product.shortDescription,
      images: [{ url: product.heroImageUrl }],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = CATEGORIES.find((c) => c.slug === product.categorySlug);
  const categoryName = category?.name ?? "Catalog";
  const rangeHref = categoryHref(product.categorySlug);

  return (
    <RangeLinePage
      crumbs={[{ label: categoryName, href: rangeHref }, { label: product.name }]}
      eyebrow={categoryName}
      line={{ name: product.name, intro: product.description, productSlugs: [product.slug] }}
      href={`/products/${product.slug}`}
      images={product.galleryImageUrls}
      listKind="cat"
      listSlug={product.slug}
      range={{ label: `the ${categoryName} range`, href: rangeHref }}
      others={{
        heading: `More from ${categoryName}`,
        links: Object.values(PRODUCTS)
          .filter((p) => p.categorySlug === product.categorySlug && p.slug !== product.slug)
          .map((p) => ({ name: p.name, href: `/products/${p.slug}` })),
      }}
    />
  );
}
