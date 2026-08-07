"use client";

import { useEffect, useRef } from "react";

/**
 * "Focus mode" controller for a group of hoverable tiles.
 *
 * Hovering a `[data-focus-tile]` inside this group marks it `data-focus-active`
 * and sets `data-focus-mode` on <body>. All the visual work — the lift, the
 * shadow, and blurring/dimming the rest of the page — is CSS keyed off those two
 * attributes (see the focus-mode block in globals.css). This component only owns
 * the state.
 *
 * ONE DELEGATED LISTENER PAIR, not one per tile. pointerover/pointerout bubble,
 * so `closest()` on the event target finds the tile. That keeps the tiles
 * themselves server-rendered — nothing in the grid has to become a client
 * component to be hoverable.
 *
 * NOT ON TOUCH. Without a real pointer there is no hover to leave, so a tap
 * would blur the page and strand it that way until the next tap. Gated on
 * `(hover: hover) and (pointer: fine)`.
 *
 * NOT UNDER REDUCED MOTION. Blurring and unblurring the entire page is a large
 * involuntary visual change, which is the category of effect that preference
 * exists to suppress. Those visitors keep the plain hover.
 *
 * ENTER DELAY — the blur is committed ~110ms after the pointer lands. Dragging
 * the cursor diagonally across a 9-tile grid crosses several tiles in well under
 * that, and without the delay the whole page strobes. The tile's own lift is not
 * delayed, so the card still responds instantly.
 */

/** ms before the page-wide blur commits. Tuned against a diagonal sweep. */
const ENTER_DELAY = 110;

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function FocusGroup({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer = 0;
    let active: HTMLElement | null = null;

    const release = () => {
      window.clearTimeout(timer);
      active?.removeAttribute("data-focus-active");
      active = null;
      delete document.body.dataset.focusMode;
    };

    const onOver = (event: PointerEvent) => {
      const tile = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-focus-tile]");
      if (!tile || tile === active) return;

      window.clearTimeout(timer);
      active?.removeAttribute("data-focus-active");

      active = tile;
      tile.setAttribute("data-focus-active", "");
      timer = window.setTimeout(() => {
        document.body.dataset.focusMode = "";
      }, ENTER_DELAY);
    };

    const onOut = (event: PointerEvent) => {
      if (!active) return;

      // pointerout also fires when moving between a tile's own descendants, and
      // again when moving from one tile straight to the next. Neither should
      // release focus mode — the first is not a real exit, and the second is
      // handled by the onOver that follows it.
      const next = (event.relatedTarget as HTMLElement | null)?.closest?.("[data-focus-tile]");
      if (next) return;
      if (event.relatedTarget && active.contains(event.relatedTarget as Node)) return;

      release();
    };

    root.addEventListener("pointerover", onOver);
    root.addEventListener("pointerout", onOut);
    // Backstops: leaving the grid in one fast motion, or the window losing focus
    // mid-hover, must not leave the page blurred with no way to clear it.
    root.addEventListener("pointerleave", release);
    window.addEventListener("blur", release);

    return () => {
      root.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerout", onOut);
      root.removeEventListener("pointerleave", release);
      window.removeEventListener("blur", release);
      release();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
