"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A product card on a Hospitality listing page.
 *
 * ── THE INTERACTIVE ANATOMY, AND WHY IT IS BUILT THIS WAY ────────────────────
 *
 * The card carries FOUR click targets over one photograph: the image itself,
 * a previous and a next arrow, and a "Request a quote" button. The obvious
 * construction — wrap the whole card in a <Link> and drop the buttons inside —
 * produces a <button> nested in an <a>, which is invalid HTML. Browsers recover
 * from it differently and a keyboard user gets one focus stop where there
 * should be four.
 *
 * So the image link is a SIBLING OVERLAY (`absolute inset-0`) rather than a
 * wrapper, and the arrows and the quote button sit beside it at a higher
 * z-index. Valid markup, four real focus stops, and the clicks land where they
 * look like they should.
 *
 * ── HOVER STATE ──────────────────────────────────────────────────────────────
 *
 * Pointing at the card crossfades to the second photograph, brings the arrows
 * in from the edges and slides the quote button up from the foot of the image.
 * Leaving resets to the first photograph — a list where half the cards are
 * parked on frame three because someone scrolled past them is a list that has
 * forgotten what it was showing.
 *
 * The whole hover layer is `sm:` and up. On touch there is no hover to leave:
 * the arrows and the button are simply always visible below that breakpoint,
 * which is the same set of actions without the state that cannot happen.
 *
 * ── WHAT IS DELIBERATELY EMPTY ───────────────────────────────────────────────
 *
 * `rating` AND `badge` ARE NULL ON EVERY PRODUCT TODAY, and the card renders
 * nothing where they would go.
 *
 * The brief asked for star ratings with a review count ("★★★★★ (1117)") and
 * "New" / "Most Loved" badges. Souwel has no reviews — there is no review
 * table, no submission route, and not one customer rating in the database.
 * Printing a star row and a count would be fabricated social proof: a buyer
 * choosing a supplier partly on the strength of a thousand reviews that were
 * invented to fill a slot in a layout. That is a different category of thing
 * from a placeholder image.
 *
 * The slots are built and typed. The moment there are real ratings — or the
 * client tells us which lines are genuinely new — passing the props lights them
 * up with no further work here.
 */

export type CardColour = {
  name: string;
  /** Indicative swatch, or null when the shade name has no mapping. */
  hex: string | null;
};

export type HospitalityCardProduct = {
  /** Anchor id, so a mega-menu link to this line lands on it. */
  id: string;
  name: string;
  /** Where the card's image and title point. */
  href: string;
  /** "Request a quote", prefilled where we know the product. */
  quoteHref: string;
  /** Composition and finished size, or null when we have no specification. */
  material: string | null;
  colours: CardColour[];
  images: { src: string; alt: string }[];
  /** No data source yet — see the note above. */
  badge: string | null;
  rating: { stars: number; count: number } | null;
};

/** Swatches shown before the overflow count takes over. */
const MAX_SWATCHES = 4;

export function ProductCard({ product }: { product: HospitalityCardProduct }) {
  const { images } = product;
  const many = images.length > 1;
  const [index, setIndex] = useState(0);

  const step = (delta: number) => {
    setIndex((i) => (i + delta + images.length) % images.length);
  };

  const shownSwatches = product.colours.slice(0, MAX_SWATCHES);
  const overflow = product.colours.length - shownSwatches.length;

  return (
    <article
      id={product.id}
      // scroll-mt clears the sticky header when a mega-menu link jumps here.
      className="group scroll-mt-28"
      onMouseEnter={() => many && setIndex(1)}
      onMouseLeave={() => many && setIndex(0)}
    >
      <div className="bg-muted/40 relative aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-lg">
        {/* Every frame is rendered and stacked; only opacity changes. Swapping
            the `src` of one <Image> instead would show a blank frame on the
            first hover while the browser fetched the second photograph. */}
        {images.map((image, i) => (
          <Image
            key={image.src + i}
            src={image.src}
            alt={i === 0 ? image.alt : ""}
            aria-hidden={i === 0 ? undefined : true}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              "object-cover object-center transition-opacity duration-500 ease-[var(--ease-out)] motion-reduce:transition-none",
              i === index ? "opacity-100" : "opacity-0"
            )}
          />
        ))}

        {/* The image's own click target. A sibling of the controls below, not
            their parent — see the note at the top. */}
        <Link
          href={product.href}
          aria-label={product.name}
          className="focus-visible:ring-ring absolute inset-0 z-10 focus-visible:ring-2 focus-visible:-outline-offset-2 focus-visible:outline-none"
        />

        {product.badge ? (
          <span className="bg-background/95 text-foreground absolute top-3 left-3 z-20 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide">
            {product.badge}
          </span>
        ) : null}

        {many ? (
          <>
            <CarouselButton
              side="left"
              label={`Previous image of ${product.name}`}
              onClick={() => step(-1)}
            />
            <CarouselButton
              side="right"
              label={`Next image of ${product.name}`}
              onClick={() => step(1)}
            />
          </>
        ) : null}

        <Link
          href={product.quoteHref}
          className={cn(
            "absolute bottom-4 left-1/2 z-20 inline-flex h-10 -translate-x-1/2 items-center rounded-full px-5 text-[13px] font-semibold whitespace-nowrap",
            "bg-white text-[color:var(--color-navy)] shadow-[0_6px_20px_-8px_rgb(10_37_64/0.55)]",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
            // Touch keeps it visible; from sm it slides up on hover. The
            // translate is composed with the centring one, so both live in the
            // same utility set rather than fighting over `transform`.
            "sm:translate-y-4 sm:opacity-0 sm:transition-[opacity,translate] sm:duration-300 sm:ease-[var(--ease-out)]",
            "sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100 sm:group-hover:translate-y-0 sm:group-hover:opacity-100",
            "motion-reduce:transition-none"
          )}
        >
          Request a quote
        </Link>
      </div>

      <div className="mt-4">
        <h3 className="text-[15px] leading-snug font-semibold">
          <Link
            href={product.href}
            className="text-foreground hover:text-primary-strong dark:hover:text-primary focus-visible:ring-ring rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            {product.name}
          </Link>
        </h3>

        <p className="text-muted-foreground mt-1 text-[13px] leading-relaxed">
          {/* Said plainly rather than left blank. Twenty of the thirty-one
              Hospitality lines are not on the client's product sheet, and a
              card with an empty spec line reads as a page that failed to load
              rather than as a product we have not written up yet. */}
          {product.material ?? "Specification on request"}
        </p>

        {product.colours.length ? (
          <ul className="mt-3 flex flex-wrap items-center gap-1.5">
            {shownSwatches.map((colour) => (
              <li key={colour.name}>
                {/* The name is the accessible carrier, not the colour. A row of
                    coloured squares is invisible to a screen reader and
                    ambiguous to anyone who cannot separate the hues. */}
                {/* The border is `foreground/25`, not `border`. Almost every
                    shade in this catalogue is a white — "White", "Bleached
                    white", "White, dobby border" — and a platinum hairline
                    around a white square on an ivory page is a swatch you
                    cannot see. The inset ring lifts it off the ground without
                    darkening the colour it is there to show. */}
                <span
                  title={colour.name}
                  className="border-foreground/25 block size-4 rounded-[3px] border shadow-[inset_0_0_0_1px_rgb(255_255_255/0.6)]"
                  style={colour.hex ? { backgroundColor: colour.hex } : undefined}
                >
                  <span className="sr-only">{colour.name}</span>
                </span>
              </li>
            ))}
            {overflow > 0 ? (
              <li className="text-muted-foreground ml-0.5 text-[12px] font-medium">+{overflow}</li>
            ) : null}
          </ul>
        ) : null}

        {product.rating ? (
          <p className="text-muted-foreground mt-2.5 flex items-center gap-1 text-[12.5px]">
            <span aria-hidden className="flex">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-3.5",
                    i < Math.round(product.rating!.stars)
                      ? "fill-premium text-premium"
                      : "text-border"
                  )}
                />
              ))}
            </span>
            <span>
              {product.rating.stars.toFixed(1)} out of 5 ({product.rating.count})
            </span>
          </p>
        ) : null}
      </div>
    </article>
  );
}

function CarouselButton({
  side,
  label,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-1/2 z-20 grid size-9 -translate-y-1/2 place-items-center rounded-full",
        "bg-white/90 text-[color:var(--color-navy)] shadow-[0_4px_14px_-6px_rgb(10_37_64/0.5)] hover:bg-white",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
        side === "left" ? "left-3" : "right-3",
        // Same rule as the quote button: always there on touch, revealed on
        // hover from sm up.
        "sm:opacity-0 sm:transition-opacity sm:duration-300 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100",
        "motion-reduce:transition-none"
      )}
    >
      {side === "left" ? (
        <ChevronLeft aria-hidden className="size-4" />
      ) : (
        <ChevronRight aria-hidden className="size-4" />
      )}
    </button>
  );
}
