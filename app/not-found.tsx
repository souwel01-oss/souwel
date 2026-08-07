import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE, LIVE_ROUTES } from "@/lib/site-config";
import { SouwelLogo } from "@/components/marketing/SouwelLogo";

/**
 * Branded 404.
 *
 * This is not a nicety. Seven of the ten links on the homepage currently point
 * at routes that do not exist yet (/about, /contact, /quote, and the four
 * category pages), so this page is a real destination for real visitors, not a
 * theoretical edge case. Without it they landed on the unstyled Next default —
 * white page, no header, no footer, no way back except the browser button.
 *
 * It lives at the app root rather than inside (marketing), which means it does
 * NOT inherit the marketing header and footer — that layout only wraps its own
 * segment. So the way out is rebuilt here in miniature.
 *
 * The link list comes from LIVE_ROUTES, deliberately, and NOT from MAIN_NAV.
 * The first draft of this page listed the four category pages and /contact from
 * the nav config — every one of which is currently a 404. A recovery page whose
 * recovery links lead straight back to another 404 is worse than no links at
 * all. LIVE_ROUTES only contains routes that resolve; grow it as pages ship.
 *
 * Drop the "may still be in progress" line once the planned routes exist.
 */

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/** Everything live except the homepage, which already has its own button. */
const OTHER_ROUTES = LIVE_ROUTES.filter((r) => r.href !== "/");

export default function NotFound() {
  return (
    <main className="bg-navy text-ivory flex min-h-screen flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-xl text-center">
        <Link
          href="/"
          aria-label={`${SITE.name} home`}
          className="focus-visible:ring-ring inline-flex items-center rounded-sm focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-offset-[#0A2540] focus-visible:outline-none"
        >
          <SouwelLogo height={28} />
        </Link>

        <p className="text-accent-gold mt-12 text-xs font-semibold tracking-[0.22em] uppercase">
          Error 404
        </p>

        <h1 className="font-heading mt-4 text-4xl leading-[1.1] font-semibold text-balance sm:text-5xl">
          We could not find that page
        </h1>

        {/* No "everything below is live" line: the link list under this is
            conditional, and with only the homepage shipped there is currently
            nothing below. Copy must not describe UI that may not render. */}
        <p className="text-ivory/75 mt-5 text-lg leading-relaxed text-pretty">
          The link may be out of date, or the page may still be in progress.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-7 text-base font-semibold"
          >
            <Link href="/">
              Back to homepage
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {/* Only worth rendering once there is somewhere to go that the button
            above does not already cover. With just the homepage live, this list
            was a second "Homepage" link sitting directly under a "Back to
            homepage" button. It appears on its own as routes ship. */}
        {OTHER_ROUTES.length > 0 && (
          <nav aria-label="Helpful links" className="mt-12">
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
              {OTHER_ROUTES.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-ivory/70 hover:text-accent-gold focus-visible:ring-ring rounded-sm underline-offset-4 transition-colors hover:underline focus-visible:ring-2 focus-visible:outline-none"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </main>
  );
}
