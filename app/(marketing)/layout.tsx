import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SmoothScroll } from "@/components/animation/SmoothScroll";

/**
 * Public marketing shell (FR-007a, FR-007f).
 * Every route in this group is publicly accessible and indexable.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Skip link — the nav carries 6+ links before content on every page.
          Visually hidden until focused, then pinned to the top-left. */}
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground focus:ring-ring sr-only rounded-md px-4 py-2 text-sm font-semibold focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:ring-2 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Renders nothing; owns the Lenis instance and keeps ScrollTrigger in
          sync with it. Skipped entirely under prefers-reduced-motion. */}
      <SmoothScroll />

      <SiteHeader />

      <div id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </div>

      <SiteFooter />
    </>
  );
}
