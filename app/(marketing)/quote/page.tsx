import type { Metadata } from "next";
import Link from "next/link";
import { QuoteRequestForm, type QuotePickerProduct } from "@/components/quote/QuoteRequestForm";
import { PRODUCTS } from "@/lib/product-data";
import { CATEGORIES } from "@/lib/site-config";
import { hasProductPage } from "@/lib/product-slugs";
import { hospitalityItemByName } from "@/lib/hospitality";
import { getTerryProduct, terryEnquiryName, terrySizesFor } from "@/lib/terry-towels";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Request a Quote",
  description:
    "Tell us what you need and how much of it. Souwel replies with pricing, specifications and lead times for hospitality, health-care, institutional and commercial textiles.",
};

const CATEGORY_NAME = new Map(CATEGORIES.map((c) => [c.slug, c.name]));

/** Terry towels are supplied by the dozen. Mirrors TerrySpecPicker. */
const DOZEN = 12;

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
 * THE SLUG AND THE SIZE KEY ARE THE ONLY THINGS TRUSTED, and only after both
 * are looked up in lib/terry-towels.ts. Everything a member of staff will read
 * — the product name, the blend, the hem, the weight — is written here from
 * that file, not carried in the URL. A `?spec=` parameter holding prose would
 * put attacker-controlled text straight into the lead a salesperson opens.
 *
 * Quantity is the one number that comes from the visitor, so it is bounded to
 * seven digits of nothing but digits before it is echoed back, and rounded up
 * to a dozen the same way the picker does. These are supplied by the dozen; a
 * hand-edited URL should not be able to place an order for 10,000 of something
 * that only exists in twelves.
 */
function readTerryRequest(params: { terry?: string; type?: string; qty?: string }) {
  if (!params.terry) return null;
  const product = getTerryProduct(params.terry);
  if (!product) return null;

  const match = terrySizesFor(product).find((s) => s.size.key === params.type);
  if (!match) return null;

  const typed = params.qty && /^\d{1,7}$/.test(params.qty) ? Number(params.qty) : null;
  const qty = typed !== null && typed > 0 ? Math.ceil(typed / DOZEN) * DOZEN : null;

  const lines = [
    `Blend: ${product.blend}`,
    `Hem: ${product.hem}`,
    `Product type: ${match.size.name} ${match.size.dimensions}`,
    `Weight: ${match.weight}`,
    ...(qty && qty > 0 ? [`Quantity: ${qty}`] : []),
  ];

  return {
    name: terryEnquiryName(product, match.size),
    // Trailing blank line so the buyer types after the specification rather
    // than into the middle of it.
    message: `${lines.join("\n")}\n\n`,
  };
}

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{
    product?: string;
    enquiry?: string;
    terry?: string;
    type?: string;
    qty?: string;
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

  // A Terry Towels request arrives with its specification already chosen, so it
  // takes precedence over a bare `?enquiry=` name and brings its own note: the
  // default one says we have no specification for the line, which is exactly
  // wrong here.
  const terry = readTerryRequest(params);

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
          enquiryName={terry?.name ?? enquiryName}
          enquiryNote={
            terry
              ? "Your specification is below. Add anything else you need — delivery location, target lead time — and send it."
              : undefined
          }
          messagePrefill={terry?.message}
          prefill={prefill}
        />
      </div>
    </main>
  );
}
