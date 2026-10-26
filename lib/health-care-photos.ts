/**
 * The client's own product photography for the Health-Care range.
 *
 * Same rules and the same file treatment as lib/hospitality-photos.ts — read
 * that file's note first. In short: a photograph is attached only to the
 * product it is of, `colour` is the sheet's own string where a shot shows
 * exactly one of its shades, and a line with no photographs keeps stand-ins.
 *
 * TWO MAPS, because the range has two kinds of page:
 *
 *   PRODUCT_PHOTOS  keyed by catalogue slug (lib/product-data.ts). Used on the
 *                   /products page and in that build's block on its line page.
 *   LINE_PHOTOS     keyed by line slug (lib/health-care.ts). Used for the
 *                   line's own gallery and its card on /health-care.
 *
 * WHERE A FOLDER WAS READ RATHER THAN MATCHED BY NAME, it says so below. The
 * client's folder names prefix Health-Care with "H C"; several health-care
 * products were shot without a prefix, or under "H" (Hospitality) because the
 * same product is sold to both.
 */

import type { Shot } from "@/lib/hospitality-photos";

const DIR = "/images/health-care";

const ABSORBENT_TOWEL: Shot[] = [
  {
    src: `${DIR}/absorbent-towel/colours.jpg`,
    alt: "Absorbent towels fanned out in jade, blue, misty and white",
  },
  { src: `${DIR}/absorbent-towel/jade.jpg`, alt: "Stack of jade absorbent towels", colour: "Jade" },
  {
    src: `${DIR}/absorbent-towel/ceil-blue.jpg`,
    alt: "Stack of ceil blue absorbent towels",
    colour: "Blue",
  },
  {
    src: `${DIR}/absorbent-towel/misty.jpg`,
    alt: "Stack of misty absorbent towels",
    colour: "Misty",
  },
  {
    src: `${DIR}/absorbent-towel/white.jpg`,
    alt: "Stack of white absorbent towels",
    colour: "White",
  },
];

const HYPERBARIC: Shot[] = [
  { src: `${DIR}/hyperbaric/flat.jpg`, alt: "White blanket printed “Hyperbaric Use Only”" },
  {
    src: `${DIR}/hyperbaric/angled.jpg`,
    alt: "Folded hyperbaric blanket showing the printed warning",
  },
  { src: `${DIR}/hyperbaric/folded.jpg`, alt: "Hyperbaric blanket folded flat" },
];

const RECEIVING_BLANKET: Shot[] = [
  {
    src: `${DIR}/receiving-blanket/woven-stripe.jpg`,
    alt: "White receiving blankets with a blue and red woven stripe",
    colour: "Woven dyed stripes",
  },
  {
    src: `${DIR}/receiving-blanket/footprint.jpg`,
    alt: "Receiving blankets printed with baby footprints",
    colour: "Baby foot print",
  },
  {
    src: `${DIR}/receiving-blanket/duck-print.jpg`,
    alt: "Receiving blankets printed with ducks",
    colour: "Duck print",
  },
  {
    src: `${DIR}/receiving-blanket/candy-stripe.jpg`,
    alt: "White receiving blankets with thin pink and blue stripes",
    colour: "Printed pink / blue stripes",
  },
];

const BATH_BLANKET: Shot[] = [
  {
    src: `${DIR}/bath-blanket/blue-stripe.jpg`,
    alt: "White bath blanket with blue stripes",
    colour: "White with blue stripes",
  },
  {
    src: `${DIR}/bath-blanket/natural-blue-stripe.jpg`,
    alt: "Unbleached bath blanket with blue stripes",
    colour: "Natural with blue stripes",
  },
  // Shot under "H" (Hospitality); the same bleached build the sheet lists.
  {
    src: `${DIR}/bath-blanket/bleached.jpg`,
    alt: "Stack of bleached white bath blankets",
    colour: "Bleached white",
  },
];

const CHEVRON: Shot[] = [
  {
    src: `${DIR}/spread-blanket/chevron-colours.jpg`,
    alt: "Chevron blankets stacked in blue, beige, grey and white",
  },
  {
    src: `${DIR}/spread-blanket/chevron-blue.jpg`,
    alt: "Folded blue chevron blanket",
    colour: "Blue",
  },
  {
    src: `${DIR}/spread-blanket/chevron-grey.jpg`,
    alt: "Folded grey chevron blanket",
    colour: "Grey",
  },
  {
    src: `${DIR}/spread-blanket/chevron-white.jpg`,
    alt: "Folded white chevron blanket",
    colour: "White",
  },
  // The folder says beige; the sheet's fourth shade is Tan. Untagged until the
  // client confirms they are the same.
  { src: `${DIR}/spread-blanket/chevron-beige.jpg`, alt: "Folded beige chevron blanket" },
];

const SPECTRUM: Shot[] = [
  {
    src: `${DIR}/spread-blanket/spectrum-cappuccino.jpg`,
    alt: "Folded cappuccino spectrum spread blanket",
    colour: "Cappuccino beige",
  },
  {
    src: `${DIR}/spread-blanket/spectrum-multi.jpg`,
    alt: "Folded multi-colour spectrum spread blanket",
    colour: "Multi colour",
  },
];

const SPECTRUM_LINKS: Shot[] = [
  {
    src: `${DIR}/spread-blanket/spectrum-links-blue.jpg`,
    alt: "Folded blue spectrum links spread blanket",
    colour: "Blue",
  },
  {
    src: `${DIR}/spread-blanket/spectrum-links-blue-flat.jpg`,
    alt: "Blue spectrum links spread blanket laid flat",
    colour: "Blue",
  },
];

const SERPENTINE: Shot[] = [
  {
    src: `${DIR}/spread-blanket/serpentine.jpg`,
    alt: "Folded white serpentine blanket",
    colour: "White",
  },
  {
    src: `${DIR}/spread-blanket/serpentine-flat.jpg`,
    alt: "White serpentine blanket laid flat",
    colour: "White",
  },
];

const HERRINGBONE: Shot[] = [
  {
    src: `${DIR}/spread-blanket/herringbone-beige.jpg`,
    alt: "Folded beige herringbone blanket",
    colour: "Beige",
  },
  {
    src: `${DIR}/spread-blanket/herringbone-blue.jpg`,
    alt: "Folded blue herringbone blanket",
    colour: "Blue",
  },
  // The folder says "mid green"; the sheet's green shade is Celery. Untagged
  // until the client confirms they are the same.
  { src: `${DIR}/spread-blanket/herringbone-green.jpg`, alt: "Folded green herringbone blanket" },
];

const BATH_TOWEL: Shot[] = [
  // The same photograph the Hospitality towel range uses: the folder is
  // "BATH TOWEL DBL CAM 24X48", the sheet's first bath towel build exactly.
  {
    src: "/images/hospitality/terry-towels/bath-towels.jpg",
    alt: "Three folded white bath towels with a double cam border",
  },
  { src: `${DIR}/towels/bath-towel-plain.jpg`, alt: "Plain white bath towels, folded" },
];

const HAND_TOWEL: Shot[] = [
  {
    src: `${DIR}/towels/hand-towel-dobby.jpg`,
    alt: "Stack of white hand towels with a dobby border",
  },
];

const WASH_CLOTH: Shot[] = [
  {
    src: `${DIR}/towels/wash-cloth-dobby.jpg`,
    alt: "Stack of white wash cloths with a dobby border",
  },
];

const HUCK_TOWEL: Shot[] = [
  { src: `${DIR}/towels/huck-towel.jpg`, alt: "Stack of white huck towels" },
  { src: `${DIR}/towels/huck-towel-stack.jpg`, alt: "White huck towels, folded" },
];

/** Shots per catalogue entry, for its /products page and its block on a line page. */
export const PRODUCT_PHOTOS: Record<string, Shot[]> = {
  "surgical-towel": ABSORBENT_TOWEL,
  "hyperbaric-blanket": HYPERBARIC,
  "baby-blanket": RECEIVING_BLANKET,
  "bath-blanket": BATH_BLANKET,
  "chevron-blanket": CHEVRON,
  "spectrum-spread-blanket": SPECTRUM,
  "spectrum-links-spread-blanket": SPECTRUM_LINKS,
  "serpentine-blanket": SERPENTINE,
  "herringbone-thermal-blanket": HERRINGBONE,
  "bath-towel": BATH_TOWEL,
  "hand-towel": HAND_TOWEL,
  "wash-cloth": WASH_CLOTH,
  "huck-towel": HUCK_TOWEL,
};

/**
 * For the lines the client's shoot does not cover: Hyperbaric Towel, Hyperbaric
 * Sheet, Pillow Case and Flannel Blanket.
 */
export const STAND_INS: Shot[] = [
  { src: "/images/products/bed-sheets.jpg", alt: "Bed made up in white sheets and pillows" },
  { src: "/images/products/other-textile.jpg", alt: "Close-up of plain white woven textile" },
];

/** Shots per Health-Care line, for its own page and its card. */
export const LINE_PHOTOS: Record<string, Shot[]> = {
  towels: [BATH_TOWEL[0], HAND_TOWEL[0], WASH_CLOTH[0], HUCK_TOWEL[0]],
  // Read, not matched: the folder is "KNITTED FITTED SHEET", unprefixed.
  sheets: [
    { src: `${DIR}/sheets/knitted-fitted.jpg`, alt: "White knitted fitted sheet laid flat" },
    { src: `${DIR}/sheets/knitted-fitted-folded.jpg`, alt: "White knitted fitted sheet, folded" },
  ],
  "bath-blanket": BATH_BLANKET,
  "spread-blanket": [
    CHEVRON[0],
    SPECTRUM[0],
    SPECTRUM_LINKS[0],
    SERPENTINE[0],
    HERRINGBONE[1],
    SPECTRUM[1],
  ],
  "receiving-blanket": RECEIVING_BLANKET,
  "absorbent-towel": ABSORBENT_TOWEL,
  "patient-gown": [
    {
      src: `${DIR}/patient-gown/stripes-blue.jpg`,
      alt: "Patient gown in a blue multi-stripe print",
    },
    {
      src: `${DIR}/patient-gown/stripes-green.jpg`,
      alt: "Patient gown in a green multi-stripe print",
    },
    { src: `${DIR}/patient-gown/snowflake.jpg`, alt: "Patient gown in a white snowflake print" },
    {
      src: `${DIR}/patient-gown/stripes-blue-neck.jpg`,
      alt: "Neckline of the blue multi-stripe patient gown",
    },
  ],
  // Read, not matched: the folder is numbered "77". Its gown has snaps along
  // the shoulder and sleeve, which is what makes a gown an IV gown.
  "iv-gown": [
    { src: `${DIR}/iv-gown/front.jpg`, alt: "Blue printed gown, front" },
    { src: `${DIR}/iv-gown/shoulder-snaps.jpg`, alt: "Snap fastenings along the gown's shoulder" },
    { src: `${DIR}/iv-gown/sleeve-snaps.jpg`, alt: "Snap fastenings along the gown's sleeve" },
    { src: `${DIR}/iv-gown/side.jpg`, alt: "Blue printed gown, side" },
  ],
  "hyperbaric-use-only": HYPERBARIC,
};
