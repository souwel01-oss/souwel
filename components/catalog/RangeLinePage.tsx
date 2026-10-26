import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Reveal } from "@/components/animation/Reveal";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { CatalogueSpecPicker } from "@/components/catalog/CatalogueSpecPicker";
import { CatalogueSpecTable } from "@/components/catalog/CatalogueSpecTable";
import { CatalogueEnquiryPanel } from "@/components/catalog/CatalogueEnquiryPanel";
import { RangeOrderListProvider, SPEC_SECTION_ID } from "@/components/hospitality/RangeOrderList";
import type { Shot } from "@/lib/hospitality-photos";
import { orderSpec } from "@/lib/catalogue-lines";

/**
 * One product page for the catalogue, shared by /products/[slug], the
 * Health-Care lines and the Commercial lines.
 *
 * THE SAME SHAPE AS EVERY HOSPITALITY PRODUCT PAGE, on purpose. The Terry
 * Towels page is the reference, and Bed Linen, Food & Beverage and Spa Salon
 * already follow it. Each has a gallery and a "Build your request" panel at
 * the top, then the specification table, which is also the order form, then
 * the rest of the range. A buyer who has ordered towels on one page should
 * find the sheets page works the same way.
 *
 * THE SPECIFICATION IS THE CATALOGUE'S, NOT A COPY. The rows come from
 * lib/product-data.ts through lib/catalogue-lines.ts, so correcting a figure
 * there corrects it here too. A line with no rows on the sheet keeps the same
 * frame but asks only for a quantity, and says "Specification on request".
 */

export type RangeLine = {
  name: string;
  intro: string;
  productSlugs: string[];
  /** Title drawn in red. */
  alert?: boolean;
};

type LinkTo = { name: string; href: string; alert?: boolean };

export function RangeLinePage({
  crumbs,
  eyebrow,
  line,
  href,
  images,
  listKind,
  listSlug,
  range,
  others,
}: {
  /** The breadcrumb after Home. The last entry is this page. */
  crumbs: { label: string; href?: string }[];
  /** The small label above the title. */
  eyebrow: string;
  line: RangeLine;
  /** This page's own URL, for the quote list's link back. */
  href: string;
  images: Shot[];
  /** How the quote list files this page — see QUOTE_LIST_KINDS. */
  listKind: "cat" | "hc" | "com";
  listSlug: string;
  /** The range this page belongs to, for the note under the table. */
  range: { label: string; href: string };
  /** The rest of the range, as a row of links at the foot. */
  others: { heading: string; links: LinkTo[] };
}) {
  const spec = orderSpec(line.productSlugs);
  const blend = spec?.facts.find((f) => f.label === "Blend")?.value;

  const page = (
    <main className="bg-background">
      <section className="border-premium/20 border-b">
        <div className="mx-auto w-full max-w-6xl px-5 py-5 sm:px-8">
          <Crumbs trail={crumbs} />
        </div>
      </section>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-14">
          <Reveal variant="fade-up">
            <ProductGallery images={images} />
          </Reveal>

          <div className="flex flex-col justify-center">
            <Reveal variant="fade-up">
              <p className="text-premium text-xs font-semibold tracking-[0.22em] uppercase">
                {eyebrow}
              </p>
              <h1
                className={`font-heading mt-4 text-4xl leading-[1.08] font-semibold text-balance sm:text-5xl ${
                  line.alert ? "text-red-600 dark:text-red-400" : "text-foreground"
                }`}
              >
                {line.name}
              </h1>
              {/* The blend under the name, as on the Terry pages, when every
                  row shares one. */}
              {blend ? (
                <p className="text-accent-gold mt-3 text-[13px] font-semibold tracking-[0.14em] uppercase">
                  {blend}
                </p>
              ) : null}

              <p className="text-muted-foreground mt-5 leading-relaxed text-pretty">{line.intro}</p>
            </Reveal>

            <Reveal variant="fade-up" delay={0.1}>
              {spec ? (
                <CatalogueSpecPicker spec={spec} />
              ) : (
                <CatalogueEnquiryPanel name={line.name} />
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Specification, and the order list ─────────────────────────────── */}
      {spec ? (
        // scroll-mt clears the sticky header when "Next" jumps here.
        <section
          id={SPEC_SECTION_ID}
          className="bg-platinum/25 border-premium/20 scroll-mt-24 border-y py-14 sm:py-20"
        >
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <Reveal variant="fade-up">
              <h2 className="font-heading text-3xl font-semibold sm:text-4xl">Specification</h2>
              <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
                Written to be read against your tender document. Add the rows you need and the
                quantities, then send the whole list as one request.
              </p>
            </Reveal>

            <div className="mt-10">
              <CatalogueSpecTable
                spec={spec}
                listKind={listKind}
                listSlug={listSlug}
                rangeHref={range.href}
                rangeLabel={range.label}
              />
            </div>
          </div>
        </section>
      ) : null}

      {/* ── The rest of the range ────────────────────────────────────────── */}
      {others.links.length ? (
        <section className={`py-12 sm:py-16 ${spec ? "" : "border-premium/20 border-t"}`}>
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <h2 className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
              {others.heading}
            </h2>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {others.links.map((other) => (
                <li key={other.href}>
                  <Link
                    href={other.href}
                    className={`border-premium/35 hover:border-premium focus-visible:ring-ring inline-flex rounded-full border px-4 py-2 text-[13.5px] transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                      other.alert
                        ? "font-semibold text-red-600 hover:text-red-700 dark:text-red-400"
                        : "text-foreground/80 hover:text-foreground"
                    }`}
                  >
                    {other.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </main>
  );

  if (!spec) return page;

  // Provider around both interactive sections, so the picker in the hero and
  // the table further down share one list. The rest of the page stays
  // server-rendered; a provider does not pull its children into the client.
  return (
    <RangeOrderListProvider
      product={{
        kind: listKind,
        slug: listSlug,
        name: line.name,
        image: images[0]?.src ?? null,
        href,
      }}
      lineMeta={spec.rows.map((row) => ({
        sku: row.code,
        // The unit in the label: the drawer shows the bare number.
        label: `${row.summary}, in ${row.unit === "dz" ? "dozens" : "pieces"}`,
        step: row.step,
      }))}
    >
      {page}
    </RangeOrderListProvider>
  );
}

function Crumbs({ trail }: { trail: { label: string; href?: string }[] }) {
  const all = [{ label: "Home", href: "/" }, ...trail];

  return (
    <nav aria-label="Breadcrumb">
      <ol className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-[13px]">
        {all.map((crumb, i) => (
          <li key={crumb.label + i} className="flex items-center gap-1.5">
            {i > 0 ? <ChevronRight aria-hidden className="size-3.5 shrink-0" /> : null}
            {crumb.href && i < all.length - 1 ? (
              <Link href={crumb.href} className="hover:text-foreground transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span
                aria-current={i === all.length - 1 ? "page" : undefined}
                className="text-foreground font-medium"
              >
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
