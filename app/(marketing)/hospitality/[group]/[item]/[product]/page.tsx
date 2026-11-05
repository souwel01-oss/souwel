import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHospitalityGroup } from "@/lib/hospitality";
import {
  SHEET_LINES,
  getSheetLine,
  sheetLineProductHref,
} from "@/lib/hospitality-sheet-lines";
import { SheetProductDetail } from "@/components/hospitality/SheetProductDetail";

/**
 * A product page under a Hospitality line of the client's own sheet: Economy
 * bath towels and Bath robes, at /hospitality/<group>/<line>/<product>.
 * Anything else on this route is a 404. The page itself is shared with
 * Health-Care, see components/hospitality/SheetProductDetail.tsx, and the lines
 * are listed in lib/hospitality-sheet-lines.ts.
 */

export function generateStaticParams() {
  return SHEET_LINES.flatMap((l) =>
    l.products.map((p) => ({ group: l.group, item: l.item, product: p.slug }))
  );
}

function find(group: string, item: string, slug: string) {
  const line = getSheetLine(group, item);
  const product = line?.products.find((p) => p.slug === slug);
  return line && product ? { line, product } : undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ group: string; item: string; product: string }>;
}): Promise<Metadata> {
  const { group, item, product: slug } = await params;
  const found = find(group, item, slug);
  if (!found) return { title: "Not found" };
  const { line, product } = found;

  return {
    title: `${product.name} — ${line.name}`,
    description: `${product.name}${product.blend ? `, ${product.blend}` : ""}, with its stock code${
      product.variants.length > 1 ? "s" : ""
    }.`,
    alternates: { canonical: sheetLineProductHref(line, product) },
  };
}

export default async function SheetLineProductPage({
  params,
}: {
  params: Promise<{ group: string; item: string; product: string }>;
}) {
  const { group, item, product: slug } = await params;
  const found = find(group, item, slug);
  if (!found) notFound();
  const { line, product } = found;
  const groupTitle = getHospitalityGroup(line.group)?.title ?? "Bath Linen";

  return (
    <SheetProductDetail
      product={product}
      images={line.shots(product)}
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Hospitality", href: "/hospitality" },
        { label: groupTitle, href: `/hospitality/${line.group}` },
        { label: line.name, href: line.base },
        { label: product.name },
      ]}
      eyebrow={line.name}
      href={sheetLineProductHref(line, product)}
      rangeHref={line.base}
      sourceName={line.sourceName}
      moreHeading={`More in ${line.name}`}
      siblings={line.products
        .filter((p) => p.slug !== product.slug)
        .map((p) => ({ name: p.name, href: sheetLineProductHref(line, p) }))}
    />
  );
}
