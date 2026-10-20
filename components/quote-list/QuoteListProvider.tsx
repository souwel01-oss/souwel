"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { QuoteListDrawer } from "@/components/quote-list/QuoteListDrawer";

/**
 * Whether the quote list drawer is open, and the one drawer itself.
 *
 * THIS HOLDS ONLY THE OPEN FLAG. The list's contents live in
 * lib/quote-list-store.ts and are read from there directly; a context around
 * them would re-render every page under the marketing layout on each change.
 * The flag is in a context because several unrelated controls open the same
 * drawer — the header icon, an "In your list" button in a product hero, the
 * note under a range table — and there must be exactly one drawer for them to
 * open.
 *
 * Mounted once, in app/(marketing)/layout.tsx, around the header and the page.
 */

type QuoteListDrawerValue = {
  open: boolean;
  /**
   * Opens the drawer. Pass the control that was pressed — `e.currentTarget` —
   * so focus can go back to it when the drawer closes.
   */
  openList: (opener?: HTMLElement | null) => void;
  closeList: () => void;
};

const Ctx = createContext<QuoteListDrawerValue | null>(null);

export function QuoteListProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  /**
   * What opened the drawer, so closing it can hand focus back.
   *
   * Radix does this by itself for a <Dialog.Trigger>, and only for one. This
   * drawer has no single trigger — it is opened from the header, from a
   * product hero and from under a range table — so the opener is remembered
   * here instead. Without it, closing leaves focus on <body> and a keyboard
   * user's next Tab starts again from the top of the page.
   */
  const opener = useRef<HTMLElement | null>(null);

  // A route change closes the drawer. The links inside it close it themselves,
  // but Back and Forward have no click handler to hang that on, and a drawer
  // left open over the page you just went back to reads as a stuck page.
  // Adjusted during render, the same way SiteHeader resets its menus.
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(false);
  }

  const openList = useCallback((from?: HTMLElement | null) => {
    // Falls back to whatever has focus. A mouse click does not focus a button
    // in every browser, which is why callers pass the element when they can.
    opener.current = from ?? (document.activeElement as HTMLElement | null);
    setOpen(true);
  }, []);
  const closeList = useCallback(() => setOpen(false), []);

  const restoreFocus = useCallback((event: Event) => {
    // Radix's own default here is to focus its trigger, and it has none.
    event.preventDefault();
    // preventScroll matters more than it looks. <html> carries
    // scroll-padding-top for anchor links, which makes the browser treat the
    // sticky header as out of view — focusing the header icon without this
    // scrolls the page a third of a screen to "reveal" a button that never
    // left it.
    opener.current?.focus({ preventScroll: true });
    opener.current = null;
  }, []);

  const value = useMemo(() => ({ open, openList, closeList }), [open, openList, closeList]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <QuoteListDrawer open={open} onOpenChange={setOpen} onCloseAutoFocus={restoreFocus} />
    </Ctx.Provider>
  );
}

export function useQuoteListDrawer(): QuoteListDrawerValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useQuoteListDrawer must be used inside <QuoteListProvider>");
  }
  return ctx;
}
