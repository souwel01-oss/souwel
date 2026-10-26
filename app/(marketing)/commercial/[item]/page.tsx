import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RangeLinePage } from "@/components/catalog/RangeLinePage";
import {
  COMMERCIAL_BASE,
  COMMERCIAL_ITEMS,
  commercialItemHref,
  getCommercialItem,
} from "@/lib/commercial";
import { LINE_PHOTOS, STAND_INS } from "@/lib/commercial-photos";

/**
 * One Commercial line. The page itself is shared with the Health-Care range —
 * see components/catalog/RangeLinePage.tsx. Institutional Laundry's two lines
 * are links to the other ranges and have no page here.
 */

export function generateStaticParams() {
  return COMMERCIAL_ITEMS.map(({ item }) => ({ item: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ item: string }>;
}): Promise<Metadata> {
  const { item: slug } = await params;
  const entry = getCommercialItem(slug);
  if (!entry) return { title: "Not found" };

  return {
    title: `${entry.item.name} — ${entry.group.title}`,
    description: entry.item.intro,
    alternates: { canonical: commercialItemHref(entry.item) },
  };
}

export default async function CommercialItemPage({
  params,
}: {
  params: Promise<{ item: string }>;
}) {
  const { item: slug } = await params;
  const entry = getCommercialItem(slug);
  if (!entry) notFound();
  const { group, item } = entry;

  return (
    <RangeLinePage
      // The group crumb lands on this line's own section of the range page.
      crumbs={[
        { label: "Commercial", href: COMMERCIAL_BASE },
        { label: group.title, href: `${COMMERCIAL_BASE}#${group.slug}` },
        { label: item.name },
      ]}
      eyebrow={group.title}
      line={item}
      href={commercialItemHref(item)}
      images={LINE_PHOTOS[item.slug] ?? STAND_INS}
      listKind="com"
      listSlug={item.slug}
      range={{ label: "the Commercial range", href: COMMERCIAL_BASE }}
      others={{
        heading: "The rest of the Commercial range",
        links: COMMERCIAL_ITEMS.filter((e) => e.item.slug !== item.slug).map((e) => ({
          name: e.item.name,
          href: commercialItemHref(e.item),
        })),
      }}
    />
  );
}
