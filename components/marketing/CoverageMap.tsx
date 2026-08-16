import { Check } from "lucide-react";
import { CoverageMapGraphic } from "@/components/marketing/CoverageMapGraphic";
import { Reveal } from "@/components/animation/Reveal";
import { SplitReveal } from "@/components/animation/SplitReveal";

/**
 * Coverage/reach section (FR-007e): descriptive text next to a map graphic
 * communicating service area and manufacturing reach.
 *
 * BALANCE — the two columns are told to match height rather than left to find
 * their own. The copy column is the taller of the two and sets the height; the
 * map card stretches to meet it and centres the graphic in whatever space that
 * leaves (`my-auto` on the map, `justify-between` on the card). An earlier
 * version had `self-start` on the card, so it stopped ~130px short of the copy
 * and the section read as two unrelated blocks that happened to be side by side.
 *
 * The 5/7 split is deliberate — an even 6/6 centred split is the single most
 * template-looking layout there is, and the map wants the wider half because it
 * is the thing with detail in it.
 */

const POINTS_LIST = [
  "Direct supply from trusted manufacturers and specialists",
  "Dedicated production lines for consistent, contract manufacturing",
  "Custom solutions built around your specific needs",
];

export function CoverageMap() {
  return (
    <section id="coverage" className="bg-background py-20 sm:py-28 lg:py-32">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-stretch gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Copy column — sets the height for the row. */}
          <div className="flex flex-col lg:col-span-5">
            <Reveal variant="fade-up">
              <p className="text-premium-alt text-xs font-semibold tracking-[0.22em] uppercase">
                How We Work
              </p>
            </Reveal>

            {/* Larger and tighter than the old 3xl/5xl ramp: this is a section
                heading on a quiet ivory background with nothing competing for
                attention, so it can afford the weight. */}
            <SplitReveal
              as="h2"
              text="Built to Scale, Delivered with Care"
              variant="mask-lines"
              className="font-heading mt-5 text-4xl leading-[1.04] font-semibold tracking-[-0.015em] text-balance sm:text-5xl lg:text-[3.25rem]"
            />

            <Reveal variant="fade-up" delay={0.1}>
              {/* max-w in ch, not px — caps the measure at a readable ~62
                  characters regardless of the font size the viewport lands on. */}
              <p className="text-muted-foreground mt-7 max-w-[46ch] text-[1.0625rem] leading-[1.75]">
                Whether you need one case or a full truckload, we manufacture and source textiles
                the same way: carefully, consistently and priced fairly for businesses of every
                size. We work directly with trusted manufacturers and maintain our own production
                partnerships, so every order meets the same standard, no matter how big your
                business grows.
              </p>
            </Reveal>

            {/* Hairline-separated rows rather than a bulleted list — reads as a
                spec sheet, which is what this content actually is. */}
            <Reveal
              variant="fade-up"
              stagger
              staggerAmount={0.07}
              as="ul"
              className="border-premium/30 mt-10 border-t"
            >
              {POINTS_LIST.map((point) => (
                <li
                  key={point}
                  className="border-premium/15 group flex items-center gap-4 border-b py-[1.15rem]"
                >
                  {/* Outlined ring rather than a filled blue disc. Four solid
                      dots down the left edge was the heaviest thing in the
                      column and pulled focus off the text they label. */}
                  <span
                    aria-hidden
                    className="border-primary/35 text-primary group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground grid size-6 shrink-0 place-items-center rounded-full border transition-colors duration-300 ease-[var(--ease-out)]"
                  >
                    <Check className="size-3.5" strokeWidth={2.5} />
                  </span>
                  <span className="text-foreground/90 text-[0.9375rem] leading-snug sm:text-base">
                    {point}
                  </span>
                </li>
              ))}
            </Reveal>
          </div>

          {/* Map card — stretches to the copy column's height. */}
          {/* Dark card on the section's ivory background — deliberately the one
              dark object here. The map is the only element in this section made
              of light (glowing markers, lit routes, a lit landmass), and none of
              that is possible on a white card: a halo needs something to be a
              halo against. Navy is already the site's dark surface, so this
              reads as the hero and footer treatment, not a new theme.

              `isolate` matters — the ambient glow below is a blurred absolute
              child, and without a stacking context it bleeds over the ivory
              section outside the card's rounded corners. */}
          <Reveal variant="scale" className="flex lg:col-span-7">
            <figure className="relative isolate flex w-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(158deg,#0E3357_0%,#08203A_46%,#04101D_100%)] p-6 shadow-[0_30px_70px_-40px_rgb(10_37_64/0.85),0_0_0_1px_rgb(79_179_255/0.08)] sm:p-8">
              {/* Ambient light, sitting behind everything in the card. Two
                  sources rather than one: a cool key light behind the map and a
                  much weaker gold fill in the corner, which keeps the navy from
                  going flat blue and ties the card to the section's palette. */}
              <span
                aria-hidden
                className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-[34rem] -translate-x-1/2 rounded-full bg-[#0b97ff]/22 blur-[90px]"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -right-20 -bottom-24 -z-10 h-56 w-72 rounded-full bg-[#C9A84C]/12 blur-[80px]"
              />

              <figcaption className="flex items-baseline justify-between gap-4">
                <span className="font-heading text-ivory text-base font-semibold">
                  Distribution Network
                </span>
                <span className="text-xs tracking-[0.14em] text-[#7FC7FF] uppercase">
                  6 regions
                </span>
              </figcaption>

              {/* my-auto centres the graphic in whatever height the copy column
                  dictates, so a taller row pads evenly above and below rather
                  than leaving the map stranded at the top. */}
              <div className="my-auto py-8 sm:py-10">
                <CoverageMapGraphic />
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-5">
                <span className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="size-2 rounded-full bg-[#F6E7B4] shadow-[0_0_10px_2px_rgb(201_168_76/0.75)]"
                  />
                  <span className="text-ivory/80 text-sm">Warehouse &amp; Distribution</span>
                </span>
                <span className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="h-px w-5 bg-[#D9BC6B] shadow-[0_0_8px_1px_rgb(201_168_76/0.6)]"
                  />
                  <span className="text-ivory/80 text-sm">Manufacturing Partner Network</span>
                </span>
                {/* /72, not /55. On the old ivory card this hint was a soft
                    grey and fine; carried straight over to navy it measured
                    3.59:1 at 12px, where AA wants 4.5. */}
                <span className="text-ivory/72 text-xs">Hover a marker for regional detail</span>
              </div>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
