"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LayoutGrid, LogOut, Package, User as UserIcon } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { firstNameOf, initialsOf } from "@/lib/auth/user";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/animation/gsap";
import { EASE } from "@/lib/animation/config";
import { cn } from "@/lib/utils";

/**
 * Signed-in identity + account menu for the header.
 *
 * ANIMATED WITH GSAP RATHER THAN A CSS TRANSITION because the exit has to
 * finish before the panel leaves the DOM. A CSS-only version either keeps the
 * panel mounted forever — where it stays in the tab order and screen-reader
 * traversal while invisible — or snaps away with no exit at all. Here `open`
 * drives the animation and `mounted` drives the DOM, and the close timeline's
 * onComplete is what unmounts.
 */

type MenuUser = {
  name: string;
  email: string;
  image?: string | null;
};

const ITEMS = [
  { href: "/dashboard/account", label: "Manage My Account", icon: UserIcon },
  { href: "/dashboard/orders", label: "My Orders", icon: Package },
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
] as const;

export function UserMenu({ user, tone = "dark" }: { user: MenuUser; tone?: "dark" | "light" }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const onDark = tone === "dark";

  /**
   * Opening mounts the panel immediately; closing leaves it mounted until the
   * exit timeline finishes and unmounts it in `onComplete`.
   *
   * Both flags are set together in the handlers rather than syncing `mounted`
   * to `open` in an effect — an effect there is a setState during commit, so
   * every open costs an extra render pass, and React's lint rule flags it.
   */
  const openMenu = useCallback(() => {
    setMounted(true);
    setOpen(true);
  }, []);

  useGSAP(
    () => {
      if (!mounted || !panel.current) return;

      const items = panel.current.querySelectorAll("[data-menu-item]");

      if (prefersReducedMotion()) {
        // No motion, but the mount/unmount contract still has to hold or the
        // panel would never be removed after a close.
        gsap.set(panel.current, { opacity: open ? 1 : 0 });
        if (!open) setMounted(false);
        return;
      }

      if (open) {
        const tl = gsap.timeline();
        tl.fromTo(
          panel.current,
          { opacity: 0, y: -10, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: EASE.out }
        ).fromTo(
          items,
          { opacity: 0, x: -8 },
          { opacity: 1, x: 0, duration: 0.26, ease: EASE.soft, stagger: 0.035 },
          // Overlaps the panel's own tween. Waiting for it to finish makes the
          // menu feel like two separate animations rather than one opening.
          "-=0.18"
        );
        return () => void tl.kill();
      }

      // Exit is faster than entry — a menu you have dismissed should get out of
      // the way, not perform on the way out.
      const tl = gsap.timeline({ onComplete: () => setMounted(false) });
      tl.to(items, { opacity: 0, duration: 0.1, ease: EASE.soft }).to(
        panel.current,
        { opacity: 0, y: -6, scale: 0.98, duration: 0.16, ease: EASE.soft },
        "-=0.06"
      );
      return () => void tl.kill();
    },
    { scope: root, dependencies: [open, mounted] }
  );

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  }, []);

  // Outside click. `pointerdown`, not `click`: a click that begins outside and
  // ends inside (a drag onto the panel) should still dismiss, and pointerdown
  // is also what stops the menu re-opening when the trigger itself is hit.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Close on navigation. Client-side routing leaves the panel hanging open over
  // the page it just navigated to, and back/forward has no click to hook.
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    if (open) setOpen(false);
  }

  /** Roving focus inside the panel. */
  function onPanelKeyDown(e: React.KeyboardEvent) {
    if (!panel.current) return;
    const focusables = Array.from(
      panel.current.querySelectorAll<HTMLElement>("[data-menu-item]")
    );
    const index = focusables.indexOf(document.activeElement as HTMLElement);

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const delta = e.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (index + delta + focusables.length) % focusables.length;
      focusables[nextIndex]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      focusables[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      focusables[focusables.length - 1]?.focus();
    } else if (e.key === "Tab") {
      // Tabbing out of the menu is a dismissal, not a trap.
      close();
    }
  }

  function openAndFocus() {
    openMenu();
    // The panel is not in the DOM yet on this tick.
    requestAnimationFrame(() =>
      panel.current?.querySelector<HTMLElement>("[data-menu-item]")?.focus()
    );
  }

  async function signOut() {
    setSigningOut(true);
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("[auth] sign-out failed:", error);
    }
    setOpen(false);
    // push then refresh: the header's signed-in state is read on the server for
    // portal pages, so without the refresh a stale name can survive the
    // navigation.
    router.push("/");
    router.refresh();
  }

  const firstName = firstNameOf(user.name);

  return (
    <div ref={root} className="relative">
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            openAndFocus();
          }
        }}
        className={cn(
          "flex h-10 items-center gap-2.5 rounded-full py-1 pr-2.5 pl-1 transition-colors",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
          onDark ? "hover:bg-white/10" : "hover:bg-muted"
        )}
      >
        <Avatar user={user} onDark={onDark} />
        <span
          className={cn(
            "max-w-[9rem] truncate text-[12.5px] font-semibold tracking-[0.04em]",
            onDark ? "text-ivory" : "text-foreground"
          )}
        >
          {firstName}
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "size-3.5 transition-transform duration-300 ease-[var(--ease-out)]",
            open && "rotate-180",
            onDark ? "text-ivory/60" : "text-muted-foreground"
          )}
        />
      </button>

      {mounted ? (
        <div
          ref={panel}
          role="menu"
          aria-label="Account"
          onKeyDown={onPanelKeyDown}
          className={cn(
            "bg-popover text-popover-foreground border-border absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-xl border p-1.5",
            "shadow-[0_24px_48px_-24px_rgb(10_37_64/0.55)]"
          )}
          // Transform origin matters: without it the scale-in grows from the
          // centre and the panel appears to detach from the button.
          style={{ transformOrigin: "top right" }}
        >
          <div className="border-border/70 mb-1.5 border-b px-3 py-2.5">
            <p className="text-foreground truncate text-[13px] font-semibold">{user.name}</p>
            <p className="text-muted-foreground truncate text-[12px]">{user.email}</p>
          </div>

          {ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              data-menu-item
              onClick={() => close()}
              className="text-foreground/85 hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors focus-visible:outline-none"
            >
              <Icon aria-hidden className="text-muted-foreground size-4" />
              {label}
            </Link>
          ))}

          <div role="separator" className="bg-border/70 my-1.5 h-px" />

          <button
            type="button"
            role="menuitem"
            data-menu-item
            onClick={signOut}
            disabled={signingOut}
            aria-busy={signingOut}
            className="text-destructive hover:bg-destructive/10 focus-visible:bg-destructive/10 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition-colors focus-visible:outline-none disabled:opacity-60"
          >
            <LogOut aria-hidden className="size-4" />
            {signingOut ? "Signing out…" : "Log Out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Avatar. Falls back to initials on a gold ring rather than to a generic
 * silhouette — a page full of identical grey person-icons tells nobody
 * anything, and most B2B accounts will never upload a photo.
 */
export function Avatar({
  user,
  onDark,
  size = 32,
}: {
  user: MenuUser;
  onDark?: boolean;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  if (user.image && !failed) {
    return (
      // Deliberately a plain <img>: these are arbitrary third-party avatar URLs
      // from Google and Apple, and next/image would need every one of those
      // hosts whitelisted in next.config to render at all.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.image}
        alt=""
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className="ring-premium/50 rounded-full object-cover ring-1"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "ring-premium/50 grid shrink-0 place-items-center rounded-full text-[11px] font-bold tracking-wide ring-1",
        onDark ? "bg-white/12 text-ivory" : "bg-navy text-ivory"
      )}
      style={{ width: size, height: size }}
    >
      {initialsOf(user.name)}
    </span>
  );
}
