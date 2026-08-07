import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Reveal } from "@/components/animation/Reveal";
import { SplitReveal } from "@/components/animation/SplitReveal";
import { FocusGroup } from "@/components/marketing/FocusGroup";
import { Button } from "@/components/ui/button";

/**
 * Product collection (FR-007b): intro copy above a grid of visual tiles, each
 * linking into the catalog. Replaces the earlier "What We Make" showcase.
 *
 * Layout is a true masonry built from CSS grid spans, not a column-packing
 * library: two tall tiles anchor the left and right edges, wide tiles bridge
 * the middle, and normal auto-placement fills the rest. Order in PRODUCTS is
 * therefore load-bearing — reordering it changes the packing.
 *
 * The tiles carry their label ON the image here, which is what the approved
 * reference shows. That works because every tile is a photograph with a
 * dedicated scrim underneath the text, not a flat colour block.
 *
 * Every photograph is WHITE goods, deliberately — this is a linen range. Each
 * tile then carries its own colour as a TINT over that photograph, restoring
 * the palette the grid had before the photos went in.
 *
 * WHY THE TINT IS `mix-blend-mode: color` AND NOT A TRANSLUCENT OVERLAY. That
 * blend mode takes hue and saturation from the tint and keeps LUMINANCE from
 * the photograph underneath — so every fold, shadow and thread of the weave
 * survives at full strength and only the colour changes. A plain overlay at the
 * same strength would wash out exactly the detail that makes these read as
 * fabric. The tint also fades back on hover, so pointing at a tile shows the
 * true colour of the goods.
 *
 * The caption scrim is load-bearing rather than decorative: white text over a
 * near-white photograph is unreadable without it. See the caption note below,
 * and re-measure contrast if any image or palette is changed.
 *
 * NOTE ON SOURCING: these are stock photographs (Unsplash licence — commercial
 * use, no attribution required). They are stand-ins for the company's own
 * product photography, not pictures of Souwel goods. Replace before launch.
 */

type Product = {
  name: string;
  tagline: string;
  href: string;
  /** Photograph in public/images/products. All white — this is a linen range. */
  image: string;
  /** Describes the photo for assistive tech. */
  alt: string;
  /** Tint ramp, light -> mid -> dark. Blended over the photo; see the note above. */
  palette: [string, string, string];
  /** Grid placement at lg and up. Order in this array drives the packing. */
  span?: string;
};

const PRODUCTS: Product[] = [
  {
    name: "Napkins",
    tagline: "Elegant & durable",
    href: "/categories/hospitality",
    image: "/images/products/napkins.jpg",
    alt: "Folded white linen napkin fabric in soft light",
    palette: ["#7C9BBE", "#1B3A5C", "#08152A"],
    span: "lg:row-span-3",
  },
  {
    name: "Bed Sheets",
    tagline: "Soft & comfortable",
    href: "/categories/hospitality",
    image: "/images/products/bed-sheets.jpg",
    alt: "Bed made up in white sheets and pillows",
    palette: ["#C99098", "#7A2233", "#3E0B16"],
    span: "lg:col-span-2",
  },
  {
    name: "Pillow Covers",
    tagline: "Stylish & soft",
    href: "/categories/hospitality",
    image: "/images/products/pillow-covers.jpg",
    alt: "White pillows on a made bed",
    palette: ["#F4ECDD", "#C6B69C", "#8A7A63"],
  },
  {
    name: "Industrial Aprons",
    tagline: "Strong & reliable",
    href: "/categories/institutional-laundry",
    image: "/images/products/industrial-aprons.jpg",
    alt: "White workwear textile laid flat",
    palette: ["#ADB98C", "#4A5C2F", "#232B14"],
  },
  {
    name: "Duvet Covers",
    tagline: "Soft & breathable",
    href: "/categories/hospitality",
    image: "/images/products/duvet-covers.jpg",
    alt: "White duvet cover draped across a bed",
    palette: ["#E6D5B8", "#A08761", "#5A4229"],
  },
  {
    // Slate rather than the natural white real bar mops come in: this is the
    // tall right-hand tile and it sits directly beside the near-white Towels
    // tile — two pale blocks side by side merge into one shape and the grid
    // loses its right-edge anchor.
    name: "Bar Mops",
    tagline: "Absorbent & hard-wearing",
    href: "/categories/institutional-laundry",
    image: "/images/products/bar-mops.jpg",
    alt: "Rolled white cotton bar mops stacked together",
    palette: ["#9DAEB9", "#44545F", "#1B242B"],
    span: "lg:row-span-2",
  },
  {
    name: "Towels",
    tagline: "Soft & absorbent",
    href: "/categories/hospitality",
    image: "/images/products/towels.jpg",
    alt: "Stack of folded white towels",
    palette: ["#FBF8F3", "#CFC9BE", "#968F84"],
    span: "lg:col-span-2",
  },
  {
    name: "Other Textile & Linen",
    tagline: "Made to specification",
    href: "/categories/health-care",
    image: "/images/products/other-textile.jpg",
    alt: "Close-up of plain white woven textile",
    palette: ["#DEC489", "#8A6E2C", "#43350F"],
    span: "lg:col-span-4",
  },
];

export function ProductCollection() {
  return (
    // data-focus-scope marks this section as the one focus mode does NOT blur
    // wholesale — inside it, the intro and CTA opt in individually and the
    // hovered tile stays sharp. See the focus-mode block in globals.css.
    <section data-focus-scope className="bg-background py-20 sm:py-28 lg:py-32">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Centred intro — the surrounding sections all run flush left, so this
            reads as a deliberate change of pace rather than a default. */}
        <div data-focus-dim className="mx-auto max-w-3xl text-center">
          <Reveal variant="fade-up">
            <p className="text-premium text-xs font-semibold tracking-[0.22em] uppercase">
              Our Product Collection
            </p>
          </Reveal>

          {/* Line-by-line rise. The heading wraps to two lines at most widths,
              so `lines` reads as a deliberate two-beat entrance where `words`
              would just look busy at this size. */}
          <SplitReveal
            as="h2"
            text="Premium Linens for Every Need"
            variant="mask-lines"
            className="font-heading mt-5 text-4xl leading-[1.08] font-semibold text-balance sm:text-5xl"
          />

          <Reveal variant="fade-up" delay={0.15}>
            <p className="text-muted-foreground mt-6 text-lg leading-relaxed text-pretty">
              Explore our premium range of high-quality linens designed for homes, hotels,
              restaurants, hospitals, and industrial use. Crafted for comfort, durability, and
              professional excellence.
            </p>
          </Reveal>
        </div>

        {/* Masonry. One column on mobile, two on tablet, and the full spanned
            arrangement only from lg — the spans need four columns to resolve. */}
        {/* `stagger` puts each tile on its own ScrollTrigger via
            ScrollTrigger.batch — see Reveal. On a grid this tall that is the
            difference between the bottom row animating when it is reached and
            it having finished three screens earlier. */}
        <FocusGroup>
          <Reveal
            variant="fade-up"
            stagger
            batch
            className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:auto-rows-[13rem] lg:grid-cols-4 lg:gap-5"
          >
            {PRODUCTS.map((product) => (
              <Link
                key={product.name}
                href={product.href}
                data-focus-tile
                style={{ "--glow": "#C9A84C" } as React.CSSProperties}
                // aspect-[4/3] sizes the tile below lg, where there are no row
                // spans; from lg the grid rows drive height instead.
                // The lift, scale, shadow and transition all live in the CSS
                // focus-mode rules so that hovering a tile and dimming the rest of
                // the page are driven by one piece of state, not two.
                className={`group card-glow focus-visible:ring-ring relative isolate flex aspect-[4/3] flex-col overflow-hidden rounded-2xl border border-transparent focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none lg:aspect-auto ${product.span ?? ""}`}
              >
                {/* Zoom lives on this wrapper, not the tile, so the tile's own
                  rounded corners keep clipping the image as it scales. */}
                {/* 1.04, not the old 1.06: the tile itself now scales 1.06 in
                  focus mode, and the two multiply — 1.06 inside 1.06 zoomed the
                  artwork by 12% and the crop started to show. */}
                <div className="absolute inset-0 transition-transform duration-[600ms] ease-[var(--ease-out)] group-hover:scale-[1.04]">
                  <Image
                    src={product.image}
                    alt={product.alt}
                    fill
                    // Tiles span one to four columns of a max-w-7xl grid.
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center"
                  />
                </div>

                {/* The colour. `mix-blend-color` keeps the photograph's own
                  luminance and replaces only its hue, so the weave, the folds
                  and the light on them all survive intact — see the note at the
                  top of the file. Kept at 55% rather than full so the goods stay
                  legibly white-ish underneath, and dropped to 25% on hover so
                  pointing at a tile shows the product's true colour.

                  This span is painted BEFORE the washes and the caption below
                  it, which is what keeps those out of the blend — a blend mode
                  only affects the backdrop already painted beneath it. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-55 mix-blend-color transition-opacity duration-500 ease-[var(--ease-out)] group-hover:opacity-25"
                  style={{
                    backgroundImage: `linear-gradient(155deg, ${product.palette[0]}, ${product.palette[1]} 55%, ${product.palette[2]})`,
                  }}
                />

                {/* Depth wash over the whole tile, in the tile's own dark stop
                  rather than black — black flattened the tint back out. Weak by
                  design: the photographs are white goods, and stacked with the
                  caption scrim below, a heavier wash crushed the bottom half of
                  every tile until the product itself stopped being visible,
                  which rather defeats a product grid. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `linear-gradient(to top, ${product.palette[2]}, transparent 62%)`,
                  }}
                />

                {/* The label carries its own scrim, sized to the label rather
                  than to the tile. A single tile-wide gradient cannot do this
                  job: tiles range from 208px to 664px tall, so any fixed
                  colour-stop lands in a different place on each one.

                  MEASURE THIS, DO NOT EYEBALL IT. An earlier pass weakened this
                  scrim to black/72-38 on a reading of 21:1 — but that number
                  came from the darkest pixels at the very bottom edge, not from
                  the pixels actually behind the glyphs. Measured properly (hide
                  the text, sample the lightest 5% of the rect it occupied) that
                  scrim was 2.6:1 on the Pillow Covers tile, failing AA outright.
                  The values below measure 5.0:1 on the name and 7.4:1 on the
                  tagline at worst across all eight tiles.

                  The ramp is short and starts halfway up the caption box, so the
                  darkness is spent on the text band and the product above it
                  stays visible — which is what the earlier pass was right to
                  care about, even though it fixed it in the wrong place. */}
                <span className="relative mt-auto flex w-full flex-col bg-gradient-to-t from-black/90 via-black/62 via-50% to-transparent p-5 pt-14 sm:p-6 sm:pt-16">
                  <span className="font-heading text-ivory text-xl font-semibold sm:text-[1.35rem]">
                    {product.name}
                  </span>
                  <span className="text-ivory/85 mt-1.5 inline-flex items-center gap-2 text-sm">
                    {product.tagline}
                    <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </span>
              </Link>
            ))}
          </Reveal>
        </FocusGroup>

        <Reveal variant="scale" className="mt-12 flex justify-center" data-focus-dim>
          <Button
            asChild
            size="lg"
            className="bg-premium hover:bg-premium/90 glow-ring-gold h-12 rounded-full px-8 text-base font-semibold text-[#0A2540]"
          >
            <Link href="/categories/hospitality">
              View All Products
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
