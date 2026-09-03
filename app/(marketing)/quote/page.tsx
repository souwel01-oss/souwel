import type { Metadata } from "next";
import Link from "next/link";
import { QuoteRequestForm, type QuotePickerProduct } from "@/components/quote/QuoteRequestForm";
import { PRODUCTS } from "@/lib/product-data";
import { CATEGORIES } from "@/lib/site-config";
import { hasProductPage } from "@/lib/product-slugs";
import { hospitalityItemByName } from "@/lib/hospitality";
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

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; enquiry?: string }>;
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
          enquiryName={enquiryName}
          prefill={prefill}
        />
      </div>
    </main>
  );
}
