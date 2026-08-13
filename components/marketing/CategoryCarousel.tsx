"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Car,
  ConciergeBell,
  Stethoscope,
  WashingMachine,
  type LucideIcon,
} from "lucide-react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/animation/gsap";
import { CATEGORIES } from "@/lib/site-config";

/**
 * Category section (FR-007c) — arch cards on an ivory stage.
 *
 * FOUR CARDS ARE VISIBLE AT ONCE ON DESKTOP, which is the whole point of the
 * layout: the previous coverflow showed one card and two ghosts, and a range
 * you cannot see is a range nobody browses. Below `lg` the row becomes a track
 * that slides — three up, two on tablet, one on a phone — because four arch
 * cards at a legible width do not fit and shrinking them to fit turns the
 * photograph into a stamp.
 *
 * THE ACTIVE CARD IS A HIGHLIGHT, NOT A FILTER. On desktop nothing is hidden;
 * the gold frame and glow simply say which one the auto-rotation is resting on.
 * That keeps the section readable when JavaScript has not run and when someone
 * has motion turned off — everything is on screen either way.
 *
 * GSAP OWNS ANYTHING THAT MOVES, and every animated element is a child of a
 * plain CSS-positioned wrapper. This is not stylistic: an inline transform
 * replaces a Tailwind transform class outright, so animating an element that is
 * centred with `-translate-x-1/2` silently drops it out of position. Badge,
 * numeral rule and track each keep their layout on the parent and give GSAP a
 * child of its own.
 *
 * Reduced motion: no auto-rotation, no float, no pulse, no scroll reveal. The
 * cards are simply there, and the arrows still work.
 */

const ROTATE_MS = 5200;

const ICONS: Record<string, LucideIcon> = {
  hospitality: ConciergeBell,
  "health-care": Stethoscope,
  "institutional-laundry": WashingMachine,
  "commercial-automotive": Car,
};

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

/** A small gold leaf, used as the divider mark and in the corner sprays. */
function Leaf({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} style={style} fill="none">
      <path
        d="M12 2c4.5 3.2 7 7 7 11a7 7 0 1 1-14 0c0-4 2.5-7.8 7-11Z"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path d="M12 5.5V21" stroke="currentColor" strokeWidth="1" />
      <path
        d="M12 11.5 8.5 9M12 11.5 15.5 9M12 15.5 9 13.4M12 15.5 15 13.4"
        stroke="currentColor"
        strokeWidth="0.85"
      />
    </svg>
  );
}

export function CategoryCarousel() {
  const count = CATEGORIES.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const isPhone = useMediaQuery("(max-width: 639px)");
  const isTablet = useMediaQuery("(min-width: 640px) and (max-width: 1023px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);

  // How many cards the viewport can hold at a legible width.
  const perView = isPhone ? 1 : isTablet ? 2 : 4;
  // The furthest the track can slide before it would show empty space.
  const maxIndex = Math.max(0, count - perView);
  const slideIndex = Math.min(active, maxIndex);

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

  /* Track position. Percentage of one card's width per step, so it stays
     correct at every breakpoint without measuring anything. */
  useGSAP(
    () => {
      if (!track.current) return;
      gsap.to(track.current, {
        xPercent: (-100 / count) * slideIndex,
        duration: prefersReducedMotion() ? 0 : 0.85,
        ease: "power3.out",
        overwrite: "auto",
      });
    },
    { scope: root, dependencies: [slideIndex, count] }
  );

  /* Scroll reveal, badge float, active glow pulse. Mounted once. */
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const cards = gsap.utils.toArray<HTMLElement>("[data-card='arch']");
      if (cards.length) {
        // fromTo with explicit end values, and clearProps to hand the element
        // back to the stylesheet afterwards.
        //
        // `gsap.from` left the cards sitting at y:46 with opacity animated to 1
        // — visible, but every card 46px below where the layout put it. And the
        // leftover inline transform is worse than the offset: the card's hover
        // lift is `hover:-translate-y-2`, a Tailwind transform class, and an
        // inline transform beats it outright. The lift silently did nothing.
        gsap.fromTo(
          cards,
          { y: 46, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power3.out",
            stagger: 0.11,
            clearProps: "transform,opacity",
            scrollTrigger: { trigger: root.current, start: "top 82%", once: true },
          }
        );
      }

      // Badges breathe out of phase with each other, so the row reads as four
      // separate objects rather than one animation applied four times.
      gsap.utils.toArray<HTMLElement>("[data-card='badge-inner']").forEach((el, i) => {
        gsap.to(el, {
          y: -6,
          duration: 2.6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 0.35,
        });
      });

      return () => {
        ScrollTrigger.getAll().forEach((t) => {
          if (t.trigger === root.current) t.kill();
        });
      };
    },
    { scope: root }
  );

  /* The active card's own detail: the gold rule under its number draws in, and
     its frame glow takes up a slow pulse. Re-runs on every step. */
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const current = root.current?.querySelector<HTMLElement>(`[data-index='${active}']`);
      const rule = current?.querySelector<HTMLElement>("[data-card='rule-inner']");
      const frame = current?.querySelector<HTMLElement>("[data-card='frame']");

      if (rule) {
        gsap.fromTo(
          rule,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.6, ease: "power2.out", transformOrigin: "left center" }
        );
      }
      if (frame) {
        gsap.fromTo(
          frame,
          { opacity: 0.55 },
          { opacity: 1, duration: 1.9, ease: "sine.inOut", repeat: -1, yoyo: true }
        );
      }
    },
    { scope: root, dependencies: [active] }
  );

  return (
    <section
      ref={root}
      className="relative isolate overflow-hidden py-16 sm:py-20 lg:py-24"
      style={{
        backgroundColor: "var(--background)",
        backgroundImage:
          "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--accent) 62%, transparent) 52%, color-mix(in srgb, var(--secondary) 72%, transparent) 100%)",
      }}
    >
      {/* Draped silk. Two very large, very soft ellipses in cream and gold,
          rotated against each other so the corners read as folded cloth rather
          than as a vignette. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-[18%] -left-[12%] -z-10 h-[38rem] w-[46rem] rotate-[-14deg] rounded-[50%] opacity-60 blur-[90px]"
        style={{
          background:
            "radial-gradient(ellipse at 40% 40%, color-mix(in srgb, var(--color-champagne) 92%, transparent) 0%, transparent 68%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-[14%] -bottom-[16%] -z-10 h-[36rem] w-[44rem] rotate-[12deg] rounded-[50%] opacity-50 blur-[100px]"
        style={{
          background:
            "radial-gradient(ellipse at 60% 50%, color-mix(in srgb, var(--color-accent-gold) 34%, transparent) 0%, transparent 66%)",
        }}
      />

      {/* Woven thread grain — wide spacing on purpose; tight lines beat into a
          moiré diamond that reads as a graphic, not as cloth. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.022]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(58deg, var(--color-navy) 0 1px, transparent 1px 14px), repeating-linear-gradient(-58deg, var(--color-navy) 0 1px, transparent 1px 17px)",
        }}
      />

      {/* Botanical corner sprays. */}
      <span
        aria-hidden
        className="text-premium pointer-events-none absolute bottom-4 left-4 -z-10 opacity-[0.13] sm:bottom-8 sm:left-8"
      >
        <span className="flex items-end gap-1">
          <Leaf className="size-16 -rotate-[28deg] sm:size-24" />
          <Leaf className="size-10 rotate-[8deg] sm:size-14" />
        </span>
      </span>
      <span
        aria-hidden
        className="text-premium pointer-events-none absolute right-4 bottom-4 -z-10 opacity-[0.13] sm:right-8 sm:bottom-8"
      >
        <span className="flex items-end gap-1">
          <Leaf className="size-10 -rotate-[8deg] sm:size-14" />
          <Leaf className="size-16 rotate-[28deg] sm:size-24" />
        </span>
      </span>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-premium flex items-center justify-center gap-3 text-xs font-semibold tracking-[0.22em] uppercase">
            <span
              aria-hidden
              className="from-premium/0 to-premium/70 h-px w-10 bg-gradient-to-r sm:w-16"
            />
            Product Categories
            <span
              aria-hidden
              className="from-premium/70 to-premium/0 h-px w-10 bg-gradient-to-r sm:w-16"
            />
          </p>

          <h2 className="font-heading text-navy dark:text-ivory mt-4 text-3xl leading-tight font-semibold sm:text-4xl lg:text-5xl">
            Four specialist ranges
          </h2>

          <div aria-hidden className="mt-5 flex items-center justify-center gap-3">
            <span className="from-premium/0 to-premium/45 h-px w-16 bg-gradient-to-r sm:w-24" />
            <Leaf className="text-premium size-4 shrink-0" />
            <span className="from-premium/45 to-premium/0 h-px w-16 bg-gradient-to-r sm:w-24" />
          </div>

          <p className="text-muted-foreground mt-4 text-[15px]">
            Premium textiles. Endless possibilities.
          </p>
        </header>

        {/* ── Cards ──────────────────────────────────────────────────────── */}
        <div
          className="relative mt-12 sm:mt-14"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          {/* Arrows sit outside the cards on desktop and tuck in on small
              screens, where there is no margin to spare. */}
          <NavButton
            direction="left"
            onClick={() => go(-1)}
            className="left-0 lg:-left-4 xl:-left-6"
          />
          <NavButton
            direction="right"
            onClick={() => go(1)}
            filled
            className="right-0 lg:-right-4 xl:-right-6"
          />

          <div
            id="category-stage"
            role="group"
            aria-roledescription="carousel"
            aria-label="Product categories"
            className="overflow-hidden px-9 sm:px-12 lg:px-0"
          >
            <ul
              ref={track}
              className="flex items-stretch"
              style={{ width: `${(count / perView) * 100}%` }}
            >
              {CATEGORIES.map((category, index) => {
                const Icon = ICONS[category.slug] ?? ConciergeBell;
                const isActive = index === active;

                return (
                  <li
                    key={category.slug}
                    data-index={index}
                    className="px-2.5 sm:px-3"
                    style={{ width: `${100 / count}%` }}
                  >
                    <Link
                      href={`/categories/${category.slug}`}
                      data-card="arch"
                      onFocus={() => setActive(index)}
                      aria-current={isActive}
                      className="group focus-visible:ring-ring relative flex h-full flex-col overflow-hidden rounded-t-full rounded-b-2xl transition-[transform,box-shadow] duration-300 hover:-translate-y-2 focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
                      style={{
                        backgroundColor: "var(--card)",
                        boxShadow: isActive
                          ? "0 24px 60px -26px color-mix(in srgb, var(--color-accent-gold) 85%, transparent), 0 10px 26px -14px rgb(10 37 64 / 0.28)"
                          : "0 12px 30px -20px rgb(10 37 64 / 0.42)",
                      }}
                    >
                      {/* Gold frame. Its own element so GSAP can pulse the
                          opacity without touching the card's shadow or its
                          hover transform. */}
                      <span
                        data-card="frame"
                        aria-hidden
                        className="pointer-events-none absolute inset-0 z-20 rounded-t-full rounded-b-2xl transition-opacity duration-300"
                        style={{
                          boxShadow: isActive
                            ? "inset 0 0 0 2px color-mix(in srgb, var(--color-accent-gold) 88%, transparent)"
                            : "inset 0 0 0 1px color-mix(in srgb, var(--color-accent-gold) 26%, transparent)",
                          opacity: isActive ? 1 : 0.9,
                        }}
                      />

                      {/* Arch photograph. The wrapper is NOT clipped: the badge
                          hangs off its bottom edge, and the seam it straddles
                          is this element's border, not a percentage of the card
                          — the card's height depends on how far the description
                          wraps, so a percentage would drift per category. */}
                      <div className="relative w-full">
                        <div className="relative aspect-[3/4] w-full overflow-hidden">
                          <Image
                            src={`/images/categories/${category.slug}.jpg`}
                            alt={category.imageAlt}
                            fill
                            sizes="(max-width: 639px) 82vw, (max-width: 1023px) 42vw, 22rem"
                            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.06]"
                          />

                          {/* Accent wash. `multiply` colours the fabric rather
                            than veiling it — these photographs are white linen
                            on a white card, and a normal-blend overlay would
                            flatten them to a solid block. */}
                          <span
                            aria-hidden
                            className="absolute inset-0 mix-blend-multiply"
                            style={{
                              opacity: isActive ? 0.46 : 0.6,
                              backgroundImage: `linear-gradient(160deg, ${category.accent} 0%, color-mix(in srgb, ${category.accent} 26%, white) 58%, white 100%)`,
                            }}
                          />
                          <span
                            aria-hidden
                            className="absolute inset-0"
                            style={{
                              backgroundImage:
                                "linear-gradient(to top, rgb(10 37 64 / 0.42) 0%, transparent 46%)",
                            }}
                          />
                        </div>

                        {/* Icon badge, straddling the seam. Centring lives on this
                          wrapper; GSAP only ever touches the child. */}
                        <span
                          aria-hidden
                          className="pointer-events-none absolute bottom-0 left-1/2 z-30 -translate-x-1/2 translate-y-1/2"
                        >
                          <span
                            data-card="badge-inner"
                            className="grid size-14 place-items-center rounded-full transition-shadow duration-300"
                            style={{
                              background:
                                "linear-gradient(145deg, #E7CE8C 0%, var(--color-accent-gold) 52%, #A8862F 100%)",
                              boxShadow: isActive
                                ? "0 10px 24px -8px color-mix(in srgb, var(--color-accent-gold) 90%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.45)"
                                : "0 8px 18px -10px rgb(10 37 64 / 0.5), inset 0 1px 0 rgb(255 255 255 / 0.4)",
                            }}
                          >
                            <Icon className="text-navy size-6" strokeWidth={1.4} />
                          </span>
                        </span>
                      </div>

                      {/* Text panel */}
                      <div className="flex grow flex-col px-5 pt-11 pb-6 text-center sm:px-6">
                        <span className="text-premium font-heading text-sm font-semibold tracking-[0.18em]">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        {/* Two spans: the outer holds the layout, the inner is
                            GSAP's to draw and CSS's to stretch on hover. */}
                        <span data-card="rule" aria-hidden className="mx-auto mt-2.5 block w-10">
                          <span
                            data-card="rule-inner"
                            className="bg-premium block h-px w-full origin-left transition-transform duration-300 group-hover:[transform:scaleX(1.6)]"
                          />
                        </span>

                        <span className="font-heading text-navy dark:text-ivory mt-4 text-xl leading-snug font-semibold text-balance">
                          {category.name}
                        </span>

                        <span className="text-muted-foreground mt-3 grow text-sm leading-relaxed text-balance">
                          {category.description}
                        </span>

                        <span className="text-premium-alt mt-5 inline-flex items-center justify-center gap-1.5 text-sm font-semibold">
                          Browse catalog
                          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* ── Dots ───────────────────────────────────────────────────────── */}
        <div className="mt-9 flex items-center justify-center gap-2.5">
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
                      ? "var(--color-accent-gold)"
                      : "color-mix(in srgb, var(--foreground) 22%, transparent)",
                    boxShadow: isActive
                      ? "0 0 12px color-mix(in srgb, var(--color-accent-gold) 70%, transparent)"
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

/**
 * Circular carousel control.
 *
 * `filled` is the forward button: solid gold against the outlined back button,
 * so the direction the section is already travelling reads at a glance.
 */
function NavButton({
  direction,
  onClick,
  filled,
  className,
}: {
  direction: "left" | "right";
  onClick: () => void;
  filled?: boolean;
  className?: string;
}) {
  const Icon = direction === "left" ? ArrowLeft : ArrowRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "left" ? "Previous category" : "Next category"}
      aria-controls="category-stage"
      className={`focus-visible:ring-ring absolute top-1/2 z-30 grid size-11 -translate-y-1/2 place-items-center rounded-full transition-[background-color,color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${className ?? ""}`}
      style={
        filled
          ? {
              backgroundColor: "var(--color-accent-gold)",
              color: "var(--color-navy)",
              boxShadow:
                "0 10px 24px -12px color-mix(in srgb, var(--color-accent-gold) 90%, transparent)",
            }
          : {
              backgroundColor: "var(--card)",
              color: "var(--color-accent-gold)",
              boxShadow:
                "inset 0 0 0 1px color-mix(in srgb, var(--color-accent-gold) 45%, transparent), 0 8px 20px -14px rgb(10 37 64 / 0.5)",
            }
      }
    >
      <Icon className="size-4" />
    </button>
  );
}
