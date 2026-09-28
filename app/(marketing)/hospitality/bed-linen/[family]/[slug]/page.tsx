import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BED_LINEN_PRODUCTS,
  bedSizesCovered,
  getBedLinenFamily,
  getBedLinenProduct,
} from "@/lib/bed-linen";
import { ProductDetail } from "@/components/hospitality/BedLinenProductDetail";

/**
 * A single product's detail page within a multi-member Bed Linen family —
 * one of the four Flat Sheets, three Fitted Sheets, four Pillow Case or
 * three Duvet Cover rows. Mattress Protector and Pillow Protector never
 * reach this route: their family has one member, so
 * app/(marketing)/hospitality/bed-linen/[family]/page.tsx renders their
 * detail page directly instead of a listing.
 */

export function generateStaticParams() {
  // Only products in a multi-member family get a page here — a single-member
  // family's product is rendered at .../[family]/ directly (see that route).
  return BED_LINEN_PRODUCTS.filter((p) => getBedLinenFamily(p.family).length > 1).map((p) => ({
    family: p.family,
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getBedLinenProduct(slug);
  if (!product) return { title: "Not found" };

  return {
    title: `${product.name} — Bed Linen`,
    description: `${product.name}${product.blend ? ` in ${product.blend}` : ""}${
      product.hem ? ` with a ${product.hem.toLowerCase()} hem` : ""
    }, made in ${bedSizesCovered(product)
      .map((s) => s.toLowerCase())
      .join(", ")}.`,
    alternates: { canonical: `/hospitality/bed-linen/${product.family}/${product.slug}` },
  };
}

export default async function BedLinenProductPage({
  params,
}: {
  params: Promise<{ family: string; slug: string }>;
}) {
  const { family, slug } = await params;
  const product = getBedLinenProduct(slug);
  if (!product || product.family !== family) notFound();

  return <ProductDetail product={product} />;
}
