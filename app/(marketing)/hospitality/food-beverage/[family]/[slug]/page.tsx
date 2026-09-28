import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FB_BASE, FB_PRODUCTS, getFbFamily, getFbProduct } from "@/lib/food-beverage";
import { ProductDetail } from "@/components/hospitality/FoodBevProductDetail";

/**
 * One build of a multi-build Food & Beverage family — a bar mop construction
 * or an apron build. The seven single-build families never reach this route:
 * their family page renders their detail page directly instead of a listing.
 */

export function generateStaticParams() {
  return FB_PRODUCTS.filter((p) => getFbFamily(p.family).length > 1).map((p) => ({
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
  const product = getFbProduct(slug);
  if (!product) return { title: "Not found" };

  return {
    title: `${product.name} — Food & Beverage`,
    description: `${product.name} in ${product.blend}${
      product.weight ? ` at ${product.weight}` : ""
    }, in ${product.colours.map((c) => c.toLowerCase()).join(", ")}.`,
    alternates: { canonical: `${FB_BASE}/${product.family}/${product.slug}` },
  };
}

export default async function FbProductPage({
  params,
}: {
  params: Promise<{ family: string; slug: string }>;
}) {
  const { family, slug } = await params;
  const product = getFbProduct(slug);
  if (!product || product.family !== family) notFound();

  return <ProductDetail product={product} />;
}
