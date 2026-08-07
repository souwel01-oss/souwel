/**
 * Gate for animations that must not play while the intro sequence is on screen.
 *
 * Anything above the fold animates in the first second — which is exactly the
 * second the intro is covering the screen. Without this gate the hero plays
 * its whole entrance behind an opaque panel and is sitting there finished by
 * the time the intro clears, which is the most common way an intro sequence
 * ruins the entrance it exists to introduce.
 *
 * When there is no intro (any page but "/", a repeat visit in the same
 * session, or reduced motion) the callback runs immediately, so callers can use
 * this unconditionally and never branch on whether an intro is happening.
 */

/** Dispatched on window when the intro sequence has finished. */
export const INTRO_DONE = "souwel:intro-done";

/** Milliseconds after which the gate opens regardless. Must comfortably exceed
 *  the intro timeline (~2.15s) — if the intro errors and never fires its
 *  event, everything waiting on it would otherwise stay hidden permanently. */
const FAILSAFE = 3000;

/**
 * Runs `cb` once the intro is gone. Returns a cancel function for cleanup —
 * call it on unmount, or a component torn down mid-intro leaves a listener and
 * a timer that will fire against dead refs.
 */
export function whenIntroDone(cb: () => void): () => void {
  if (typeof document === "undefined" || !document.documentElement.hasAttribute("data-intro")) {
    cb();
    return () => {};
  }

  let settled = false;

  const run = () => {
    if (settled) return;
    settled = true;
    window.clearTimeout(timer);
    window.removeEventListener(INTRO_DONE, run);
    cb();
  };

  const timer = window.setTimeout(run, FAILSAFE);
  window.addEventListener(INTRO_DONE, run);

  return () => {
    settled = true;
    window.clearTimeout(timer);
    window.removeEventListener(INTRO_DONE, run);
  };
}
