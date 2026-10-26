/**
 * The client's own product photography for the Commercial range.
 *
 * Same rules and file treatment as lib/hospitality-photos.ts. Only Shop Towel
 * was in the shoot (the "C SHOPTOWEL" folders; "C" is the client's prefix for
 * Commercial). Microfiber Towel and the Airline lines keep stand-ins until
 * they are photographed.
 */

import type { Shot } from "@/lib/hospitality-photos";

const DIR = "/images/commercial";

const SHOP_TOWEL: Shot[] = [
  { src: `${DIR}/shop-towel/red.jpg`, alt: "Stack of red shop towels", colour: "Red" },
  { src: `${DIR}/shop-towel/green.jpg`, alt: "Stack of green shop towels", colour: "Green" },
  { src: `${DIR}/shop-towel/white.jpg`, alt: "Stack of white shop towels", colour: "White" },
  // The folder says "prewash"; the sheet's fourth shade is Natural. Untagged
  // until the client confirms they are the same.
  { src: `${DIR}/shop-towel/prewash.jpg`, alt: "Stack of unbleached prewash shop towels" },
];

/** Shots per catalogue entry, for its /products page and its block on a line page. */
export const PRODUCT_PHOTOS: Record<string, Shot[]> = {
  "shop-towel": SHOP_TOWEL,
};

/** Shots per Commercial line, keyed by its slug in lib/commercial.ts. */
export const LINE_PHOTOS: Record<string, Shot[]> = {
  "shop-towel": SHOP_TOWEL,
  // The two Institutional Laundry lines are the other ranges; their cards
  // show a photograph from each.
  hospitality: [
    {
      src: "/images/hospitality/terry-towels/bath-towels.jpg",
      alt: "Three folded white terry bath towels",
    },
  ],
  "health-care": [
    {
      src: "/images/health-care/absorbent-towel/colours.jpg",
      alt: "Absorbent towels fanned out in jade, blue, misty and white",
    },
  ],
};

/** For the lines the client's shoot does not cover. */
export const STAND_INS: Shot[] = [
  { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
  { src: "/images/products/industrial-aprons.jpg", alt: "White workwear textile laid flat" },
];
