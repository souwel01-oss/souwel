import Link from "next/link";
import { FOOTER_LINKS, SITE } from "@/lib/site-config";
import { Atmosphere } from "@/components/marketing/Atmosphere";
import { SouwelLogo } from "@/components/marketing/SouwelLogo";
import { Reveal } from "@/components/animation/Reveal";

/**
 * Footer (FR-007f): logo, short company blurb, and link columns for
 * Categories, Useful Links, and Manufacturing.
 *
 * Columns use <details> so they collapse to an accordion on mobile and sit
 * open as plain columns from `sm` up — no JS required.
 */
export function SiteFooter() {
  return (
    <footer className="bg-navy text-ivory relative isolate mt-auto overflow-hidden">
      <Atmosphere variant="footer" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center" aria-label={`${SITE.name} home`}>
              <SouwelLogo height={26} />
            </Link>

            <p className="text-ivory/70 mt-5 max-w-sm text-sm leading-relaxed">{SITE.blurb}</p>
          </div>

          {/* Link columns */}
          {/* Columns arrive one after another. staggerAmount is well under the
              0.08 house default because three items at 80ms apart reads as a
              queue rather than a group. */}
          <Reveal
            variant="fade-up"
            stagger
            staggerAmount={0.06}
            className="grid gap-2 sm:grid-cols-3 sm:gap-8 lg:col-span-3"
          >
            {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
              <details
                key={heading}
                className="group border-b border-white/10 sm:border-0 sm:open:[&]:block"
                open
              >
                <summary className="font-heading flex cursor-pointer list-none items-center justify-between py-3 text-sm font-semibold tracking-wide sm:cursor-default sm:py-0">
                  {heading}
                  <span
                    aria-hidden
                    className="text-ivory/50 transition-transform group-open:rotate-45 sm:hidden"
                  >
                    +
                  </span>
                </summary>

                {/* Mobile: block links with py-3 give a 44px touch target.
                    sm+: padding collapses and space-y takes over for a tight column. */}
                <ul className="space-y-0 pb-2 sm:mt-5 sm:space-y-2.5 sm:pb-0">
                  {links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-ivory/70 hover:text-ivory block py-3 text-sm transition-colors sm:py-0"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </Reveal>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ivory/55 text-sm">
            &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p className="text-ivory/55 text-sm">
            Pricing is provided by quotation only. No prices are published publicly.
          </p>
        </div>
      </div>
    </footer>
  );
}
