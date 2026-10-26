/**
 * The client's own product photography for the Hospitality range.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * A PHOTOGRAPH IS ATTACHED ONLY TO THE LINE IT IS OF. Every set below comes
 * from a folder in the client's shoot ("Products by Name 2026") named for the
 * product it shows, and was checked against the picture as well as the name.
 * Lines with no folder of their own — all of Bed Linen, Flour Sack, Table
 * Cloth, Bath Sheet and the rest — are simply absent from this file and keep
 * the stand-ins their pages already carry. A Fitted Sheet card showing a towel
 * because a towel photograph happened to exist would be a picture of a product
 * Souwel is not offering under that name.
 *
 * COLOUR-TAGGED WHERE A SHOT SHOWS ONE OF THE SHEET'S COLOURS. A product page
 * shows only the shots in colours that product is actually made in, so Bar
 * Mop — Ribbed, which the sheet makes in White only, does not show the
 * blue-striped full-terry mop its siblings do. `colour` is the sheet's own
 * string, exactly as lib/food-beverage.ts spells it. An untagged shot shows
 * the line as a whole and is shown wherever the line is.
 *
 * THE FILES ARE DERIVED, NOT ORIGINALS. The shoot is 6048×4024 straight off
 * the camera; each file here is that photograph trimmed to the product and
 * centred on a 1600² white square. Square, with wide margins, because the same
 * file is cropped two ways — 4:5 on a card, 4:3 in the gallery, both
 * `object-cover` — and the margins are what keep either crop off the product.
 * The raw folder is gitignored; it is 2 GB.
 *
 * DELIBERATELY NOT IMPORTED BY lib/hospitality.ts, which ships to the browser
 * behind the header's mega-menu. That file repeats the four paths it needs for
 * the range cards on /hospitality as plain strings instead.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type Shot = {
  src: string;
  alt: string;
  /** The sheet colour this shot shows, where it shows exactly one. */
  colour?: string;
};

const DIR = "/images/hospitality";

const TERRY: Shot[] = [
  { src: `${DIR}/terry-towels/bath-towels.jpg`, alt: "Three folded white terry bath towels" },
  { src: `${DIR}/terry-towels/hand-towels.jpg`, alt: "Stack of white terry hand towels" },
  { src: `${DIR}/terry-towels/dobby-bath-towels.jpg`, alt: "White dobby-border bath towels" },
  { src: `${DIR}/terry-towels/wash-cloths.jpg`, alt: "Stack of white hemmed wash cloths" },
];

const CABANA: Shot[] = [
  {
    src: `${DIR}/cabana-pool-towels/blue-1.jpg`,
    alt: "Folded blue and white cabana-stripe pool towel",
  },
  { src: `${DIR}/cabana-pool-towels/blue-2.jpg`, alt: "Blue cabana-stripe pool towel laid flat" },
  { src: `${DIR}/cabana-pool-towels/blue-3.jpg`, alt: "Blue cabana-stripe pool towel, folded" },
];

const BATH_MATS: Shot[] = [
  { src: `${DIR}/bath-mats/double-frame-1.jpg`, alt: "Stack of white double-frame bath mats" },
  { src: `${DIR}/bath-mats/single-frame-2.jpg`, alt: "White single-frame bath mats, folded" },
  { src: `${DIR}/bath-mats/double-frame-2.jpg`, alt: "White double-frame bath mats from above" },
  { src: `${DIR}/bath-mats/single-frame-1.jpg`, alt: "Two white single-frame bath mats" },
];

const BATH_ROBES: Shot[] = [
  { src: `${DIR}/bath-robes/robe-1.jpg`, alt: "White terry bath robe with tie belt" },
  { src: `${DIR}/bath-robes/robe-2.jpg`, alt: "White shawl-collar bath robe" },
  { src: `${DIR}/bath-robes/slippers.jpg`, alt: "Pair of white terry slippers" },
];

// The shoot's four SALON TOWEL folders. Worth raising with the client: the
// stacks include purple, navy, teal and pink, none of which is among the five
// colours the salon sheet lists (Black, Grey, Burgundy, Beige, Ivory). Left
// untagged so they show; tag or drop them once the client says which is right.
const SALON_TOWEL: Shot[] = [
  { src: `${DIR}/salon-towel/colours.jpg`, alt: "Salon towels fanned out in several colours" },
  { src: `${DIR}/salon-towel/stack-1.jpg`, alt: "Stack of salon towels in assorted colours" },
  {
    src: `${DIR}/salon-towel/stack-2.jpg`,
    alt: "Stack of salon towels in brown, red, blue and pink",
  },
  { src: `${DIR}/salon-towel/stack-3.jpg`, alt: "Stack of salon towels in plum, teal and white" },
];

const BAR_MOP: Shot[] = [
  {
    src: `${DIR}/bar-mop/blue-cs.jpg`,
    alt: "White terry bar mops with a blue centre stripe",
    colour: "Blue C/S",
  },
  {
    src: `${DIR}/bar-mop/gold-cs.jpg`,
    alt: "White terry bar mops with a gold centre stripe",
    colour: "Gold C/S",
  },
  {
    src: `${DIR}/bar-mop/green-cs.jpg`,
    alt: "White terry bar mops with a green centre stripe",
    colour: "Green C/S",
  },
  {
    src: `${DIR}/bar-mop/blue-gold-cs.jpg`,
    alt: "White terry bar mops with a blue and gold centre stripe",
    colour: "Blue/Gold C/S",
  },
  {
    src: `${DIR}/bar-mop/twin-green-cs.jpg`,
    alt: "White terry bar mops with a twin green centre stripe",
    colour: "Twin Green C/S",
  },
];

const KITCHEN_TOWEL: Shot[] = [
  {
    src: `${DIR}/kitchen-towel/green-cs.jpg`,
    alt: "White kitchen towels with a green centre stripe",
    colour: "Green C/S",
  },
  {
    src: `${DIR}/kitchen-towel/blue-cs.jpg`,
    alt: "White kitchen towels with a blue centre stripe",
    colour: "Blue C/S",
  },
  {
    src: `${DIR}/kitchen-towel/green-cs-flat.jpg`,
    alt: "Green centre-stripe kitchen towel laid flat",
    colour: "Green C/S",
  },
  {
    src: `${DIR}/kitchen-towel/blue-cs-flat.jpg`,
    alt: "Blue centre-stripe kitchen towel laid flat",
    colour: "Blue C/S",
  },
];

const GLASS_TOWEL: Shot[] = [
  {
    src: `${DIR}/glass-towel/red-stripes-1.jpg`,
    alt: "Stack of white glass towels with red stripes",
    colour: "Red Stripes",
  },
  {
    src: `${DIR}/glass-towel/red-stripes-2.jpg`,
    alt: "Red-striped glass towel laid flat",
    colour: "Red Stripes",
  },
  {
    src: `${DIR}/glass-towel/red-stripes-3.jpg`,
    alt: "Folded red-striped glass towels",
    colour: "Red Stripes",
  },
];

const BISTRO_NAPKIN: Shot[] = [
  {
    src: `${DIR}/bistro-napkin/red-1.jpg`,
    alt: "Stack of white bistro napkins with red stripes",
    colour: "Red",
  },
  {
    src: `${DIR}/bistro-napkin/red-2.jpg`,
    alt: "Red-stripe bistro napkins, folded",
    colour: "Red",
  },
  { src: `${DIR}/bistro-napkin/red-3.jpg`, alt: "Folded red-stripe bistro napkins", colour: "Red" },
];

const MOMMIE_NAPKIN: Shot[] = [
  {
    src: `${DIR}/mommie-napkin/white-1.jpg`,
    alt: "Stack of white momie napkins, top one folded back",
    colour: "White",
  },
  {
    src: `${DIR}/mommie-napkin/white-2.jpg`,
    alt: "Stack of white momie napkins",
    colour: "White",
  },
  { src: `${DIR}/mommie-napkin/white-3.jpg`, alt: "Folded white momie napkins", colour: "White" },
];

const NAPKINS: Shot[] = [
  { src: `${DIR}/napkins/colours.jpg`, alt: "Napkins fanned out in several colours" },
  {
    src: `${DIR}/napkins/black-1.jpg`,
    alt: "Stack of black napkins, top one folded back",
    colour: "Black",
  },
  { src: `${DIR}/napkins/black-2.jpg`, alt: "Stack of folded black napkins", colour: "Black" },
];

const APRONS: Shot[] = [
  { src: `${DIR}/aprons/black-1.jpg`, alt: "Black bib apron, front", colour: "Black" },
  { src: `${DIR}/aprons/black-2.jpg`, alt: "Black bib apron, side", colour: "Black" },
];

/**
 * Photographs per Hospitality line, keyed by the line's slug in
 * lib/hospitality.ts. For Food & Beverage that slug is also the family slug in
 * lib/food-beverage.ts, and for Spa Salon the product slug in lib/spa-salon.ts,
 * so the range pages look up by the same key.
 */
export const LINE_PHOTOS: Record<string, Shot[]> = {
  // Bath Linen
  "terry-towels": TERRY,
  "bath-robes": BATH_ROBES,
  "bath-mats": BATH_MATS,

  // Table Linen. These three are the same products as their Food & Beverage
  // namesakes (see the note on the Table Linen group), so the same shots.
  "bistro-napkins": BISTRO_NAPKIN,
  "momi-napkins": MOMMIE_NAPKIN,
  "polyester-napkin": NAPKINS,

  // Food & Beverage
  "bar-mop": BAR_MOP,
  "kitchen-towel": KITCHEN_TOWEL,
  "glass-towel": GLASS_TOWEL,
  "bistro-napkin": BISTRO_NAPKIN,
  "mommie-napkin": MOMMIE_NAPKIN,
  aprons: APRONS,
  napkins: NAPKINS,

  // Spa Salon
  "salon-towel": SALON_TOWEL,
};

/**
 * The Towel range's own shots, for the constructions that have one.
 *
 * Only Cabana Pool Towels does: it is the one construction distinctive enough
 * to tell from its picture. The shoot labels the rest by border — single cam,
 * double cam, dobby, plain — and the sheet does not name its rows that way, so
 * which row each of those is cannot be read off the photograph. Until the
 * client says, the other eight show the range shots above, the same way they
 * showed range stand-ins before.
 */
export const TERRY_PRODUCT_PHOTOS: Record<string, Shot[]> = {
  "cabana-pool-towels": CABANA,
};

/**
 * A towel construction's own shots, else the range's. Takes a product slug;
 * a single-build family's slug is also its family slug, which is what the
 * range listing has to hand.
 */
export function terryPhotos(slug: string): Shot[] {
  return TERRY_PRODUCT_PHOTOS[slug] ?? TERRY;
}

/** A line's shots, narrowed to the colours a given product is made in. */
export function shotsInColours(shots: Shot[] | undefined, colours: string[]): Shot[] {
  return (shots ?? []).filter((shot) => !shot.colour || colours.includes(shot.colour));
}

/**
 * How many shots a listing card carries. ProductCard mounts every image it is
 * given and crossfades between them, so a card handed a line's whole set would
 * download all of it to show the first.
 */
export const CARD_SHOTS = 3;
