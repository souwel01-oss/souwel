import { plainName } from "@/lib/display-name";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { RangeLinePage } from "@/components/catalog/RangeLinePage";
import {
  HOSPITALITY_ENQUIRY_LINES,
  getHospitalityGroup,
  hospitalityItemHref,
  type HospitalityGroup,
  type HospitalityItem,
} from "@/lib/hospitality";
import { CARD_SHOTS, LINE_PHOTOS } from "@/lib/hospitality-photos";
import { healthCareCardSummary } from "@/lib/health-care-sheet";
import {
  SHEET_LINES,
  getSheetLine,
  sheetLineProductHref,
  type SheetLine,
} from "@/lib/hospitality-sheet-lines";
import { ProductCard, type HospitalityCardProduct } from "@/components/hospitality/ProductCard";
import { Reveal } from "@/components/animation/Reveal";
import { RangeQuotePrompt } from "@/components/marketing/RangeQuotePrompt";

/**
 * One Hospitality line that has no page of its own elsewhere.
 *
 * TWO KINDS, TOLD APART BY THE URL:
 *
 *   - Lines that are on neither a range nor the product sheet (the two napkins
 *     in Table Linen) are enquiries: the shared catalogue page, which asks only
 *     for a quantity and says "Specification on request".
 *   - Economy bath towels and Bath robes are lines of the client's own sheets.
 *     They open a page of product cards, each with a page of its own; see
 *     lib/hospitality-sheet-lines.ts.
 */

export function generateStaticParams() {
  return [
    ...HOSPITALITY_ENQUIRY_LINES.map(({ group, item }) => ({
      group: group.slug,
      item: item.slug,
    })),
    ...SHEET_LINES.map((l) => ({ group: l.group, item: l.item })),
  ];
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
  const sheet = getSheetLine(group, item);
  if (sheet) {
    return {
      title: `${sheet.name} — ${getHospitalityGroup(group)?.title ?? "Hospitality"}`,
      description: sheet.description,
      alternates: { canonical: sheet.base },
    };
  }
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
  const sheet = getSheetLine(groupSlug, itemSlug);
  if (sheet) return <SheetLineListing line={sheet} />;

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

/** A line of the client's own sheet: one card per product on it. */
function SheetLineListing({ line }: { line: SheetLine }) {
  const group = getHospitalityGroup(line.group);
  const cards: HospitalityCardProduct[] = line.products.map((product) => {
    const href = sheetLineProductHref(line, product);
    return {
      id: product.slug,
      name: plainName(product.name, product.blend),
      href,
      quoteHref: href,
      ctaLabel: "View details",
      material: healthCareCardSummary(product) || null,
      colours: [],
      images: line.shots(product).slice(0, CARD_SHOTS),
      badge: null,
      rating: null,
    };
  });

  return (
    <main className="bg-background">
      <section className="border-premium/20 border-b">
        <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-12 sm:px-8 sm:pt-14 sm:pb-14">
          <nav aria-label="Breadcrumb">
            <ol className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-[13px]">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <ChevronRight aria-hidden className="size-3.5 shrink-0" />
              <li>
                <Link href="/hospitality" className="hover:text-foreground transition-colors">
                  Hospitality
                </Link>
              </li>
              <ChevronRight aria-hidden className="size-3.5 shrink-0" />
              <li>
                <Link
                  href={`/hospitality/${line.group}`}
                  className="hover:text-foreground transition-colors"
                >
                  {group?.title ?? "Bath Linen"}
                </Link>
              </li>
              <ChevronRight aria-hidden className="size-3.5 shrink-0" />
              <li className="text-foreground font-medium">{line.name}</li>
            </ol>
          </nav>

          <Reveal variant="fade-up">
            <h1 className="font-heading text-foreground mt-6 max-w-3xl text-3xl leading-[1.1] font-semibold text-balance sm:text-4xl lg:text-5xl">
              {line.name}
            </h1>
            <p className="text-muted-foreground mt-5 max-w-2xl text-[15.5px] leading-relaxed text-pretty">
              {line.intro}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cards.map((card) => (
              <ProductCard key={card.id} product={card} />
            ))}
          </div>
        </div>
      </section>

      <RangeQuotePrompt />
    </main>
  );
}
