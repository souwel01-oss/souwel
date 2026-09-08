import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HOSPITALITY_GROUPS, getHospitalityGroup } from "@/lib/hospitality";
import { HospitalityGroupListing } from "@/components/hospitality/HospitalityGroupListing";

/**
 * Product listing page for every Hospitality range EXCEPT Bed Linen.
 *
 * BED LINEN HAS ITS OWN LITERAL ROUTE, app/(marketing)/hospitality/bed-linen/,
 * because it needs a family listing page and product detail pages nested
 * under it (see lib/bed-linen.ts). A literal directory shadows this dynamic
 * [group] sibling for its whole path, including the bare "/hospitality/
 * bed-linen" URL, so "bed-linen" is excluded from generateStaticParams here —
 * generating it from both places would be two pages claiming the same route.
 * The actual rendering is shared: components/hospitality/HospitalityGroupListing.tsx
 * is what both routes call.
 */
export function generateStaticParams() {
  return HOSPITALITY_GROUPS.filter((g) => g.slug !== "bed-linen").map((g) => ({ group: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ group: string }>;
}): Promise<Metadata> {
  const { group: slug } = await params;
  const group = slug !== "bed-linen" ? getHospitalityGroup(slug) : undefined;
  if (!group) return { title: "Not found" };

  return {
    title: `${group.title} — Hospitality`,
    description: group.description,
    alternates: { canonical: `/hospitality/${group.slug}` },
  };
}

export default async function HospitalityListingPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group: slug } = await params;
  // Bed Linen is served by the literal route now; this dynamic segment
  // should never actually be asked for it, but notFound() rather than
  // rendering it twice if it ever is.
  const group = slug !== "bed-linen" ? getHospitalityGroup(slug) : undefined;
  if (!group) notFound();

  return <HospitalityGroupListing group={group} />;
}
