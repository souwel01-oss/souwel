"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/lib/site-config";
import Image from "next/image";
import { Button } from "@/components/ui/button";

/**
 * Category carousel (FR-007c) — infinite coverflow.
 *
 * Cards are absolutely stacked on a shared 3D stage. Each one's position is
 * derived from its *wrapped* distance to the active index, so advancing past
 * the last card rolls straight back to the first with no rewind and no clones.
 *
 * Auto-rotation pauses on hover and on keyboard focus, so nobody loses a card
 * mid-read. Only transform/opacity animate, keeping it compositor-only.
 *
 * Reduced motion: auto-rotation never starts and the depth tilt is dropped;
 * arrows still work, so the content stays fully reachable.
 */

const ROTATE_MS = 4200;

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
  const offsetOf = (index: number) => {
    let d = (((index - active) % count) + count) % count;
    if (d > count / 2) d -= count;
    return d;
  };

  const styleFor = (d: number) => {
    const abs = Math.abs(d);
    const sign = Math.sign(d);

    // One card at a time on narrow screens; neighbours peek on desktop.
    const spread = isNarrow ? 78 : 62;
    const tilt = reducedMotion ? 0 : 30;

    if (abs === 0) {
      return {
        transform: "translate3d(-50%, 0, 0) scale(1) rotateY(0deg)",
        opacity: 1,
        zIndex: 30,
        filter: "none",
      };
    }

    if (abs === 1) {
      return {
        transform: `translate3d(calc(-50% + ${sign * spread}%), 0, -140px) scale(${isNarrow ? 0.8 : 0.84}) rotateY(${-sign * tilt}deg)`,
        opacity: isNarrow ? 0.25 : 0.55,
        zIndex: 20,
        filter: reducedMotion ? "none" : "blur(1.5px)",
      };
    }

    // Furthest card sits behind the stack, fully faded.
    return {
      transform: `translate3d(calc(-50% + ${(sign || 1) * (spread + 18)}%), 0, -260px) scale(0.7) rotateY(${-(sign || 1) * tilt}deg)`,
      opacity: 0,
      zIndex: 10,
      filter: "none",
    };
  };

  return (
    <section className="bg-secondary/60 py-16 sm:py-20 lg:py-24">
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
              className="border-navy/20 hover:bg-navy hover:text-ivory glow-ring-blue size-11 rounded-full bg-white"
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
              className="border-navy/20 hover:bg-navy hover:text-ivory glow-ring-blue size-11 rounded-full bg-white"
            >
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Stage */}
        <div
          id="category-stage"
          role="group"
          aria-roledescription="carousel"
          aria-label="Product categories"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          // overflow-x:clip (not hidden) contains the off-stage cards without
          // creating a scroll container, and leaves vertical glow uncropped.
          className="relative mt-12 h-[27rem] [overflow-x:clip] [perspective:1400px] sm:h-[28rem]"
        >
          {CATEGORIES.map((category, index) => {
            const d = offsetOf(index);
            const isActive = d === 0;
            const s = styleFor(d);

            return (
              <div
                key={category.slug}
                aria-hidden={Math.abs(d) > 1}
                className="absolute top-0 left-1/2 w-[86%] max-w-[22rem] [transform-style:preserve-3d] [transition:transform_620ms_var(--ease-out),opacity_620ms_var(--ease-out),filter_620ms_var(--ease-out)] sm:w-[68%] lg:w-[23rem]"
                style={{
                  transform: s.transform,
                  opacity: s.opacity,
                  zIndex: s.zIndex,
                  filter: s.filter,
                  pointerEvents: Math.abs(d) > 1 ? "none" : "auto",
                }}
              >
                <Link
                  href={`/categories/${category.slug}`}
                  tabIndex={Math.abs(d) > 1 ? -1 : 0}
                  // Focusing a side card promotes it, so keyboard users never
                  // interact with something they cannot properly see.
                  onFocus={() => setActive(index)}
                  style={{ "--glow": category.accent } as React.CSSProperties}
                  className={`group glass-light glass-glow focus-visible:ring-ring flex h-full flex-col rounded-lg p-5 focus-visible:ring-2 focus-visible:ring-offset-2 sm:p-6 ${
                    isActive ? "glass-active" : "glass-rest"
                  }`}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md">
                    <Image
                      src={`/images/categories/${category.slug}.jpg`}
                      alt={category.imageAlt}
                      fill
                      sizes="(max-width: 640px) 86vw, 23rem"
                      className="object-cover object-center"
                    />
                  </div>

                  <span className="text-premium font-heading mt-5 text-sm font-semibold tracking-widest">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* Draws in left-to-right when the section reveals, then
                      stretches on hover. scaleX, never width — no relayout. */}
                  <span
                    aria-hidden
                    className="bg-premium rule-draw mt-3 block h-px w-12 group-hover:[transform:scaleX(1.7)]"
                  />

                  <span className="font-heading mt-4 text-xl font-semibold">{category.name}</span>

                  <span className="text-muted-foreground mt-2.5 grow text-sm leading-relaxed">
                    {category.description}
                  </span>

                  <span className="text-brand-blue-text mt-5 inline-flex items-center gap-1.5 text-sm font-medium">
                    Browse catalog
                    <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Position indicators — the only way to see progress once the arrows
            stop being the sole affordance on touch. */}
        <div className="mt-8 flex items-center justify-center gap-2.5">
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
                    width: isActive ? 26 : 8,
                    backgroundColor: isActive ? category.accent : "rgb(10 37 64 / 0.22)",
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
