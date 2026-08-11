"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth/client";
import { UserMenu } from "@/components/auth/UserMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";

/**
 * The right-hand end of the site header: theme toggle, then either
 * Sign In / Register or the signed-in account menu.
 *
 * THE SESSION IS READ ON THE CLIENT, NOT THE SERVER, AND THAT IS A DELIBERATE
 * TRADE. Reading it in the marketing layout would mean calling headers(),
 * which opts every page in the group into dynamic rendering — the homepage and
 * all twenty-four product pages would stop being statically generated and
 * start rendering per request. Those pages have no other reason to touch a
 * database, and making the whole public site dynamic so a name can appear in
 * the corner is the wrong side of that trade.
 *
 * The cost is one request's worth of "not known yet" on a cold load, which is
 * what the skeleton below covers. It renders at the same width as the signed-in
 * control so nothing shifts when the answer arrives — an empty slot that
 * suddenly fills is a layout shift, and a "Sign In" link that flips to a name
 * is worse: it invites a click that is about to move.
 *
 * NOTHING HERE IS A SECURITY BOUNDARY. Every protected page checks the session
 * on the server (lib/auth/session.ts). This only decides what the header draws.
 */
export function HeaderAuth({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { data: session, isPending } = useSession();
  const onDark = tone === "dark";

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <ThemeToggle tone={onDark ? "onDark" : "auto"} />

      {isPending ? (
        <div
          aria-hidden
          className="ml-1.5 flex h-10 items-center gap-2.5 rounded-full py-1 pr-2.5 pl-1"
        >
          <span
            className={onDark ? "size-8 animate-pulse rounded-full bg-white/15" : "bg-muted size-8 animate-pulse rounded-full"}
          />
          <span
            className={onDark ? "h-3 w-16 animate-pulse rounded bg-white/12" : "bg-muted h-3 w-16 animate-pulse rounded"}
          />
        </div>
      ) : session?.user ? (
        <div className="ml-1.5">
          <UserMenu
            tone={onDark ? "dark" : "light"}
            user={{
              name: session.user.name,
              email: session.user.email,
              image: session.user.image,
            }}
          />
        </div>
      ) : (
        <div className="ml-2.5 flex items-center gap-5">
          <Link
            href="/login"
            className={
              onDark
                ? "text-ivory/60 hover:text-ivory text-[11.5px] font-semibold tracking-[0.11em] uppercase transition-colors"
                : "text-muted-foreground hover:text-foreground text-[11.5px] font-semibold tracking-[0.11em] uppercase transition-colors"
            }
          >
            Sign In
          </Link>

          {/* Hairline between the quiet link and the emphasised one, so they
              do not read as a pair of equal actions. */}
          <span aria-hidden className="h-5 w-px bg-white/15" />

          <Button
            asChild
            size="sm"
            variant="outline"
            className="border-accent-gold/70 text-accent-gold hover:bg-accent-gold hover:text-navy hover:border-accent-gold glow-ring-gold nav-cta h-9 rounded-[6px] bg-transparent px-5 text-[11.5px] font-semibold tracking-[0.11em] uppercase shadow-[0_0_16px_-6px_rgb(201_168_76/0.55)]"
          >
            <Link href="/register">Register</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Mobile drawer equivalent. Same session, different shape: a dropdown anchored
 * to a header button is wrong inside an already-open full-width drawer, so the
 * account links are listed inline instead.
 */
export function DrawerAuth({ onNavigate }: { onNavigate: () => void }) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div aria-hidden className="h-11 animate-pulse rounded-md bg-white/10" />;
  }

  if (!session?.user) {
    return (
      <>
        <Link
          href="/login"
          onClick={onNavigate}
          className="text-ivory/60 hover:text-ivory rounded-md px-3 py-3.5 text-xs font-semibold tracking-[0.11em] uppercase"
        >
          Sign In
        </Link>
        <Button
          asChild
          variant="outline"
          className="border-accent-gold/70 text-accent-gold hover:bg-accent-gold hover:text-navy glow-ring-gold h-11 rounded-[6px] bg-transparent text-xs font-semibold tracking-[0.11em] uppercase"
        >
          <Link href="/register" onClick={onNavigate}>
            Register
          </Link>
        </Button>
      </>
    );
  }

  return (
    <>
      <p className="text-ivory/45 px-3 pb-1 text-[10px] font-semibold tracking-[0.14em] uppercase">
        {session.user.name}
      </p>
      {[
        { href: "/dashboard/account", label: "Manage My Account" },
        { href: "/dashboard/orders", label: "My Orders" },
        { href: "/dashboard", label: "Dashboard" },
      ].map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className="text-ivory/70 hover:text-ivory rounded-md px-3 py-3.5 text-xs font-semibold tracking-[0.11em] uppercase"
        >
          {item.label}
        </Link>
      ))}
      <SignOutRow onNavigate={onNavigate} />
    </>
  );
}

function SignOutRow({ onNavigate }: { onNavigate: () => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      onClick={async () => {
        setPending(true);
        try {
          await authClient.signOut();
        } catch (error) {
          console.error("[auth] sign-out failed:", error);
        }
        onNavigate();
        router.push("/");
        router.refresh();
      }}
      className="text-destructive w-full rounded-md px-3 py-3.5 text-left text-xs font-semibold tracking-[0.11em] uppercase disabled:opacity-60"
    >
      {pending ? "Signing out…" : "Log Out"}
    </button>
  );
}
