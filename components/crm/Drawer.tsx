"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/animation/gsap";
import { EASE } from "@/lib/animation/config";

/**
 * Detail drawer.
 *
 * OPEN STATE LIVES IN THE URL (`?user=…` / `?lead=…`), not in React state.
 * The contents are then rendered on the SERVER by the page, which means the
 * detail — a customer's quotes, orders and activity — is fetched with the same
 * role guard as everything else rather than through a second client-side
 * endpoint that would need its own authorisation. It also makes a drawer
 * linkable, and makes the browser Back button close it, which is what every
 * user tries first.
 *
 * The exit animation is why closing goes through `close()` rather than a plain
 * <Link>: the panel has to finish sliding out before the navigation removes it
 * from the DOM.
 */
export function Drawer({
  paramName,
  title,
  children,
}: {
  paramName: string;
  title: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const panel = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const closing = useRef(false);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;

    const next = new URLSearchParams(params.toString());
    next.delete(paramName);
    const url = `${pathname}${next.toString() ? `?${next}` : ""}`;

    if (prefersReducedMotion() || !panel.current) {
      router.push(url, { scroll: false });
      return;
    }

    gsap
      .timeline({ onComplete: () => router.push(url, { scroll: false }) })
      .to(panel.current, { xPercent: 100, duration: 0.22, ease: EASE.soft })
      .to(scrim.current, { opacity: 0, duration: 0.22 }, "<");
  }, [params, pathname, paramName, router]);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const tl = gsap.timeline();
    tl.from(scrim.current, { opacity: 0, duration: 0.24 })
      .from(panel.current, { xPercent: 100, duration: 0.34, ease: EASE.out }, "<")
      .from(
        panel.current?.querySelectorAll("[data-drawer-section]") ?? [],
        { opacity: 0, y: 10, duration: 0.28, ease: EASE.soft, stagger: 0.05 },
        "-=0.16"
      );
    return () => void tl.kill();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    // The list behind must not scroll while a full-height panel is over it.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus moves into the panel so a keyboard user is not left on the row
    // they clicked, tabbing through a list that is now behind a scrim.
    const timer = window.setTimeout(() => panel.current?.focus(), 30);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      window.clearTimeout(timer);
    };
  }, [close]);

  return (
    <div className="fixed inset-0 z-50">
      <div
        ref={scrim}
        onClick={close}
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        aria-hidden
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="bg-background border-border absolute inset-y-0 right-0 flex w-full max-w-[34rem] flex-col border-l shadow-2xl outline-none"
      >
        <div className="border-border/60 bg-background/85 sticky top-0 flex items-center justify-between gap-4 border-b px-5 py-4 backdrop-blur-xl">
          <h2 className="font-heading text-foreground truncate text-[1.05rem]">{title}</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring grid size-10 shrink-0 place-items-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <X aria-hidden className="size-4.5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

/** A labelled block inside a drawer. Staggered in by the timeline above. */
export function DrawerSection({
  title,
  children,
  empty,
}: {
  title: string;
  children?: React.ReactNode;
  empty?: string;
}) {
  return (
    <section data-drawer-section className="mb-6 last:mb-0">
      <h3 className="text-muted-foreground mb-2.5 text-[11px] font-semibold tracking-[0.14em] uppercase">
        {title}
      </h3>
      {children ?? <p className="text-muted-foreground text-[13px]">{empty}</p>}
    </section>
  );
}
