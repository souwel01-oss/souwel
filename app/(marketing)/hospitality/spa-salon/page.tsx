import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHospitalityGroup } from "@/lib/hospitality";
import { HospitalityGroupListing } from "@/components/hospitality/HospitalityGroupListing";

export const metadata: Metadata = {
  title: "Spa Salon — Hospitality",
  description:
    "Towelling for the wet areas and the salon floor — salon towels, bath sheets, hair wash and dye towels and spa sheets, with stock codes and colours for each.",
  alternates: { canonical: "/hospitality/spa-salon" },
};

/**
 * The Spa Salon range's own top-level page.
 *
 * A LITERAL ROUTE, NOT THE DYNAMIC [group] ONE, for the same reason Bed Linen
 * has one: four of its lines now have product pages nested underneath this
 * path (see lib/spa-salon.ts), and a literal directory claims the whole path
 * including this exact URL. The grid itself is unchanged — both routes render
 * it through the same shared component.
 */
export default function PoolFitnessSpaSalonPage() {
  const group = getHospitalityGroup("spa-salon");
  if (!group) notFound();

  return <HospitalityGroupListing group={group} />;
}
