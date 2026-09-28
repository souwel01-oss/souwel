import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHospitalityGroup } from "@/lib/hospitality";
import { HospitalityGroupListing } from "@/components/hospitality/HospitalityGroupListing";

export const metadata: Metadata = {
  title: "Food & Beverage — Hospitality",
  description:
    "Bar mops, kitchen towels, flour sacks, glass towels, bistro and mommie napkins, aprons, spun polyester napkins and table cloths — with stock codes, sizes and colours for each.",
  alternates: { canonical: "/hospitality/food-beverage" },
};

/**
 * The Food & Beverage range's own top-level page — the group that used to be
 * called Kitchen Linen, renamed and re-stocked from the client's F&B sheet.
 *
 * A LITERAL ROUTE for the same reason Bed Linen and Spa Salon have one: it
 * needs product pages nested underneath it. The grid itself is unchanged —
 * every group route renders it through the same shared component.
 */
export default function FoodBeveragePage() {
  const group = getHospitalityGroup("food-beverage");
  if (!group) notFound();

  return <HospitalityGroupListing group={group} />;
}
