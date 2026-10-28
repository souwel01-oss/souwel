import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RangeLinePage } from "@/components/catalog/RangeLinePage";
import {
  HOSPITALITY_ENQUIRY_LINES,
  hospitalityItemHref,
  type HospitalityGroup,
  type HospitalityItem,
} from "@/lib/hospitality";
import { LINE_PHOTOS } from "@/lib/hospitality-photos";

/**
 * One Hospitality line that is on neither a range nor the product sheet:
 * Bath robes, Economy bath towels and the two napkins in Table Linen.
 *
 * The page is the shared catalogue page, so it has the same shape as Bath
 * mats next to it. With no rows to show it asks only for a quantity and says
 * "Specification on request". Lines with a range or a product page never
 * reach here; see hospitalityItemHref.
 */

export function generateStaticParams() {
  return HOSPITALITY_ENQUIRY_LINES.map(({ group, item }) => ({
    group: group.slug,
    item: item.slug,
  }));
}

function findLine(groupSlug: string, itemSlug: string) {
  return HOSPITALITY_ENQUIRY_LINES.find(
    ({ group, item }) => group.slug === groupSlug && item.slug === itemSlug
  );
}

function introFor(item: HospitalityItem) {
  return (
    item.intro ??
    `${item.name}. This line is not on our published specification sheet yet, so construction and sizes are confirmed with your quotation.`
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ group: string; item: string }>;
}): Promise<Metadata> {
  const { group, item } = await params;
  const line = findLine(group, item);
  if (!line) return { title: "Not found" };

  return {
    title: `${line.item.name} — ${line.group.title}`,
    description: introFor(line.item),
    alternates: { canonical: hospitalityItemHref(line.group, line.item) },
  };
}

export default async function HospitalityLinePage({
  params,
}: {
  params: Promise<{ group: string; item: string }>;
}) {
  const { group: groupSlug, item: itemSlug } = await params;
  const line = findLine(groupSlug, itemSlug);
  if (!line) notFound();

  const { group, item } = line;
  const groupHref = `/hospitality/${group.slug}`;

  return (
    <RangeLinePage
      crumbs={[
        { label: "Hospitality", href: "/hospitality" },
        { label: group.title, href: groupHref },
        { label: item.name },
      ]}
      eyebrow={group.title}
      line={{ name: item.name, intro: introFor(item), productSlugs: [] }}
      href={hospitalityItemHref(group, item)}
      images={LINE_PHOTOS[item.slug] ?? group.fallbackImages}
      listKind="cat"
      listSlug={item.slug}
      range={{ label: `the ${group.title} range`, href: groupHref }}
      others={{
        heading: `The rest of ${group.title}`,
        links: otherLines(group, item),
      }}
    />
  );
}

function otherLines(group: HospitalityGroup, current: HospitalityItem) {
  return group.items
    .filter((item) => item.slug !== current.slug)
    .map((item) => ({ name: item.name, href: hospitalityItemHref(group, item) }));
}
