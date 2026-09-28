import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HOSPITALITY_GROUPS, getHospitalityGroup } from "@/lib/hospitality";
import { HospitalityGroupListing } from "@/components/hospitality/HospitalityGroupListing";

/**
 * Product listing page for every Hospitality range that does not have a
 * literal route of its own.
 *
 * TWO GROUPS DO. Bed Linen needs family listing pages and product detail
 * pages nested under it (lib/bed-linen.ts); Pool, Fitness, Spa & Salon needs
 * product detail pages (lib/spa-salon.ts). A literal directory shadows this
 * dynamic [group] sibling for its whole path, INCLUDING the bare
 * "/hospitality/<slug>" URL, so each of those has its own page.tsx and is
 * excluded here — generating one from both places would be two pages claiming
 * the same route. The rendering is shared either way:
 * components/hospitality/HospitalityGroupListing.tsx is what all three call.
 */
const OWN_ROUTE = new Set(["bed-linen", "pool-fitness-spa-salon"]);

export function generateStaticParams() {
  return HOSPITALITY_GROUPS.filter((g) => !OWN_ROUTE.has(g.slug)).map((g) => ({ group: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ group: string }>;
}): Promise<Metadata> {
  const { group: slug } = await params;
  const group = OWN_ROUTE.has(slug) ? undefined : getHospitalityGroup(slug);
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
  // The two groups above are served by their own literal routes now; this
  // dynamic segment should never actually be asked for them, but notFound()
  // rather than rendering one twice if it ever is.
  const group = OWN_ROUTE.has(slug) ? undefined : getHospitalityGroup(slug);
  if (!group) notFound();

  return <HospitalityGroupListing group={group} />;
}
