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
 * HOVER ZOOM. Moving a mouse over the large image magnifies it around the
 * pointer, so the part under the cursor is the part that is enlarged, and
 * leaving puts it back. The zoom is applied to a wrapper around the stacked
 * photographs and not to the photographs themselves, because the crossfade
 * below animates the active photograph's own scale and the two must not fight.
 * Mouse only: on touch there is no hover, and a pinch already zooms the page.
 *
 * The crossfade is a real crossfade, not a swap: the outgoing image is still
 * painted while the incoming one comes up, so the frame never flashes its white
 * ground between two photographs.
 */

type Shot = { src: string; alt: string };

/** How far the image magnifies under the mouse. */
const ZOOM = 2;

export function ProductGallery({ images }: { images: Shot[] }) {
  const [active, setActive] = useState(0);
  const scope = useRef<HTMLDivElement>(null);
  const zoomLayer = useRef<HTMLDivElement>(null);

  const zoomAt = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !zoomLayer.current) return;
    const box = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * 100;
    const y = ((e.clientY - box.top) / box.height) * 100;
    zoomLayer.current.style.transformOrigin = `${x}% ${y}%`;
    zoomLayer.current.style.transform = `scale(${ZOOM})`;
  };

  const zoomOut = () => {
    if (zoomLayer.current) zoomLayer.current.style.transform = "scale(1)";
  };

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
        <div
          className="relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-[2px]"
          onPointerEnter={zoomAt}
          onPointerMove={zoomAt}
          onPointerLeave={zoomOut}
          onPointerCancel={zoomOut}
        >
          <div
            ref={zoomLayer}
            className="absolute inset-0 transition-transform duration-200 ease-out motion-reduce:transition-none"
          >
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
                // Wide enough that a 2x zoom still has pixels to show.
                sizes="(max-width: 1024px) 100vw, 64rem"
                className={`object-cover object-center transition-opacity duration-300 ${
                  i === active ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>
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
