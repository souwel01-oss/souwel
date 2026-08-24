import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/animation/Reveal";
import { SplitReveal } from "@/components/animation/SplitReveal";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { FabricWeaveViewer } from "@/components/catalog/FabricWeaveViewer";
import { PRODUCTS, getProduct } from "@/lib/product-data";
import { CATEGORIES } from "@/lib/site-config";

/**
 * Product detail page (FR-008).
 *
 * THIS IS NOT A SHOP PAGE, AND THE DIFFERENCE IS THE WHOLE DESIGN. There is no
 * price, no stock figure, no quantity selector, no basket. A textile buyer does
 * not add 4,000 sheets to a cart — they check whether the construction matches
 * their specification, whether the sizes fit their mattress build, whether it
 * survives their laundry's cycle, and then they ask for a quote. So the page is
 * ordered the way that conversation goes: what it is, what it is made of, what
 * sizes exist, what can be changed, how it launders, then the quote request.
 *
 * The single call to action is "Request a Quote", repeated at the top and the
 * bottom. Everything else on the page exists to let a buyer decide whether that
 * request is worth making.
 *
 * The specifications table is the most important element here and is deliberately
 * a real <table> with row headers — a buyer will read it against their own tender
 * document, and screen-reader users need the row/column relationship that a grid
 * of <div>s throws away.
 *
 * CONTENT WARNING: every specification value is placeholder. See the header of
 * lib/product-data.ts.
 */

export function generateStaticParams() {
  return Object.keys(PRODUCTS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} — Souwel`,
      description: product.shortDescription,
      images: [{ url: product.heroImageUrl }],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const hasCare = product.care.length > 0;

  const category = CATEGORIES.find((c) => c.slug === product.categorySlug);

  return (
    <main>
      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="border-premium/20 border-b">
        <ol className="text-muted-foreground mx-auto flex w-full max-w-7xl flex-wrap items-center gap-1.5 px-4 py-4 text-xs sm:px-6 lg:px-8">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <ChevronRight aria-hidden className="size-3.5 opacity-50" />
          <li>
            <Link
              href={`/categories/${product.categorySlug}`}
              className="hover:text-foreground transition-colors"
            >
              {category?.name ?? "Catalog"}
            </Link>
          </li>
          <ChevronRight aria-hidden className="size-3.5 opacity-50" />
          {/* aria-current marks the last crumb; it is not a link, because a
              link to the page you are already on is a dead control. */}
          <li aria-current="page" className="text-foreground font-medium">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* ── Hero: gallery + the buyer's first questions ─────────────────── */}
      <section className="bg-background py-12 sm:py-16 lg:py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
          <Reveal variant="fade-up">
            <ProductGallery images={product.galleryImageUrls} />
          </Reveal>

          <div className="flex flex-col justify-center">
            <Reveal variant="fade-up">
              <p className="text-premium text-xs font-semibold tracking-[0.22em] uppercase">
                {category?.name ?? "Catalog"}
              </p>
            </Reveal>

            <SplitReveal
              as="h1"
              text={product.name}
              variant="mask-lines"
              className="font-heading mt-4 text-4xl leading-[1.08] font-semibold text-balance sm:text-5xl"
            />

            <Reveal variant="fade-up" delay={0.1}>
              <p className="text-foreground/80 mt-5 text-lg leading-relaxed text-pretty">
                {product.shortDescription}
              </p>
              <p className="text-muted-foreground mt-4 leading-relaxed text-pretty">
                {product.description}
              </p>
            </Reveal>

            {/* Headline figures. The four things a buyer checks before reading
                anything else — and MOQ and lead time belong here rather than
                buried in the table, because they are what disqualifies a
                supplier fastest. */}
            <Reveal variant="fade-up" delay={0.15}>
              <dl className="border-premium/25 mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-y py-6">
                {product.keyFacts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                      {fact.label}
                    </dt>
                    <dd className="text-foreground mt-1.5 text-sm font-medium">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal variant="fade-up" delay={0.2}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary h-12 px-7 text-base font-semibold"
                >
                  <Link href={`/quote?product=${product.slug}`}>
                    Request a Quote
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-premium/50 hover:bg-premium/10 h-12 px-7 text-base"
                >
                  <Link href="/contact">Talk to our team</Link>
                </Button>
              </div>

              {/* Says the quiet part out loud. A B2B visitor who has been
                  trained by e-commerce will scan for a price and assume the
                  page is broken when there is not one. */}
              <p className="text-muted-foreground mt-4 text-sm">
                Priced by quotation against your specification and volume. No account needed to ask.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Weave viewer ───────────────────────────────────────────────── */}
      {/* Placed between the hero and the specification table on purpose. The
          two choices it demonstrates — construction and thread count — are the
          first two rows of that table, and seeing them is what makes the rows
          mean anything. Reading "300 TC sateen" after using this is a different
          experience from reading it cold. */}
      <section className="bg-background border-premium/20 border-t py-16 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Reveal variant="fade-up">
              <p className="text-premium text-xs font-semibold tracking-[0.22em] uppercase">
                See the cloth
              </p>
            </Reveal>
            <SplitReveal
              as="h2"
              text="Two decisions change everything"
              variant="mask-lines"
              className="font-heading mt-4 text-3xl leading-[1.1] font-semibold text-balance sm:text-4xl"
            />
            <Reveal variant="fade-up" delay={0.1}>
              <p className="text-muted-foreground mt-4 leading-relaxed text-pretty">
                Construction and thread count decide how the sheet looks, feels and wears. Change
                them below and watch the weave rebuild — this is the actual interlacing, drawn to
                scale, not a photograph.
              </p>
            </Reveal>
          </div>

          <Reveal variant="fade-up" delay={0.15} className="mt-10">
            <FabricWeaveViewer />
          </Reveal>
        </div>
      </section>

      {/* ── Specifications ─────────────────────────────────────────────── */}
      <section className="bg-platinum/25 border-premium/20 border-y py-16 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="fade-up">
            <h2 className="font-heading text-3xl font-semibold sm:text-4xl">Specifications</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
              Written to be read against your tender document. Anything here can be built to a
              different figure on a contract order.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {product.specifications.map((group, i) => (
              <Reveal key={group.title} variant="fade-up" delay={i * 0.08}>
                <div className="border-premium/25 h-full rounded-xl border bg-white p-6">
                  <h3 className="font-heading text-premium-alt text-xs font-semibold tracking-[0.16em] uppercase">
                    {group.title}
                  </h3>
                  {/* A real table: a buyer reads label against value, and a
                      screen reader needs the row header to say which is which. */}
                  <table className="mt-4 w-full text-sm">
                    <tbody>
                      {group.rows.map((row) => (
                        <tr key={row.label} className="border-premium/15 border-b last:border-0">
                          <th
                            scope="row"
                            className="text-muted-foreground w-2/5 py-2.5 pr-4 text-left align-top font-normal"
                          >
                            {row.label}
                          </th>
                          <td className="text-foreground py-2.5 align-top font-medium">
                            {row.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sizes ──────────────────────────────────────────────────────── */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="fade-up">
            <h2 className="font-heading text-3xl font-semibold sm:text-4xl">
              Everything we run in this line
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
              One row per build, straight from our product sheet. A dash means that detail is not
              recorded against that line — ask us and we will confirm it rather than guess.
            </p>
          </Reveal>

          <Reveal variant="fade-up" delay={0.1}>
            {/* overflow-x-auto on the wrapper, not the page: a six-column table
                must be scrollable on a phone without the whole document
                scrolling sideways. */}
            <div className="border-premium/25 mt-8 overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[44rem] text-left text-sm">
                <thead className="bg-platinum/40">
                  <tr>
                    <th scope="col" className="text-foreground px-5 py-3.5 font-semibold">
                      Colour / finish
                    </th>
                    <th scope="col" className="text-foreground px-5 py-3.5 font-semibold">
                      Finished size
                    </th>
                    <th scope="col" className="text-foreground px-5 py-3.5 font-semibold">
                      Weight
                    </th>
                    <th scope="col" className="text-foreground px-5 py-3.5 font-semibold">
                      Blend
                    </th>
                    <th scope="col" className="text-foreground px-5 py-3.5 font-semibold">
                      Stitching
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Keyed on the whole row, not on the colour: Bath Towel runs
                      the same "White, double cam border" finish at two sizes,
                      and keying on colour alone collided them. */}
                  {product.variants.map((row) => (
                    <tr
                      key={`${row.colour}-${row.size}-${row.weight}`}
                      className="border-premium/15 hover:bg-platinum/20 border-t transition-colors"
                    >
                      <th scope="row" className="text-foreground px-5 py-3.5 font-medium">
                        {row.colour}
                      </th>
                      <td className="text-foreground/85 px-5 py-3.5 tabular-nums">{row.size}</td>
                      <td className="text-foreground/85 px-5 py-3.5 tabular-nums">{row.weight}</td>
                      <td className="text-muted-foreground px-5 py-3.5">{row.blend}</td>
                      <td className="text-muted-foreground px-5 py-3.5">{row.stitching}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Customisation ──────────────────────────────────────────────── */}
      <section className="bg-navy text-ivory relative isolate overflow-hidden py-16 sm:py-20">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/4 -z-10 h-80 w-[36rem] rounded-full bg-[#0b97ff]/18 blur-[100px]"
        />
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="fade-up">
            <p className="text-accent-gold text-xs font-semibold tracking-[0.22em] uppercase">
              Contract orders
            </p>
            <h2 className="font-heading mt-4 max-w-2xl text-3xl font-semibold text-balance sm:text-4xl">
              Built to your specification, not ours
            </h2>
          </Reveal>

          <Reveal variant="fade-up" stagger className="mt-10 grid gap-6 sm:grid-cols-2">
            {product.customisation.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm"
              >
                <h3 className="font-heading text-ivory text-lg font-semibold">{item.title}</h3>
                <p className="text-ivory/70 mt-2.5 text-sm leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── Where it is specified, and how it launders ─────────────────────
          The laundering list is EMPTY on every product today: the client's
          product sheet carries no wash temperatures or cycle figures, and those
          are exactly the numbers an institutional buyer leans on hardest. So
          the section degrades to the sectors alone rather than printing a
          confident heading over invented care instructions. Fill `care` in
          product-data and the two-column layout comes back on its own. */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
          <div className={hasCare ? "lg:col-span-5" : "lg:col-span-12"}>
            <Reveal variant="fade-up">
              <h2 className="font-heading text-3xl font-semibold text-balance sm:text-4xl">
                {hasCare ? "How it launders" : "Where this is specified"}
              </h2>
              <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">
                {hasCare
                  ? "The question that decides a contract. Linen that looks right on delivery and grey after forty cycles costs more than linen that was specified properly."
                  : "The sectors this line is built and supplied for. Tell us which of them you are buying for and we will quote against the way you actually launder."}
              </p>

              <div className="mt-8">
                <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                  Specified for
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {product.sectors.map((sector) => (
                    <li
                      key={sector}
                      className="border-premium/35 text-foreground/80 rounded-full border px-3.5 py-1.5 text-xs"
                    >
                      {sector}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          {hasCare ? (
            <Reveal
              variant="fade-up"
              stagger
              staggerAmount={0.07}
              as="ul"
              className="border-premium/30 border-t lg:col-span-7"
            >
              {product.care.map((line) => (
                <li
                  key={line}
                  className="border-premium/15 flex items-start gap-4 border-b py-[1.15rem]"
                >
                  <span
                    aria-hidden
                    className="border-primary/35 text-primary mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border"
                  >
                    <Check className="size-3.5" strokeWidth={2.5} />
                  </span>
                  <span className="text-foreground/90 text-[0.9375rem] leading-relaxed">
                    {line}
                  </span>
                </li>
              ))}
            </Reveal>
          ) : null}
        </div>
      </section>

      {/* Certifications render only when there are real ones. An empty
          "Certifications" heading implies a claim; inventing entries to fill it
          would be worse. See lib/product-data.ts. */}
      {product.certifications.length > 0 && (
        <section className="bg-platinum/25 border-premium/20 border-y py-12">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              Certifications
            </h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {product.certifications.map((c) => (
                <li
                  key={c}
                  className="border-premium/35 rounded-md border bg-white px-4 py-2 text-sm"
                >
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Quote CTA ──────────────────────────────────────────────────── */}
      <section className="bg-background pt-4 pb-20 sm:pb-28">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="scale">
            <div className="border-premium/40 relative isolate overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-[#FDFBF7] px-6 py-12 text-center sm:px-12 sm:py-16">
              <span
                aria-hidden
                className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-56 w-[30rem] -translate-x-1/2 rounded-full bg-[#C9A84C]/12 blur-[80px]"
              />
              <h2 className="font-heading mx-auto max-w-2xl text-3xl font-semibold text-balance sm:text-4xl">
                Send us your specification
              </h2>
              <p className="text-muted-foreground mx-auto mt-4 max-w-xl leading-relaxed text-pretty">
                Tell us the construction, the sizes and the annual volume. We will come back with a
                quotation and a pre-production sample for sign-off.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary h-12 px-8 text-base font-semibold"
                >
                  <Link href={`/quote?product=${product.slug}`}>
                    Request a Quote
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-premium/50 hover:bg-premium/10 h-12 px-8 text-base"
                >
                  <Link href={`/categories/${product.categorySlug}`}>
                    See the full {category?.name ?? "range"} range
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
