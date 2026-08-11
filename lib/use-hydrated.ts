"use client";

import { useSyncExternalStore } from "react";

/** No-op subscription: the answer never changes after the first client render. */
const subscribe = () => () => {};

/**
 * False while rendering on the server and during hydration; true afterwards.
 *
 * WHY NOT `useState(false)` + `useEffect(() => setMounted(true))`. That is the
 * usual spelling and it works, but it is a setState inside an effect, which
 * schedules a second render pass for every component that uses it — React's own
 * lint rule flags it, and the theme toggle appears in the header of every page.
 *
 * `useSyncExternalStore` answers the same question with the API designed for
 * it: a server snapshot of `false`, a client snapshot of `true`, and no extra
 * state to keep in sync.
 *
 * This is needed wherever a value known only to the browser — the resolved
 * theme, `localStorage`, a media query — would otherwise be rendered into HTML
 * the server could not have produced.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
