import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHospitalityGroup } from "@/lib/hospitality";
import { HospitalityGroupListing } from "@/components/hospitality/HospitalityGroupListing";

export const metadata: Metadata = {
  title: "Bed Linen — Hospitality",
  description:
    "Flat sheets, fitted sheets, pillow cases, duvet covers, mattress protectors and pillow protectors, specified for a commercial laundry cycle.",
  alternates: { canonical: "/hospitality/bed-linen" },
};

/**
 * The Bed Linen range's own top-level page.
 *
 * A LITERAL ROUTE, NOT THE DYNAMIC [group] ONE Bed Linen used to share with
 * every other Hospitality range. Flat Sheets, Fitted Sheets, Pillow Case and
 * Duvet Cover each need a family listing page underneath this one, and
 * Mattress Protector and Pillow Protector need a product detail page
 * underneath it directly — see app/(marketing)/hospitality/bed-linen/[family]/.
 * This exact page still renders the same six-card grid the dynamic route drew
 * before, via the shared component both routes call.
 */
export default function BedLinenPage() {
  const group = getHospitalityGroup("bed-linen");
  if (!group) notFound();

  return <HospitalityGroupListing group={group} />;
}
