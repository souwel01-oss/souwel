import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RangeLinePage } from "@/components/catalog/RangeLinePage";
import {
  HEALTH_CARE_BASE,
  HEALTH_CARE_LINES,
  getHealthCareLine,
  healthCareLineHref,
} from "@/lib/health-care";
import { LINE_PHOTOS, STAND_INS } from "@/lib/health-care-photos";

/**
 * One Health-Care line. The page itself is shared with the Commercial range —
 * see components/catalog/RangeLinePage.tsx.
 */

export function generateStaticParams() {
  return HEALTH_CARE_LINES.map((line) => ({ line: line.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ line: string }>;
}): Promise<Metadata> {
  const { line: slug } = await params;
  const line = getHealthCareLine(slug);
  if (!line) return { title: "Not found" };

  return {
    title: `${line.name} — Health-Care`,
    description: line.intro,
    alternates: { canonical: healthCareLineHref(line) },
  };
}

export default async function HealthCareLinePage({
  params,
}: {
  params: Promise<{ line: string }>;
}) {
  const { line: slug } = await params;
  const line = getHealthCareLine(slug);
  if (!line) notFound();

  return (
    <RangeLinePage
      crumbs={[{ label: "Health-Care", href: HEALTH_CARE_BASE }, { label: line.name }]}
      eyebrow="Health-Care"
      line={line}
      href={healthCareLineHref(line)}
      images={LINE_PHOTOS[line.slug] ?? STAND_INS}
      listKind="hc"
      listSlug={line.slug}
      range={{ label: "the Health-Care range", href: HEALTH_CARE_BASE }}
      others={{
        heading: "The rest of the Health-Care range",
        links: HEALTH_CARE_LINES.filter((l) => l.slug !== line.slug).map((l) => ({
          name: l.name,
          href: healthCareLineHref(l),
          alert: l.alert,
        })),
      }}
    />
  );
}
