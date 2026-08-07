import Image from "next/image";
import { SITE } from "@/lib/site-config";

/**
 * The Souwel wordmark, from the supplied artwork.
 *
 * ONE COMPONENT FOR EVERY PLACEMENT so the logo can never drift between the
 * header, the footer, the 404 and the intro. Callers pass a height; the width
 * follows from the artwork's own aspect ratio.
 *
 * THE ASSET IS A DERIVED CROP, NOT THE ORIGINAL FILE. The supplied PNG is
 * 1376×280 with the artwork occupying 1324×209 inside it, offset off-centre
 * (29px of transparent padding above, 43px below). Sizing by height against
 * that file would render the mark smaller than asked for and sitting high in
 * its own box, and every placement would need a different fudge factor. So the
 * build uses a version cropped to the artwork's real bounds at
 * public/images/logo/souwel-logo.png. The original is untouched at
 * public/images/Souwel Logo/.
 *
 * COLOUR IS FIXED AND THAT CONSTRAINS WHERE IT CAN GO. The letters are
 * #0030F0 — a vivid but mid-luminance blue. Measured against the surfaces on
 * this site:
 *
 *   ivory / white   6.8 : 1   ideal
 *   Deep Navy       1.8 : 1   legible, because the hue separation is large,
 *                             but it is the weakest placement on the site
 *   intro scrim     1.3 : 1   unusable — which is why that scrim was inverted
 *                             to a light wash, see globals.css
 *
 * A one-colour light version of the artwork would fix the navy case properly.
 * Until there is one, `plate` puts the mark on an ivory chip for surfaces where
 * the blue-on-navy reading is not good enough.
 */

const RATIO = 1324 / 209;

export function SouwelLogo({
  height = 30,
  plate = false,
  className,
  priority = false,
}: {
  /** Rendered height in px. Width follows the artwork's aspect ratio. */
  height?: number;
  /** Set the mark on an ivory chip — for dark surfaces where contrast matters
   *  more than showing the artwork against the background directly. */
  plate?: boolean;
  className?: string;
  /** Only the header's logo is above the fold on every page. */
  priority?: boolean;
}) {
  const img = (
    <Image
      src="/images/logo/souwel-logo.png"
      // The logo is the link's own label in every placement, so it carries the
      // company name rather than an empty alt.
      alt={SITE.name}
      width={Math.round(height * RATIO)}
      height={height}
      priority={priority}
      // BOTH dimensions are pinned to the exact numbers in the width/height
      // attributes, and no Tailwind sizing class is applied. That is deliberate.
      //
      // The obvious `h-auto w-auto` + `style={{ height, width: "auto" }}` logs
      // a next/image warning on every page. next/image compares the rendered
      // box against the attributes and warns when exactly one of the two was
      // changed by CSS. `width: auto` makes the browser derive the width from
      // the true artwork ratio (height 26 -> 164.71px) while the attribute is
      // the rounded 165, so width counts as modified and height does not.
      // Tailwind's preflight `img { height: auto }` produces the same warning
      // from the other direction if the style is dropped entirely.
      //
      // Pinning both makes rendered and declared identical, so neither counts
      // as modified. The cost is the sub-pixel rounding — at most half a pixel
      // of width on a 165px mark, about 0.3%, which is not visible.
      style={{ width: Math.round(height * RATIO), height }}
    />
  );

  if (!plate) return <span className={className}>{img}</span>;

  return (
    <span className={`bg-ivory inline-flex items-center rounded-md px-3 py-1.5 ${className ?? ""}`}>
      {img}
    </span>
  );
}
