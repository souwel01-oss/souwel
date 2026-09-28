import type { Metadata } from "next";
import Link from "next/link";
import { QuoteRequestForm, type QuotePickerProduct } from "@/components/quote/QuoteRequestForm";
import { PRODUCTS } from "@/lib/product-data";
import { CATEGORIES } from "@/lib/site-config";
import { hasProductPage } from "@/lib/product-slugs";
import { hospitalityItemByName } from "@/lib/hospitality";
import { getTerryProduct, parseTerryLines } from "@/lib/terry-towels";
import { bedSizeLabel, getBedLinenProduct, parseBedLinenLines } from "@/lib/bed-linen";
import { getSpaSalonProduct, parseSpaSalonLines } from "@/lib/spa-salon";
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
 * bounded to seven digits of nothing but digits and rounded up to a dozen the
 * way the page does it. These are supplied by the dozen; a hand-edited URL
 * should not be able to ask for 10,000 of something that only exists in twelves.
 */
function readTerryRequest(params: { terry?: string; lines?: string }) {
  if (!params.terry) return null;
  const product = getTerryProduct(params.terry);
  if (!product) return null;

  const lines = parseTerryLines(product, params.lines);
  if (lines.length === 0) return null;

  const body = lines.map(
    (l) =>
      `- ${l.name} ${l.dimensions} (${l.sku}) — qty ${l.quantity.toLocaleString(
        "en-US"
      )}, weight ${l.weight}`
  );

  // The name says the construction; the body says which sizes. Putting every
  // size in the subject line would run past the 160 characters the enquiry
  // field allows the moment a buyer lists four of them.
  const name = `${product.name} (${product.blend}) — ${lines.length} ${
    lines.length === 1 ? "line" : "lines"
  }`;

  return {
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
function readBedLinenRequest(params: { bed?: string; lines?: string }) {
  if (!params.bed) return null;
  const product = getBedLinenProduct(params.bed);
  if (!product) return null;

  const lines = parseBedLinenLines(product, params.lines);
  if (lines.length === 0) return null;

  const body = lines.map(
    (l) =>
      `- ${bedSizeLabel(l)} ${l.dimensions} (${l.sku}) — qty ${l.quantity.toLocaleString("en-US")}`
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
    name,
    message: [...facts, "", ...body, "", ""].join("\n"),
  };
}

/**
 * A Spa & Salon request, rebuilt from the query string. Same trust rule as
 * the two above: only the product slug and the stock codes in `?lines=` are
 * looked at, and only after both are checked against lib/spa-salon.ts.
 */
function readSpaSalonRequest(params: { spa?: string; lines?: string }) {
  if (!params.spa) return null;
  const product = getSpaSalonProduct(params.spa);
  if (!product) return null;

  const lines = parseSpaSalonLines(product, params.lines);
  if (lines.length === 0) return null;

  const body = lines.map(
    (l) => `- ${l.colour} (${l.sku}) — qty ${l.quantity.toLocaleString("en-US")}`
  );

  const facts = [
    product.threadCount ? `Thread count: ${product.threadCount}` : null,
    `Size: ${product.size}`,
    product.weight ? `Weight: ${product.weight}` : null,
    `Pack: ${product.pack} pcs`,
  ].filter((v): v is string => Boolean(v));

  const name = `${product.name} — ${lines.length} ${lines.length === 1 ? "colour" : "colours"}`;

  return { name, message: [...facts, "", ...body, "", ""].join("\n") };
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
    lines?: string;
  }>;
}) {
  const params = await searchParams;
  // The slug comes from a query string, so it is only a prefill hint until it
  // is checked. An unknown value simply leaves the row empty.
  const initialSlug = params.product && hasProductPage(params.product) ? params.product : undefined;

  // `?enquiry=` carries a product NAME rather than a slug — it comes from the
  // twenty Hospitality lines that have no catalogue entry and therefore no slug
  // to select in the picker. It seeds the message box instead, so the buyer
  // does not have to retype what they just clicked.
  //
  // Checked against the range rather than trusted: this lands in a textarea a
  // member of staff will read, and a query string is attacker-controlled.
  // Anything not in HOSPITALITY_GROUPS is dropped.
  const enquiryName =
    params.enquiry && hospitalityItemByName(params.enquiry) ? params.enquiry : undefined;

  // A Terry Towels or Bed Linen request arrives with its specification
  // already chosen, so either takes precedence over a bare `?enquiry=` name
  // and brings its own note: the default one says we have no specification
  // for the line, which is exactly wrong here. Only one of the two is ever
  // present on a real link — a product page only ever builds one kind — so
  // Terry is checked first and Bed Linen only asked for if it found nothing.
  const range =
    readTerryRequest(params) ?? readBedLinenRequest(params) ?? readSpaSalonRequest(params);

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

        <QuoteRequestForm
          products={PICKER_PRODUCTS}
          initialSlug={initialSlug}
          enquiryName={range?.name ?? enquiryName}
          enquiryNote={
            range
              ? "Your list and its specification are below. Fill in your details and send it."
              : undefined
          }
          messagePrefill={range?.message}
          prefill={prefill}
        />
      </div>
    </main>
  );
}
