"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SplitReveal } from "@/components/animation/SplitReveal";
import { Magnetic } from "@/components/animation/Magnetic";
import { HeroCta } from "@/components/animation/HeroCta";
import { whenIntroDone } from "@/lib/animation/intro";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/animation/gsap";
import { DUR, EASE, STAGGER } from "@/lib/animation/config";

/**
 * Client half of the hero: the load-entrance timeline and the mouse parallax.
 *
 * Split out from Hero so the section wrapper, the video background and the
 * ambient layer stay server-rendered — only the copy that actually animates
 * ships as a client component.
 *
 * Entrance order is deliberate: heading (word by word), paragraph, buttons,
 * footnote. The heading runs first and alone because it is the LCP element;
 * nothing else competes with it for the first frames.
 *
 * `data-anim-hide` on each animated element pairs with the pre-paint script in
 * app/layout.tsx. Without it the server HTML paints at full opacity and then
 * visibly blinks out when GSAP hydrates several hundred ms later.
 *
 * NOTE ON CLS: every element renders at its final size and position. The
 * timeline animates transform / opacity / filter only, so nothing can reflow.
 */

export function HeroContent() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // fromTo, not from: these elements are already hidden by the .anim-ready
      // CSS gate, so `from` would read opacity 0 as the resting state and
      // animate to nothing. fromTo also writes an inline opacity, which
      // outranks the gate class and survives the failsafe removing it.
      // The delay lets the heading's own split animation lead.
      //
      // Starts paused and waits for the intro curtain. With no curtain running,
      // whenIntroDone fires straight away, so this costs one tick.
      const tl = gsap.timeline({ delay: 0.45, paused: true });
      const cancelGate = whenIntroDone(() => tl.play());

      tl.fromTo(
        "[data-hero='lede']",
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: DUR.base, ease: EASE.out }
      )
        // TARGET THE ELEMENT THAT CARRIES data-anim-hide, not its parent.
        //
        // This used to select `[data-hero='cta'] > *`, which is the <Magnetic>
        // wrapper — while `data-anim-hide` sits on the span INSIDE it. So the
        // CSS gate held the inner span at opacity 0 while this tween played out
        // in full on the outer one, and the buttons then appeared in a single
        // frame at 3.5s when the 3400ms failsafe stripped `.anim-ready`. The
        // entrance was running perfectly, on an invisible element. Traced it:
        // outer opacity reached 1 at 3302ms, inner was still 0, effective 0.
        //
        // Writing to the gated element itself means GSAP's inline opacity beats
        // the class, which is what the fromTo was for in the first place.
        //
        // It also unpicks a second conflict: <Magnetic> drives x/y on the outer
        // span, so animating y there too meant hovering mid-entrance had two
        // owners fighting over one transform.
        .fromTo(
          "[data-hero='cta'] [data-anim-hide]",
          { opacity: 0, y: 20, scale: 0.94 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: DUR.base,
            ease: EASE.bounce,
            stagger: STAGGER.item,
            // Leaves no inline transform behind to trap the buttons' own hover
            // scale, which HeroCta animates on a child of this element.
            clearProps: "transform",
          },
          "-=0.3"
        )
        .fromTo(
          "[data-hero='note']",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: DUR.fast, ease: EASE.out },
          "-=0.35"
        );

      // Mouse parallax. Pointer-gated, and quickTo so a fast pointer cannot
      // queue competing tweens. Amounts are tiny on purpose: anything larger
      // and the copy starts swimming while you are trying to read it.
      // Note the cleanup here and below both cancel the gate — an early return
      // that skipped it would leave a listener and a 3.6s timer behind.
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return cancelGate;

      const copyX = gsap.quickTo("[data-hero='copy']", "x", { duration: 0.9, ease: EASE.out });
      const copyY = gsap.quickTo("[data-hero='copy']", "y", { duration: 0.9, ease: EASE.out });

      const onMove = (e: MouseEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        copyX(nx * -18);
        copyY(ny * -12);
      };

      window.addEventListener("mousemove", onMove, { passive: true });
      return () => {
        window.removeEventListener("mousemove", onMove);
        cancelGate();
      };
    },
    { scope }
  );

  return (
    <div ref={scope}>
      <div data-hero="copy" className="max-w-2xl">
        <SplitReveal
          as="h1"
          text="Textiles Built for Real Work, Delivered with Real Care"
          variant="words"
          immediate
          delay={0.15}
          className="font-heading text-4xl leading-[1.1] font-semibold text-balance sm:text-5xl lg:text-6xl"
        />

        <p data-hero="lede" data-anim-hide className="text-ivory/85 mt-6 text-lg leading-relaxed">
          We manufacture and supply quality textiles for hospitality, health care, institutional
          laundry, and commercial businesses: built to hold up under everyday use, priced fairly and
          delivered with the same care we&rsquo;d want for our own business.
        </p>

        <div data-hero="cta" className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Both buttons hand their hover / focus / press motion to HeroCta,
              which drives it in GSAP. The `.glow-primary` and `.glow-ring-gold`
              CSS classes were removed rather than kept alongside it: those rules
              also set `transform` on hover, and two systems writing transform to
              the same element is how you get a button that stutters instead of
              scaling. One owner per property.

              `transition-none!` for the same reason on the outlined button —
              GSAP tweens its colour and border, and the base class's
              `transition-all` would re-ease every frame GSAP writes. The `!` is
              load-bearing: `transition-none` and `transition-all` have equal
              specificity, so without it the winner comes down to which utility
              Tailwind happens to emit last. */}
          <Magnetic>
            <span data-anim-hide className="block">
              <HeroCta variant="primary">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-7 text-base font-semibold"
                >
                  <Link href="/quote">
                    Get Started
                    <ArrowRight data-cta="arrow" className="size-4" />
                  </Link>
                </Button>
              </HeroCta>
            </span>
          </Magnetic>

          <Magnetic>
            <span data-anim-hide className="block">
              <HeroCta variant="secondary">
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  // hover:bg-white/5 is not redundant with bg-white/5. The
                  // `outline` variant ships its own `hover:bg-muted`, which is
                  // opaque platinum — on a dark hero that turns the button into
                  // a solid cream slab the moment the pointer arrives. It was
                  // previously masked by a `hover:bg-white/15` here; now that
                  // GSAP owns the fill, this pins the button's own background
                  // flat so the only thing that changes is the layer behind it.
                  className="text-ivory hover:text-ivory h-12 border-white/30 bg-white/5 px-7 text-base backdrop-blur-sm transition-none! hover:bg-white/5"
                >
                  <Link href="/about">Our Capabilities</Link>
                </Button>
              </HeroCta>
            </span>
          </Magnetic>
        </div>

        <p data-hero="note" data-anim-hide className="text-ivory/70 mt-6 text-sm">
          No account required to request a quote.
        </p>
      </div>
    </div>
  );
}
