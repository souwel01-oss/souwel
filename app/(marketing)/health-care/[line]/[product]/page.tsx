import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HEALTH_CARE_BASE, getHealthCareLine, healthCareLineHref } from "@/lib/health-care";
import {
  HEALTH_CARE_PRODUCTS,
  getHealthCareProduct,
  healthCareProductHref,
  healthCareProducts,
} from "@/lib/health-care-sheet";
import { healthCareProductShots } from "@/lib/health-care-photos";
import { SheetProductDetail } from "@/components/hospitality/SheetProductDetail";

/**
 * A Health-Care product page: one row of the client's category sheet. The page
 * itself is components/hospitality/SheetProductDetail.tsx, shared with Economy
 * bath towels.
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

  return (
    <SheetProductDetail
      product={product}
      images={healthCareProductShots(category.slug, product.slug)}
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Health-Care", href: HEALTH_CARE_BASE },
        { label: category.name, href: healthCareLineHref(category) },
        { label: product.name },
      ]}
      eyebrow={category.name}
      alertEyebrow={category.alert}
      href={healthCareProductHref(category.slug, product)}
      rangeHref={healthCareLineHref(category)}
      sourceName="Health-Care sheet"
      moreHeading={`More in ${category.name}`}
      siblings={healthCareProducts(category.slug)
        .filter((p) => p.slug !== product.slug)
        .map((p) => ({ name: p.name, href: healthCareProductHref(category.slug, p) }))}
    />
  );
}
