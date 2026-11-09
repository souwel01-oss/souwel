/**
 * The client's own product photography for the Hospitality range.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * A PHOTOGRAPH IS ATTACHED ONLY TO THE LINE IT IS OF. Every set below comes
 * from a folder in the client's shoot ("Products by Name 2026") named for the
 * product it shows, and was checked against the picture as well as the name.
 * Lines with no photography yet — Hair Wash/Dye Towel and the like — are simply
 * absent from this file and keep the stand-ins their pages already carry. A Fitted Sheet card showing a towel
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
  { src: `${DIR}/bath-robes/new-shawl-front.jpg`, alt: "White terry shawl-collar bath robe, front" },
  { src: `${DIR}/bath-robes/new-honeycomb-front.jpg`, alt: "White honeycomb kimono bath robe, front" },
  { src: `${DIR}/bath-robes/new-kimono-front.jpg`, alt: "White ribbed terry kimono bath robe, front" },
  { src: `${DIR}/bath-robes/new-waffle-shawl.jpg`, alt: "White waffle-weave shawl-collar bath robe" },
  { src: `${DIR}/bath-robes/new-shawl-back.jpg`, alt: "White terry shawl-collar bath robe, back" },
  { src: `${DIR}/bath-robes/new-honeycomb-back.jpg`, alt: "White honeycomb bath robe, back" },
  { src: `${DIR}/bath-robes/new-kimono-back.jpg`, alt: "White terry kimono bath robe, back" },
  { src: `${DIR}/bath-robes/new-waffle-back.jpg`, alt: "White waffle-weave bath robe, back" },
  { src: `${DIR}/bath-robes/new-slippers.jpg`, alt: "Pair of white terry hotel slippers" },
];

/**
 * The photographs of each BATH ROBE on the client's BATHROBE sheet, keyed by the
 * product's slug in lib/health-care-sheet.ts. The two standard sizes of a collar
 * share a pair of shots (front and back), because the supplied photographs do
 * not show a size.
 */
const robePair = (front: string, back: string, what: string): Shot[] => [
  { src: `${DIR}/bath-robes/${front}.jpg`, alt: `${what}, front` },
  { src: `${DIR}/bath-robes/${back}.jpg`, alt: `${what}, back` },
];

const KIMONO_ROBE = robePair("new-kimono-front", "new-kimono-back", "White terry kimono bath robe");
const SHAWL_ROBE = robePair("new-shawl-front", "new-shawl-back", "White terry shawl-collar bath robe");

export const BATH_ROBE_PRODUCT_PHOTOS: Record<string, Shot[]> = {
  "standard-terry-robe-kimono": KIMONO_ROBE,
  "standard-terry-robe-shawl": SHAWL_ROBE,
  "waffle-robe": [
    { src: `${DIR}/bath-robes/new-waffle-shawl.jpg`, alt: "White waffle-weave bath robe, front" },
    { src: `${DIR}/bath-robes/new-waffle-back.jpg`, alt: "White waffle-weave bath robe, back" },
  ],
  "honeycomb-robe": robePair("new-honeycomb-front", "new-honeycomb-back", "White honeycomb bath robe"),
};

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

const ECONOMY_BATH_TOWEL: Shot[] = [
  { src: `${DIR}/economy-bath-towels/single-cam-front.jpg`, alt: "Stack of white single cam bath towels" },
  { src: `${DIR}/economy-bath-towels/double-cam-front.jpg`, alt: "Stack of white double cam bath towels" },
  { src: `${DIR}/economy-bath-towels/single-cam-stack.jpg`, alt: "White single cam bath towels, folded in a stack" },
  { src: `${DIR}/economy-bath-towels/double-cam-stack.jpg`, alt: "White double cam bath towels, folded in a stack" },
  { src: `${DIR}/economy-bath-towels/single-cam-top.jpg`, alt: "White single cam bath towel from above, showing the cam border" },
  { src: `${DIR}/economy-bath-towels/double-cam-top.jpg`, alt: "White double cam bath towel from above, showing the double cam border" },
  { src: `${DIR}/economy-bath-towels/single-cam-22-front.jpg`, alt: "Stack of white single cam bath towels, smaller size" },
  { src: `${DIR}/economy-bath-towels/single-cam-angle.jpg`, alt: "White single cam bath towels stacked, seen from an angle" },
];

const APRONS: Shot[] = [
  { src: `${DIR}/aprons/black-front-new.jpg`, alt: "Black bib apron with pocket, front", colour: "Black" },
  { src: `${DIR}/aprons/white-front.jpg`, alt: "White bib apron with pocket, front", colour: "White" },
  { src: `${DIR}/aprons/black-back-new.jpg`, alt: "Black bib apron, back, with tied waist bow", colour: "Black" },
  { src: `${DIR}/aprons/white-back.jpg`, alt: "White bib apron, back, with tied waist bow", colour: "White" },
  { src: `${DIR}/aprons/black-1.jpg`, alt: "Black bib apron, front", colour: "Black" },
  { src: `${DIR}/aprons/black-2.jpg`, alt: "Black bib apron, side", colour: "Black" },
];

const TABLE_CLOTH: Shot[] = [
  { src: `${DIR}/table-cloth/colourful.jpg`, alt: "Folded table cloths in red, cream, tan, green, blue, black and white" },
  { src: `${DIR}/table-cloth/black-1.jpg`, alt: "Stack of folded black table cloths", colour: "Black" },
  { src: `${DIR}/table-cloth/black-2.jpg`, alt: "Folded black table cloths, one opened out", colour: "Black" },
];

const FLOUR_SACK: Shot[] = [
  { src: `${DIR}/flour-sack/a.jpg`, alt: "Stack of folded flour sack towels" },
  { src: `${DIR}/flour-sack/b.jpg`, alt: "Flour sack towels folded in a pile" },
  { src: `${DIR}/flour-sack/c.jpg`, alt: "Tall stack of flour sack towels" },
];

// Bath Sheet is made in White and Beige on the salon sheet. A shows both.
const BATH_SHEET: Shot[] = [
  { src: `${DIR}/bath-sheet/a.jpg`, alt: "Stacks of white and beige bath sheets" },
  { src: `${DIR}/bath-sheet/c.jpg`, alt: "Stack of white bath sheets", colour: "White" },
  { src: `${DIR}/bath-sheet/b.jpg`, alt: "Stack of beige bath sheets", colour: "Beige" },
];

const SPA_SHEET: Shot[] = [
  { src: `${DIR}/spa-sheet/plain.jpg`, alt: "Folded white spa sheet" },
  { src: `${DIR}/spa-sheet/a.jpg`, alt: "White spa sheet with its edge folded back" },
  { src: `${DIR}/spa-sheet/c.jpg`, alt: "Hemmed corner of a white spa sheet" },
];

const DUVET_COVERS = `${DIR}/duvet-cover`;

const DUVET_PLAIN: Shot[] = [
  { src: `${DUVET_COVERS}/plain-folded.jpg`, alt: "Folded white duvet cover" },
  { src: `${DUVET_COVERS}/plain-neat.jpg`, alt: "Neatly folded white duvet cover" },
  { src: `${DUVET_COVERS}/plain-rolled.jpg`, alt: "Neatly rolled white duvet cover" },
];

const DUVET_STRIPE: Shot[] = [
  { src: `${DUVET_COVERS}/stripe-folded.jpg`, alt: "Folded white satin-stripe duvet cover" },
  { src: `${DUVET_COVERS}/stripe-hotel.jpg`, alt: "White satin-stripe hotel bedding, folded" },
  { src: `${DUVET_COVERS}/stripe-stack.jpg`, alt: "Stack of white satin-stripe duvet covers" },
];

const MATTRESS_PROTECTORS = `${DIR}/mattress-protector`;

const MATTRESS_PROTECTOR: Shot[] = [
  { src: `${MATTRESS_PROTECTORS}/rolled.jpg`, alt: "Quilted white mattress protector, folded" },
  { src: `${MATTRESS_PROTECTORS}/folded.jpg`, alt: "Quilted white mattress protector, folded in thirds" },
  { src: `${MATTRESS_PROTECTORS}/closeup.jpg`, alt: "Close-up of a quilted mattress protector corner with its elastic strap" },
];

const MATTRESS_PROTECTOR_CARDS: Shot[] = [1, 2, 3].map((n) => ({
  src: `${MATTRESS_PROTECTORS}/card-${n}.jpg`,
  alt: MATTRESS_PROTECTOR[n - 1].alt,
}));

const PILLOW_PROTECTORS = `${DIR}/pillow-protector`;

const PILLOW_PROTECTOR: Shot[] = [
  { src: `${PILLOW_PROTECTORS}/pair-a.jpg`, alt: "Pair of white pillows in protectors" },
  { src: `${PILLOW_PROTECTORS}/pair-c.jpg`, alt: "Two white pillow protectors stacked" },
  { src: `${PILLOW_PROTECTORS}/zip.jpg`, alt: "White pillow protector with its zip partly open" },
];

const PILLOW_PROTECTOR_CARDS: Shot[] = [1, 2, 3].map((n) => ({
  src: `${PILLOW_PROTECTORS}/card-${n}.jpg`,
  alt: PILLOW_PROTECTOR[n - 1].alt,
}));

const FLAT_SHEETS = `${DIR}/flat-sheets`;

const FLAT_SHEET_SOLID: Shot[] = [
  { src: `${FLAT_SHEETS}/solid-folded.jpg`, alt: "Folded white solid flat sheet" },
  { src: `${FLAT_SHEETS}/solid-hem.jpg`, alt: "Stitched hem at the corner of a white flat sheet" },
];

const FLAT_SHEET_STRIPE: Shot[] = [
  { src: `${FLAT_SHEETS}/stripe-folded.jpg`, alt: "Folded white satin stripe flat sheet" },
  {
    src: `${FLAT_SHEETS}/stripe-hem.jpg`,
    alt: "Stitched hem at the corner of a white satin stripe flat sheet",
  },
];

const FITTED_SHEETS = `${DIR}/fitted-sheets`;

const FITTED_SHEET: Shot[] = [
  { src: `${FITTED_SHEETS}/folded.jpg`, alt: "Folded white fitted sheet" },
  { src: `${FITTED_SHEETS}/elastic.jpg`, alt: "Elasticated edge of a white fitted sheet" },
];

const PILLOW_CASES = `${DIR}/pillow-case`;

const PILLOW_CASE_PLAIN: Shot[] = [
  { src: `${PILLOW_CASES}/plain-pair.jpg`, alt: "Two pillows in white plain pillow cases" },
  { src: `${PILLOW_CASES}/plain-stacked.jpg`, alt: "Two white pillow cases stacked flat" },
  { src: `${PILLOW_CASES}/plain-flat.jpg`, alt: "White pillow cases laid flat, showing the hem" },
];

// The easy-fit shot belongs here only: the sheet gives this row the EZ Fit hem,
// and the plain rows an open end.
const PILLOW_CASE_STRIPE: Shot[] = [
  { src: `${PILLOW_CASES}/stripe-pair.jpg`, alt: "Two pillows in white satin stripe pillow cases" },
  { src: `${PILLOW_CASES}/stripe-single.jpg`, alt: "A pillow in a white satin stripe pillow case" },
  {
    src: `${PILLOW_CASES}/stripe-easy-fit.jpg`,
    alt: "Satin stripe pillow cases with a close-up of the easy-fit side opening",
  },
];

/**
 * Bed Linen's own shots, keyed by product slug in lib/bed-linen.ts.
 *
 * `card` is the listing's picture and `gallery` the product page's. Rows of
 * one look share a gallery and differ only by their card, as the client
 * supplied them. The client's card pictures are not labelled by row, so they
 * follow the sheet's order, with the stripe picture on the stripe row.
 *
 * NOT THE SQUARE TREATMENT ABOVE: a card picture is a room scene already
 * cropped to the card's 4:5 around its subject, because the card's centre crop
 * would cut the maid or the sheet. A gallery shot is already 4:3.
 */
export const BED_LINEN_PHOTOS: Record<string, { card: Shot; gallery: Shot[] }> = {
  "flat-sheet-t200-solid-55-45": {
    card: {
      src: `${FLAT_SHEETS}/card-1.jpg`,
      alt: "Housekeeper carrying folded white flat sheets in a hotel room",
    },
    gallery: FLAT_SHEET_SOLID,
  },
  "flat-sheet-t250-solid-55-45": {
    card: {
      src: `${FLAT_SHEETS}/card-2.jpg`,
      alt: "Housekeeper smoothing a white flat sheet over a hotel bed",
    },
    gallery: FLAT_SHEET_SOLID,
  },
  "flat-sheet-t200-solid-60-40": {
    card: {
      src: `${FLAT_SHEETS}/card-3.jpg`,
      alt: "Gloved hands setting a folded white flat sheet on a bed",
    },
    gallery: FLAT_SHEET_SOLID,
  },
  "flat-sheet-t250-solid-60-40": {
    card: {
      src: `${FLAT_SHEETS}/card-4.jpg`,
      alt: "Housekeeper in white gloves smoothing a flat sheet across a bed",
    },
    gallery: FLAT_SHEET_SOLID,
  },
  "flat-sheet-t210-poly-modal": {
    card: {
      src: `${FLAT_SHEETS}/card-5.jpg`,
      alt: "Housekeeper spreading a white flat sheet over a bed",
    },
    gallery: FLAT_SHEET_SOLID,
  },
  "flat-sheet-t300-solid-60-40": {
    card: {
      src: `${FLAT_SHEETS}/card-6.jpg`,
      alt: "Housekeeper carrying a stack of white flat sheets through a hotel suite",
    },
    gallery: FLAT_SHEET_SOLID,
  },
  "flat-sheet-t300-satin-stripes": {
    card: {
      src: `${FLAT_SHEETS}/card-stripe.jpg`,
      alt: "Housekeeper laying a white satin stripe flat sheet on a bed",
    },
    gallery: FLAT_SHEET_STRIPE,
  },
  "fitted-sheet-t200-55-45": {
    card: {
      src: `${FITTED_SHEETS}/card-1.jpg`,
      alt: "Housekeeper checking the elastic edge of a white fitted sheet",
    },
    gallery: FITTED_SHEET,
  },
  "fitted-sheet-t200-60-40": {
    card: {
      src: `${FITTED_SHEETS}/card-2.jpg`,
      alt: "Housekeeper fitting a white sheet over the corner of a mattress",
    },
    gallery: FITTED_SHEET,
  },
  "fitted-sheet-t300-55-45": {
    card: {
      src: `${FITTED_SHEETS}/card-3.jpg`,
      alt: "Housekeeper smoothing a white fitted sheet across a bed",
    },
    gallery: FITTED_SHEET,
  },
  "pillow-case-t200-percale-55-45": {
    card: {
      src: `${PILLOW_CASES}/card-1.jpg`,
      alt: "Room attendant holding a pillow in a white pillow case",
    },
    gallery: PILLOW_CASE_PLAIN,
  },
  "pillow-case-t250-percale-60-40": {
    card: {
      src: `${PILLOW_CASES}/card-2.jpg`,
      alt: "Room attendant setting a white pillow against a headboard",
    },
    gallery: PILLOW_CASE_PLAIN,
  },
  "pillow-case-t300-plain-60-40": {
    card: {
      src: `${PILLOW_CASES}/card-3.jpg`,
      alt: "Room attendant placing a white pillow on a made hotel bed",
    },
    gallery: PILLOW_CASE_PLAIN,
  },
  "pillow-case-t300-satin-stripes": {
    card: {
      src: `${PILLOW_CASES}/card-stripe.jpg`,
      alt: "Housekeeper arranging satin stripe pillow cases on a hotel bed",
    },
    gallery: PILLOW_CASE_STRIPE,
  },
  // Duvet cover. The client's three room-scene thumbnails are unlabelled, so
  // they follow the sheet's order with the stripe scene on the stripe row.
  "duvet-cover-t200-plain": {
    card: {
      src: `${DUVET_COVERS}/card-1.jpg`,
      alt: "Housekeeper shaking out a white duvet cover in a hotel room",
    },
    gallery: DUVET_PLAIN,
  },
  "duvet-cover-t300-plain": {
    card: {
      src: `${DUVET_COVERS}/card-2.jpg`,
      alt: "Housekeeper dressing a hotel bed with a white duvet cover",
    },
    gallery: DUVET_PLAIN,
  },
  "duvet-cover-t300-satin-stripes": {
    card: {
      src: `${DUVET_COVERS}/card-stripe.jpg`,
      alt: "Housekeeper making a hotel bed with a white satin-stripe duvet cover",
    },
    gallery: DUVET_STRIPE,
  },
  "mattress-protector": { card: MATTRESS_PROTECTOR_CARDS[0], gallery: MATTRESS_PROTECTOR },
  "pillow-protector": { card: PILLOW_PROTECTOR_CARDS[0], gallery: PILLOW_PROTECTOR },
};

/**
 * Photographs per Hospitality line, keyed by the line's slug in
 * lib/hospitality.ts. For Food & Beverage that slug is also the family slug in
 * lib/food-beverage.ts, and for Spa Salon the product slug in lib/spa-salon.ts,
 * so the range pages look up by the same key.
 */
export const LINE_PHOTOS: Record<string, Shot[]> = {
  // Bed Linen. The family's own product photographs, so the range card and the family
  // page cannot show different sheets.
  "flat-sheets": [
    BED_LINEN_PHOTOS["flat-sheet-t200-solid-55-45"].gallery[0],
    BED_LINEN_PHOTOS["flat-sheet-t210-poly-modal"].gallery[0],
    BED_LINEN_PHOTOS["flat-sheet-t300-satin-stripes"].gallery[0],
  ],
  "fitted-sheets": [
    BED_LINEN_PHOTOS["fitted-sheet-t200-60-40"].gallery[0],
    BED_LINEN_PHOTOS["fitted-sheet-t200-55-45"].gallery[0],
    BED_LINEN_PHOTOS["fitted-sheet-t300-55-45"].gallery[0],
  ],
  "pillow-case": [
    BED_LINEN_PHOTOS["pillow-case-t200-percale-55-45"].gallery[0],
    BED_LINEN_PHOTOS["pillow-case-t250-percale-60-40"].gallery[0],
    BED_LINEN_PHOTOS["pillow-case-t300-satin-stripes"].gallery[0],
  ],

  "duvet-cover": [
    BED_LINEN_PHOTOS["duvet-cover-t200-plain"].gallery[0],
    BED_LINEN_PHOTOS["duvet-cover-t300-plain"].gallery[0],
    BED_LINEN_PHOTOS["duvet-cover-t300-satin-stripes"].gallery[0],
  ],
  "mattress-protector": MATTRESS_PROTECTOR,
  "pillow-protector": PILLOW_PROTECTOR,

  // Bath Linen
  "terry-towels": TERRY,
  "bath-robes": BATH_ROBES,
  "bath-mats": BATH_MATS,
  "economy-bath-towels": ECONOMY_BATH_TOWEL,

  // Table Linen. These three are the same products as their Food & Beverage
  // namesakes (see the note on the Table Linen group), so the same shots.
  "bistro-napkins": BISTRO_NAPKIN,
  "momi-napkins": MOMMIE_NAPKIN,
  "polyester-napkin": NAPKINS,
  "table-cloths": TABLE_CLOTH,

  // Food & Beverage
  "bar-mop": BAR_MOP,
  "kitchen-towel": KITCHEN_TOWEL,
  "glass-towel": GLASS_TOWEL,
  "bistro-napkin": BISTRO_NAPKIN,
  "mommie-napkin": MOMMIE_NAPKIN,
  aprons: APRONS,
  napkins: NAPKINS,
  "napkins-spun-polyester": NAPKINS,
  // The Napkin line's card: one shot of each of its three products.
  napkin: [BISTRO_NAPKIN[0], MOMMIE_NAPKIN[0], NAPKINS[0]],
  "flour-sack": FLOUR_SACK,
  "table-cloth": TABLE_CLOTH,

  // Spa Salon
  "salon-towel": SALON_TOWEL,
  "bath-sheet": BATH_SHEET,
  "spa-sheet": SPA_SHEET,
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
