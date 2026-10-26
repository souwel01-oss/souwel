import type { Metadata } from "next";
import Link from "next/link";
import { QuoteRequestForm, type QuotePickerProduct } from "@/components/quote/QuoteRequestForm";
import { PRODUCTS } from "@/lib/product-data";
import { CATEGORIES } from "@/lib/site-config";
import { hasProductPage } from "@/lib/product-slugs";
import { hospitalityItemByName } from "@/lib/hospitality";
import { getHealthCareLine, healthCareLineByName } from "@/lib/health-care";
import { commercialItemByName, getCommercialItem } from "@/lib/commercial";
import { parseCatalogueLines, type CatalogueOrderItem } from "@/lib/catalogue-lines";
import {
  getTerryProduct,
  parseTerryLines,
  terryCaseStep,
  terryWeightLabel,
} from "@/lib/terry-towels";
import { caseQuantityLabel } from "@/lib/case-pack";
import { bedSizeLabel, getBedLinenProduct, parseBedLinenLines } from "@/lib/bed-linen";
import { getSpaSalonProduct, parseSpaSalonLines } from "@/lib/spa-salon";
import { fbCaseStep, fbUnit, getFbProduct, parseFbLines } from "@/lib/food-beverage";
import { decodeQuoteList, quoteListId, type QuoteListRequestEntry } from "@/lib/quote-list";
import { QUOTE_ENQUIRY_MAX } from "@/lib/quote-fields";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Request a Quote",
  description:
    "Tell us what you need and how much of it. Souwel replies with pricing, specifications and lead times for hospitality, health-care, institutional and commercial textiles.",
};

const CATEGORY_NAME = new Map(CATEGORIES.map((c) => [c.slug, c.name]));

/**
 * The catalogue as a picker needs it — no specification blobs, no imagery.
 *
 * Built on the server so the client bundle carries three strings per product
 * instead of the whole of lib/product-data.ts.
 */
const PICKER_PRODUCTS: QuotePickerProduct[] = Object.values(PRODUCTS)
  .map((p) => ({
    slug: p.slug,
    name: p.name,
    categoryName: CATEGORY_NAME.get(p.categorySlug) ?? "Other",
  }))
  .sort((a, b) => a.categoryName.localeCompare(b.categoryName) || a.name.localeCompare(b.name));

/**
 * One range product's request, as the four readers below return it.
 *
 * `title` is the product on its own; `name` adds how many lines were chosen.
 * A request for one product leads with `name`. A request for several needs
 * the bare `title` of each, to say in one line which products it covers.
 */
type RangeRequest = {
  /** This product's entry in the quote list — see quoteListId. */
  id: string;
  title: string;
  name: string;
  message: string;
};

/**
 * A Terry Towels request, rebuilt from the query string.
 *
 * THE SLUG AND THE SIZE KEYS ARE THE ONLY THINGS TRUSTED, and only after both
 * are looked up in lib/terry-towels.ts. Everything a member of staff reads —
 * the product name, the blend, the hem, the SKU, the weight — is written here
 * from that file, not carried in the URL. A `?spec=` parameter holding prose
 * would put attacker-controlled text straight into the lead a salesperson
 * opens.
 *
 * Quantities are the only numbers that come from the visitor, so each is
 * bounded to seven digits of nothing but digits and rounded up to a full case
 * the way the page does it. They are in dozens, and a hand-edited URL should
 * not be able to ask for 20 dozen of something packed 15 dozen to the case.
 */
function readTerryRequest(params: { terry?: string; lines?: string }): RangeRequest | null {
  if (!params.terry) return null;
  const product = getTerryProduct(params.terry);
  if (!product) return null;

  const lines = parseTerryLines(product, params.lines);
  if (lines.length === 0) return null;

  const body = lines.map(
    (l) =>
      `- ${l.name} ${l.dimensions} (${l.sku}) — qty ${caseQuantityLabel(
        l.quantity,
        terryCaseStep(l),
        "dz"
      )}, weight ${terryWeightLabel(l)}`
  );

  // The name says the construction; the body says which sizes. Putting every
  // size in the subject line would run past the 160 characters the enquiry
  // field allows the moment a buyer lists four of them.
  const title = `${product.name} (${product.blend})`;
  const name = `${title} — ${lines.length} ${lines.length === 1 ? "line" : "lines"}`;

  return {
    id: quoteListId("terry", product.slug),
    title,
    name,
    // Trailing blank line so the buyer types after the specification rather
    // than into the middle of it.
    message: [`Blend: ${product.blend}`, `Hem: ${product.hem}`, "", ...body, "", ""].join("\n"),
  };
}

/**
 * A Bed Linen request, rebuilt from the query string. Same trust rule as
 * readTerryRequest above: only the product slug and the bed-size keys in
 * `?lines=` are ever looked at, and only after both are checked against
 * lib/bed-linen.ts. Everything a member of staff reads is written here from
 * that file, never carried as prose in the URL.
 */
function readBedLinenRequest(params: { bed?: string; lines?: string }): RangeRequest | null {
  if (!params.bed) return null;
  const product = getBedLinenProduct(params.bed);
  if (!product) return null;

  const lines = parseBedLinenLines(product, params.lines);
  if (lines.length === 0) return null;

  const body = lines.map(
    (l) =>
      `- ${bedSizeLabel(l)} ${l.dimensions} (${l.sku}) — qty ${caseQuantityLabel(
        l.quantity,
        product.pcsPerCase ?? 1,
        "pcs"
      )}`
  );

  const facts = [
    product.threadCount ? `Thread count: ${product.threadCount}` : null,
    product.design ? `Design: ${product.design}` : null,
    product.blend ? `Blend: ${product.blend}` : null,
    product.hem ? `Hem: ${product.hem}` : null,
    product.pcsPerCase ? `Pcs/case: ${product.pcsPerCase}` : null,
  ].filter((v): v is string => Boolean(v));

  const name = `${product.name} — ${lines.length} ${lines.length === 1 ? "size" : "sizes"}`;

  return {
    id: quoteListId("bed", product.slug),
    title: product.name,
    name,
    message: [...facts, "", ...body, "", ""].join("\n"),
  };
}

/**
 * A Spa & Salon request, rebuilt from the query string. Same trust rule as
 * the two above: only the product slug and the stock codes in `?lines=` are
 * looked at, and only after both are checked against lib/spa-salon.ts.
 */
function readSpaSalonRequest(params: { spa?: string; lines?: string }): RangeRequest | null {
  if (!params.spa) return null;
  const product = getSpaSalonProduct(params.spa);
  if (!product) return null;

  const lines = parseSpaSalonLines(product, params.lines);
  if (lines.length === 0) return null;

  const body = lines.map(
    (l) => `- ${l.colour} (${l.sku}) — qty ${l.quantity.toLocaleString("en-US")} pcs`
  );

  const facts = [
    product.threadCount ? `Thread count: ${product.threadCount}` : null,
    `Size: ${product.size}`,
    product.weight ? `Weight: ${product.weight}` : null,
    `Pack: ${product.pack} pcs`,
  ].filter((v): v is string => Boolean(v));

  const name = `${product.name} — ${lines.length} ${lines.length === 1 ? "colour" : "colours"}`;

  return {
    id: quoteListId("spa", product.slug),
    title: product.name,
    name,
    message: [...facts, "", ...body, "", ""].join("\n"),
  };
}

/**
 * A Food & Beverage request, rebuilt from the query string. Same trust rule
 * as the three above: only the product slug and the stock codes in `?lines=`
 * are looked at, and only after both are checked against lib/food-beverage.ts.
 */
function readFbRequest(params: { fb?: string; lines?: string }): RangeRequest | null {
  if (!params.fb) return null;
  const product = getFbProduct(params.fb);
  if (!product) return null;

  const lines = parseFbLines(product, params.lines);
  if (lines.length === 0) return null;

  const manySizes = product.sizes.length > 1;
  const body = lines.map(
    (l) =>
      `- ${l.colour}${manySizes ? ` ${l.size}` : ""} (${l.sku}) — qty ${caseQuantityLabel(
        l.quantity,
        fbCaseStep(product, l.size),
        fbUnit(product)
      )}`
  );

  const facts = [
    product.description ? `Description: ${product.description}` : null,
    `Blend: ${product.blend}`,
    product.weight ? `Weight: ${product.weight}` : null,
    manySizes ? null : `Size: ${product.sizes[0].size}`,
    manySizes ? null : (product.sizes[0].packing ? `Packing: ${product.sizes[0].packing}` : null),
  ].filter((v): v is string => Boolean(v));

  const name = `${product.name} — ${lines.length} ${lines.length === 1 ? "line" : "lines"}`;

  return {
    id: quoteListId("fb", product.slug),
    title: product.name,
    name,
    message: [...facts, "", ...body, "", ""].join("\n"),
  };
}

/** One range entry of `?list=`, through the reader its own range already has. */
function readRangeEntry(entry: Exclude<QuoteListRequestEntry, { kind: "product" }>) {
  const { slug, lines } = entry;
  switch (entry.kind) {
    case "terry":
      return readTerryRequest({ terry: slug, lines });
    case "bed":
      return readBedLinenRequest({ bed: slug, lines });
    case "spa":
      return readSpaSalonRequest({ spa: slug, lines });
    case "fb":
      return readFbRequest({ fb: slug, lines });
    default:
      return null;
  }
}

/**
 * The rows of a catalogue page (/products, a Health-Care line or a Commercial
 * line), as line items. Same trust rule as the range readers: the page slug
 * and the row codes are looked up, and every figure in the notes is written
 * from lib/product-data.ts. See parseCatalogueLines.
 */
function readCatalogueEntry(
  kind: "cat" | "hc" | "com",
  slug: string,
  lines: string
): CatalogueOrderItem[] {
  const line =
    kind === "hc"
      ? getHealthCareLine(slug)
      : kind === "com"
        ? getCommercialItem(slug)?.item
        : hasProductPage(slug)
          ? { name: PRODUCTS[slug].name, productSlugs: [slug] }
          : undefined;
  if (!line) return [];
  return parseCatalogueLines(line.productSlugs, line.name, lines);
}

/**
 * Names several products in the one line the enquiry field allows.
 *
 * "Dobby Towels (86% Cot / 14% Poly); Flat Sheet T-200 + 2 more". As many
 * whole names as fit, then a count of the rest — a name cut off mid-word
 * reads as a mistake, and the full list is in the message underneath anyway.
 */
function summariseTitles(titles: string[]): string {
  let out = titles[0].slice(0, QUOTE_ENQUIRY_MAX);
  for (let i = 1; i < titles.length; i += 1) {
    const candidate = `${out}; ${titles[i]}`;
    const after = titles.length - i - 1;
    const tail = after > 0 ? ` + ${after} more` : "";
    if (candidate.length + tail.length > QUOTE_ENQUIRY_MAX) {
      return `${out} + ${titles.length - i} more`;
    }
    out = candidate;
  }
  return out;
}

/**
 * The buyer's whole quote list, rebuilt from `?list=`.
 *
 * SAME TRUST RULE AS EVERY READER ABOVE, applied per entry: the link carries
 * slugs, stock codes and quantities, each is checked against the catalogue,
 * and everything a member of staff reads is written here from the catalogue
 * files. An entry that does not check out is dropped and the rest still go.
 *
 * THE KINDS OF ENTRY LAND IN TWO PLACES, because they are two kinds of thing
 * to Sales. Catalogue rows become rows in the form's product list, and so
 * line items that can be priced on their own. A range product has no
 * catalogue row to attach to, so it arrives the way its own page already
 * sends it — named in the enquiry, specified in the message.
 */
function readListRequest(raw: string | undefined) {
  const entries = decodeQuoteList(raw);
  if (entries.length === 0) return null;

  const items: { slug: string; quantity: number; notes?: string }[] = [];
  const ranges: RangeRequest[] = [];
  const ids: string[] = [];

  for (const entry of entries) {
    if (entry.kind === "product") {
      if (!hasProductPage(entry.slug)) continue;
      items.push({ slug: entry.slug, quantity: entry.quantity });
      ids.push(entry.id);
      continue;
    }
    if (entry.kind === "cat" || entry.kind === "hc" || entry.kind === "com") {
      const rows = readCatalogueEntry(entry.kind, entry.slug, entry.lines);
      if (rows.length === 0) continue;
      items.push(...rows);
      ids.push(entry.id);
      continue;
    }
    const range = readRangeEntry(entry);
    if (!range) continue;
    ranges.push(range);
    ids.push(range.id);
  }

  if (ids.length === 0) return null;

  // One range product reads exactly as it does from its own page. Several
  // are stacked, each under its own name, so the message says which lines
  // belong to which product.
  const enquiry =
    ranges.length === 0
      ? undefined
      : ranges.length === 1
        ? ranges[0].name
        : summariseTitles(ranges.map((r) => r.title));

  const message =
    ranges.length === 0
      ? undefined
      : ranges.length === 1
        ? ranges[0].message
        : `${ranges.map((r) => `${r.name}\n${r.message.trimEnd()}`).join("\n\n")}\n\n`;

  return { ids, items, enquiry, message };
}

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{
    product?: string;
    enquiry?: string;
    terry?: string;
    bed?: string;
    spa?: string;
    fb?: string;
    lines?: string;
    list?: string;
    qty?: string;
  }>;
}) {
  const params = await searchParams;
  // The slug comes from a query string, so it is only a prefill hint until it
  // is checked. An unknown value simply leaves the row empty.
  const initialSlug = params.product && hasProductPage(params.product) ? params.product : undefined;

  // `?enquiry=` carries a product NAME rather than a slug — it comes from the
  // Hospitality, Health-Care and Commercial lines that have no single
  // catalogue entry and therefore no slug to select in the picker. It seeds
  // the message box instead, so the buyer does not have to retype what they
  // just clicked.
  //
  // Checked against the ranges rather than trusted: this lands in a textarea a
  // member of staff will read, and a query string is attacker-controlled.
  // Anything not a line in one of those ranges is dropped.
  const enquiryName =
    params.enquiry &&
    (hospitalityItemByName(params.enquiry) ||
      healthCareLineByName(params.enquiry) ||
      commercialItemByName(params.enquiry))
      ? params.enquiry
      : undefined;

  // A Health-Care line of several builds (Towels, Spread Blanket) IS
  // specified — just not as one product — so the default note, which says we
  // publish no specification, would be wrong for it.
  const healthCareLine = enquiryName ? healthCareLineByName(enquiryName) : undefined;
  const enquiryNote =
    healthCareLine && healthCareLine.productSlugs.length > 1
      ? "Pick the builds you need below, or name them in the message with your volumes, and send it."
      : undefined;

  // `?qty=` comes with `?enquiry=` from a line with no specification: the
  // quantity the buyer typed on that line's page. Digits only, seven at most,
  // and it is only ever written into the message as a number.
  const enquiryQty =
    enquiryName && params.qty && /^\d{1,7}$/.test(params.qty) && Number(params.qty) > 0
      ? Number(params.qty)
      : undefined;

  // A Terry Towels or Bed Linen request arrives with its specification
  // already chosen, so either takes precedence over a bare `?enquiry=` name
  // and brings its own note: the default one says we have no specification
  // for the line, which is exactly wrong here. Only one of the two is ever
  // present on a real link — a product page only ever builds one kind — so
  // Terry is checked first and Bed Linen only asked for if it found nothing.
  const range =
    readTerryRequest(params) ??
    readBedLinenRequest(params) ??
    readSpaSalonRequest(params) ??
    readFbRequest(params);

  // `?list=` is the buyer's whole quote list, sent from the drawer. It wins
  // over everything above: a link only ever carries one of these, and a list
  // that was deliberately built is the stronger statement of what is wanted.
  // A repeated parameter arrives as an array at runtime, hence the check.
  const listParam = typeof params.list === "string" ? params.list : undefined;
  const list = readListRequest(listParam);

  const user = await getSessionUser();
  const profile = user
    ? await prisma.customerProfile.findUnique({
        where: { userId: user.id },
        select: { companyName: true, contactName: true },
      })
    : null;

  const prefill = user
    ? {
        name: profile?.contactName ?? user.name,
        email: user.email,
        company: profile?.companyName ?? "",
      }
    : undefined;

  return (
    <main className="bg-background">
      <div className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <header className="mb-10">
          <p className="text-primary text-[13px] font-semibold tracking-[0.14em] uppercase">
            Request a quote
          </p>
          <h1 className="text-foreground mt-3 text-3xl leading-tight font-semibold sm:text-4xl">
            Tell us what you need
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl text-[15px] leading-relaxed">
            Give us the products and rough volumes and we will come back with pricing,
            specifications and lead times. There is no obligation and nothing is charged here.
          </p>
          {!user ? (
            <p className="text-muted-foreground mt-4 text-sm">
              You do not need an account.{" "}
              <Link
                href="/login?next=%2Fquote"
                className="text-primary font-semibold underline underline-offset-4"
              >
                Sign in
              </Link>{" "}
              if you have one and this request will be added to your history.
            </p>
          ) : null}
        </header>

        {list ? (
          <QuoteRequestForm
            products={PICKER_PRODUCTS}
            initialItems={list.items}
            enquiryName={list.enquiry}
            enquiryNote="Everything from your list is below. Check it over, fill in your details and send it."
            messagePrefill={list.message}
            // The list as it was when this request was built. If the buyer
            // changes the list and sends it again from this page, this is how
            // the form knows to start over from the new one.
            listKey={listParam}
            listIds={list.ids}
            prefill={prefill}
          />
        ) : (
          <QuoteRequestForm
            products={PICKER_PRODUCTS}
            initialSlug={initialSlug}
            enquiryName={range?.name ?? enquiryName}
            enquiryNote={
              range
                ? "Your list and its specification are below. Fill in your details and send it."
                : enquiryNote
            }
            messagePrefill={
              range?.message ??
              (enquiryQty ? `Quantity: ${enquiryQty.toLocaleString("en-US")}\n\n` : undefined)
            }
            // A product sent from its own page leaves the quote list once the
            // request has gone, so it is not sent a second time from there.
            listIds={range ? [range.id] : undefined}
            prefill={prefill}
          />
        )}
      </div>
    </main>
  );
}
