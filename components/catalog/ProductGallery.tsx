"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/animation/gsap";

/**
 * Product gallery — one large frame plus thumbnails.
 *
 * The frame is `.product-frame` (FR-008): white ground, thin gold border. That
 * is a deliberate constraint from the design contract and not a stylistic
 * choice — white goods photographed against ivory lose their edges, and the
 * gold hairline is what separates the product from the page.
 *
 * Thumbnails are BUTTONS, and the active one is marked with `aria-current`
 * rather than colour alone. A gold ring is invisible to anyone who cannot
 * distinguish it from the resting border.
 *
 * The crossfade is a real crossfade, not a swap: the outgoing image is still
 * painted while the incoming one comes up, so the frame never flashes its white
 * ground between two photographs.
 */

type Shot = { src: string; alt: string };

export function ProductGallery({ images }: { images: Shot[] }) {
  const [active, setActive] = useState(0);
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = scope.current?.querySelector<HTMLElement>("[data-gallery='active']");
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, scale: 1.02 },
        { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" }
      );
    },
    { scope, dependencies: [active] }
  );

  return (
    <div ref={scope}>
      <div className="product-frame relative">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2px]">
          {images.map((shot, i) => (
            <Image
              key={shot.src}
              // Every frame is mounted and stacked; only the active one is
              // opaque. Mounting on demand would mean a network round-trip on
              // the first click of each thumbnail, and a white flash while it
              // resolves.
              {...(i === active ? { "data-gallery": "active" } : {})}
              src={shot.src}
              alt={i === active ? shot.alt : ""}
              fill
              // The first shot is the page's largest image and sits at the top
              // of the viewport, so it is the LCP candidate.
              priority={i === 0}
              sizes="(max-width: 1024px) 100vw, 46rem"
              className={`object-cover object-center transition-opacity duration-300 ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <ul className="mt-4 grid grid-cols-4 gap-3">
          {images.map((shot, i) => (
            <li key={shot.src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-current={i === active ? "true" : undefined}
                aria-label={`View image ${i + 1} of ${images.length}: ${shot.alt}`}
                className={`focus-visible:ring-ring relative block aspect-[4/3] w-full overflow-hidden rounded-sm border bg-white transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
                  i === active
                    ? "border-premium ring-premium/40 ring-1"
                    : "border-premium/25 hover:border-premium/60"
                }`}
              >
                <Image
                  src={shot.src}
                  alt=""
                  fill
                  sizes="11rem"
                  className="object-cover object-center"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
