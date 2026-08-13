"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/animation/gsap";
import { CATEGORIES } from "@/lib/site-config";
import { Button } from "@/components/ui/button";

/**
 * Category carousel (FR-007c) — infinite coverflow.
 *
 * Cards are absolutely stacked on a shared 3D stage. Each one's position is
 * derived from its *wrapped* distance to the active index, so advancing past
 * the last card rolls straight back to the first with no rewind and no clones.
 *
 * GSAP OWNS THE CARD TRANSFORMS, not CSS transitions. Four properties had to
 * move together on every step (x, z, scale, rotateY, opacity, blur) and a CSS
 * transition runs each on its own curve from whatever value it happens to hold.
 * Interrupt it mid-flight — which auto-rotation does constantly — and the card
 * arrives with its scale settled but its rotation still catching up. One
 * timeline per step keeps them locked to a single eased motion.
 *
 * WHY THE SIDE CARDS ARE NOT NEARLY INVISIBLE. They used to sit at 0.55 opacity
 * behind a 1.5px blur, on a flat platinum band, holding photographs of white
 * linen. Three pale things stacked reads as empty space, and the section looked
 * like one card floating in a grey void. The neighbours now stay legible and
 * the stage carries its own depth, so the row reads as a layered set.
 *
 * WHY EACH IMAGE IS TINTED. The category photographs are genuinely full colour,
 * but their subject is white fabric on a white card — there is nothing to see.
 * The accent wash (multiply, so it colours the whites rather than veiling them)
 * is what makes the four cards distinguishable at a glance.
 *
 * Auto-rotation pauses on hover and on keyboard focus, so nobody loses a card
 * mid-read. Reduced motion: no auto-rotation, no drift, no tilt — cards snap to
 * position and the arrows still work, so the content stays fully reachable.
 */

const ROTATE_MS = 4200;
const STEP_S = 0.72;

/** Lint-safe media query read (no setState inside an effect body). */
function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false // server snapshot — assume desktop, no motion preference
  );
}

export function CategoryCarousel() {
  const count = CATEGORIES.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const isNarrow = useMediaQuery("(max-width: 767px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const orbA = useRef<HTMLSpanElement>(null);
  const orbB = useRef<HTMLSpanElement>(null);
  const ghostNumber = useRef<HTMLSpanElement>(null);

  const go = useCallback((dir: 1 | -1) => setActive((a) => (a + dir + count) % count), [count]);

  useEffect(() => {
    if (paused || reducedMotion) return;

    const id = window.setInterval(() => {
      // Skip a beat while the tab is backgrounded — no queued jumps on return.
      if (document.visibilityState === "visible") {
        setActive((a) => (a + 1) % count);
      }
    }, ROTATE_MS);

    return () => window.clearInterval(id);
  }, [paused, reducedMotion, count]);

  /** Signed, wrapped distance from the active card: 0, ±1, then far. */
  const offsetOf = useCallback(
    (index: number) => {
      let d = (((index - active) % count) + count) % count;
      if (d > count / 2) d -= count;
      return d;
    },
    [active, count]
  );

  /**
   * Where a card sits, given its distance from centre.
   *
   * The neighbours are deliberately close and legible: `spread` is what decides
   * whether the stage reads as a set or as one card alone in a field.
   */
  const placement = useCallback(
    (d: number) => {
      const abs = Math.abs(d);
      const sign = Math.sign(d) || 1;
      // Wide enough that a neighbour's TEXT clears the hero card. Card edges
      // may still overlap — that is the coverflow read — but a heading running
      // underneath the centre card looks like a rendering fault, not depth.
      // At 23rem cards this needs roughly 94%; anything under ~80% clips words.
      const spread = isNarrow ? 76 : 94;
      const tilt = reducedMotion ? 0 : 24;

      if (abs === 0) {
        return {
          xPercent: -50,
          x: 0,
          z: 0,
          scale: 1,
          rotationY: 0,
          opacity: 1,
          blur: 0,
          zIndex: 30,
        };
      }

      if (abs === 1) {
        return {
          xPercent: -50,
          x: `${sign * spread}%`,
          z: -110,
          scale: isNarrow ? 0.86 : 0.9,
          rotationY: -sign * tilt,
          // Present, not ghostly. Mobile keeps one card the clear subject, so it
          // stays a little further back than desktop.
          opacity: isNarrow ? 0.55 : 0.78,
          blur: 0.6,
          zIndex: 20,
        };
      }

      // The card diametrically opposite. Kept faintly visible directly behind
      // the hero so the stack has a back edge rather than ending abruptly.
      return {
        xPercent: -50,
        x: 0,
        z: -320,
        scale: 0.74,
        rotationY: 0,
        opacity: 0.26,
        blur: 2,
        zIndex: 10,
      };
    },
    [isNarrow, reducedMotion]
  );

  /* Card choreography. Re-runs on every step; useGSAP reverts the previous
     tweens so interrupted motion is picked up from where it actually is. */
  useGSAP(
    () => {
      const reduce = prefersReducedMotion();

      CATEGORIES.forEach((_, index) => {
        const el = cards.current[index];
        if (!el) return;

        const p = placement(offsetOf(index));
        el.style.zIndex = String(p.zIndex);

        gsap.to(el, {
          xPercent: p.xPercent,
          x: p.x,
          z: p.z,
          scale: p.scale,
          rotationY: p.rotationY,
          opacity: p.opacity,
          filter: p.blur ? `blur(${p.blur}px)` : "blur(0px)",
          duration: reduce ? 0 : STEP_S,
          ease: "power3.out",
          overwrite: "auto",
        });
      });

      // The numeral is positioned by transform, so it needs placing even when
      // nothing is allowed to animate — otherwise reduced motion leaves it
      // sitting off-centre rather than simply still.
      if (ghostNumber.current) {
        gsap.set(ghostNumber.current, { xPercent: -50, yPercent: -50 });
      }

      if (reduce) return;

      // The active card's own detail: number and rule arrive just after the
      // card lands, so the eye follows the card first and the detail second.
      const current = cards.current[active];
      const number = current?.querySelector<HTMLElement>("[data-card='number']");
      const rule = current?.querySelector<HTMLElement>("[data-card='rule']");

      const tl = gsap.timeline({ delay: STEP_S * 0.45 });
      if (number) {
        tl.fromTo(
          number,
          { yPercent: 40, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.45, ease: "power2.out" },
          0
        );
      }
      if (rule) {
        tl.fromTo(
          rule,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.55, ease: "power2.out", transformOrigin: "left center" },
          0.05
        );
      }

      // The oversized numeral behind the stack re-settles with the step.
      if (ghostNumber.current) {
        tl.fromTo(
          ghostNumber.current,
          { opacity: 0, xPercent: -50, yPercent: -42 },
          { opacity: 1, xPercent: -50, yPercent: -50, duration: 0.7, ease: "power2.out" },
          0
        );
      }
    },
    { scope: stage, dependencies: [active, isNarrow, reducedMotion] }
  );

  /* Ambient drift on the background orbs. Mounted once, independent of the
     carousel step — a slow wander that keeps the panel from ever being a flat
     still image, at an amplitude low enough not to read as movement. */
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tweens: gsap.core.Tween[] = [];

      if (orbA.current) {
        tweens.push(
          gsap.to(orbA.current, {
            xPercent: 14,
            yPercent: -10,
            scale: 1.14,
            duration: 15,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          })
        );
      }
      if (orbB.current) {
        tweens.push(
          gsap.to(orbB.current, {
            xPercent: -12,
            yPercent: 12,
            scale: 1.1,
            duration: 19,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          })
        );
      }

      return () => tweens.forEach((t) => t.kill());
    },
    { scope: stage }
  );

  const activeAccent = CATEGORIES[active].accent;

  return (
    <section
      className="relative isolate overflow-hidden py-14 sm:py-16 lg:py-20"
      style={{
        // Layered rather than flat: a vertical wash from the page ground into
        // platinum and champagne. Built from semantic tokens so the dark theme
        // inverts with everything else instead of staying stuck in ivory.
        backgroundColor: "var(--background)",
        backgroundImage:
          "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--secondary) 78%, transparent) 46%, color-mix(in srgb, var(--accent) 85%, transparent) 100%)",
      }}
    >
      {/* Fine thread texture — two hairline grids at a low angle, standing in
          for woven cloth. Barely perceptible on its own; what it removes is the
          dead flatness of a plain fill. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.022]"
        style={{
          // Wide gaps on purpose. At the 7px spacing this started on, the two
          // grids beat against each other into a visible moiré diamond — a
          // pattern the eye reads as a graphic, not as cloth.
          backgroundImage:
            "repeating-linear-gradient(58deg, var(--color-navy) 0 1px, transparent 1px 14px), repeating-linear-gradient(-58deg, var(--color-navy) 0 1px, transparent 1px 17px)",
        }}
      />

      {/* Drifting glow orbs, gold and blue. Heavily blurred and low alpha —
          depth behind the cards rather than anything the eye lands on. */}
      <span
        ref={orbA}
        aria-hidden
        className="pointer-events-none absolute -z-10 h-[26rem] w-[26rem] rounded-full blur-[110px] sm:h-[34rem] sm:w-[34rem]"
        style={{
          top: "12%",
          left: "4%",
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--color-accent-gold) 42%, transparent) 0%, transparent 70%)",
        }}
      />
      <span
        ref={orbB}
        aria-hidden
        className="pointer-events-none absolute -z-10 h-[24rem] w-[24rem] rounded-full blur-[120px] sm:h-[32rem] sm:w-[32rem]"
        style={{
          bottom: "6%",
          right: "2%",
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--color-brand-blue) 30%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-premium-alt mb-3 text-xs font-semibold tracking-[0.2em] uppercase">
              Product Categories
            </p>
            <h2 className="font-heading text-3xl leading-tight font-semibold sm:text-4xl">
              Four specialist ranges
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => go(-1)}
              aria-label="Previous category"
              aria-controls="category-stage"
              // Border and glow follow the active card, so the controls read as
              // part of the same object rather than generic chrome.
              style={{ borderColor: `color-mix(in srgb, ${activeAccent} 45%, transparent)` }}
              className="glow-ring-blue bg-card hover:bg-navy hover:text-ivory size-11 rounded-full transition-colors"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => go(1)}
              aria-label="Next category"
              aria-controls="category-stage"
              style={{ borderColor: `color-mix(in srgb, ${activeAccent} 45%, transparent)` }}
              className="glow-ring-blue bg-card hover:bg-navy hover:text-ivory size-11 rounded-full transition-colors"
            >
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Stage */}
        <div
          id="category-stage"
          ref={stage}
          role="group"
          aria-roledescription="carousel"
          aria-label="Product categories"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          // overflow-x:clip (not hidden) contains the off-stage cards without
          // creating a scroll container, and leaves vertical glow uncropped.
          className="relative mt-9 h-[25rem] [overflow-x:clip] [perspective:1400px] sm:mt-10 sm:h-[26rem]"
        >
          {/* Oversized index, sitting behind the stack. Purely typographic
              decoration: it gives the empty air either side of the cards a
              reason to be there. aria-hidden — the number is already on the
              card, and read twice it is just noise. */}
          {/* Centring is GSAP's, not Tailwind's: GSAP writes the drift as an
              inline transform, and that replaces a `-translate-x-1/2` class
              outright — the numeral slid out from behind the cards and sat on
              top of the dots. xPercent/yPercent keep both in one transform. */}
          <span
            ref={ghostNumber}
            aria-hidden
            // Deliberately wider than the hero card. Sized to sit behind it, it
            // was completely covered and the decoration did nothing at all.
            className="font-heading pointer-events-none absolute top-1/2 left-1/2 -z-10 text-[15rem] leading-none font-bold tracking-tighter select-none sm:text-[26rem]"
            style={{
              color: `color-mix(in srgb, ${activeAccent} 15%, transparent)`,
              WebkitTextStroke: `1px color-mix(in srgb, ${activeAccent} 22%, transparent)`,
            }}
          >
            {String(active + 1).padStart(2, "0")}
          </span>

          {CATEGORIES.map((category, index) => {
            const d = offsetOf(index);
            const isActive = d === 0;
            const offstage = Math.abs(d) > 1;

            return (
              <div
                key={category.slug}
                ref={(el) => {
                  cards.current[index] = el;
                }}
                aria-hidden={offstage}
                className="absolute top-0 left-1/2 w-[86%] max-w-[22rem] [transform-style:preserve-3d] sm:w-[68%] lg:w-[23rem]"
                style={{ pointerEvents: offstage ? "none" : "auto" }}
              >
                <Link
                  href={`/categories/${category.slug}`}
                  tabIndex={offstage ? -1 : 0}
                  // Focusing a side card promotes it, so keyboard users never
                  // interact with something they cannot properly see.
                  onFocus={() => setActive(index)}
                  style={{ "--glow": category.accent } as React.CSSProperties}
                  className={`group glass-light glass-glow focus-visible:ring-ring flex h-full flex-col rounded-xl p-5 transition-transform duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 sm:p-6 ${
                    isActive ? "glass-active hover:-translate-y-1.5" : "glass-rest"
                  }`}
                >
                  <div
                    className="relative aspect-[16/10] w-full overflow-hidden rounded-lg"
                    style={{
                      // Thin gold frame, the same detail the product pages use
                      // around hero photography.
                      boxShadow: `0 0 0 1px color-mix(in srgb, var(--color-accent-gold) ${
                        isActive ? 55 : 28
                      }%, transparent)`,
                    }}
                  >
                    <Image
                      src={`/images/categories/${category.slug}.jpg`}
                      alt={category.imageAlt}
                      fill
                      sizes="(max-width: 640px) 86vw, 23rem"
                      className="object-cover object-center"
                    />

                    {/* Accent wash. `multiply` colours the fabric instead of
                        laying a film over it — on a photograph that is almost
                        entirely white, a normal-blend overlay would simply
                        flatten it to a solid block. */}
                    <span
                      aria-hidden
                      className="absolute inset-0 mix-blend-multiply transition-opacity duration-500"
                      style={{
                        opacity: isActive ? 0.5 : 0.62,
                        backgroundImage: `linear-gradient(155deg, ${category.accent} 0%, color-mix(in srgb, ${category.accent} 30%, white) 55%, white 100%)`,
                      }}
                    />

                    {/* Bottom scrim, for weight under the card's text block. */}
                    <span
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          "linear-gradient(to top, rgb(10 37 64 / 0.34) 0%, transparent 52%)",
                      }}
                    />
                  </div>

                  <span
                    data-card="number"
                    className="text-premium font-heading mt-5 text-sm font-semibold tracking-widest"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* Drawn in by GSAP when this card reaches centre, then
                      stretches on hover. scaleX, never width — no relayout.
                      Two elements, not one: GSAP writes the draw-in as an
                      inline transform, and an inline transform beats the hover
                      class, so a single span would animate in and then refuse
                      to stretch. The outer span is GSAP's, the inner is CSS's. */}
                  <span data-card="rule" aria-hidden className="mt-3 block w-12 origin-left">
                    <span className="bg-premium block h-px w-full origin-left transition-transform duration-300 group-hover:[transform:scaleX(1.7)]" />
                  </span>

                  <span className="font-heading mt-4 text-xl font-semibold">{category.name}</span>

                  <span className="text-muted-foreground mt-2.5 grow text-sm leading-relaxed">
                    {category.description}
                  </span>

                  <span className="text-brand-blue-text mt-5 inline-flex items-center gap-1.5 text-sm font-semibold">
                    Browse catalog
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </span>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Position indicators — the only way to see progress once the arrows
            stop being the sole affordance on touch. */}
        <div className="mt-6 flex items-center justify-center gap-2.5">
          {CATEGORIES.map((category, index) => {
            const isActive = index === active;
            return (
              <button
                key={category.slug}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show ${category.name}`}
                aria-current={isActive}
                className="focus-visible:ring-ring grid size-8 place-items-center rounded-full focus-visible:ring-2"
              >
                <span
                  className="block h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: isActive ? 30 : 8,
                    backgroundColor: isActive
                      ? category.accent
                      : "color-mix(in srgb, var(--foreground) 22%, transparent)",
                    boxShadow: isActive
                      ? `0 0 12px color-mix(in srgb, ${category.accent} 65%, transparent)`
                      : "none",
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
