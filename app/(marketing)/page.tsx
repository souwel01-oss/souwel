import type { Metadata } from "next";
import { Hero } from "@/components/marketing/Hero";
import { ProductCollection } from "@/components/marketing/ProductCollection";
import { CategoryCarousel } from "@/components/marketing/CategoryCarousel";
import { VideoSection } from "@/components/marketing/VideoSection";
import { CoverageMap } from "@/components/marketing/CoverageMap";
import { Reveal } from "@/components/animation/Reveal";
import { IntroVideo } from "@/components/animation/IntroVideo";

export const metadata: Metadata = {
  title: "Premium B2B Textile Manufacturing",
  description:
    "Specification-grade textiles for hospitality, health-care, institutional laundry, and commercial/automotive sectors. Request a quote — no account required.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "Souwel — Premium B2B Textile Manufacturing",
    description:
      "Specification-grade textiles for hospitality, health-care, institutional laundry, and commercial/automotive sectors.",
    url: "/",
  },
};

/**
 * Homepage — the six client-approved sections in the exact order set by FR-007.
 * The header and footer (sections 1 and 6) are supplied by (marketing)/layout.tsx.
 *
 * Each section gets a DIFFERENT entrance variant so scrolling the page does not
 * feel like the same animation four times, while the shared timing scale in
 * lib/animation/config keeps them reading as one system.
 */
export default function HomePage() {
  return (
    <main>
      {/* Server-rendered so it is already painted in the first frame; it hides
          itself unless the pre-paint script in app/layout.tsx opts this load in.

          Lives HERE and not in the marketing layout even though it is
          `position: fixed` and cares nothing for its place in the DOM. In the
          layout it would render on every marketing page, and a `preload="auto"`
          video is fetched by the browser whether or not its element is
          displayed — so /about and /contact would each pull half a megabyte of
          footage for an overlay that is set to `display: none`. The intro is
          homepage-only, so it belongs on the homepage. */}
      <IntroVideo />

      {/* Hero is above the fold — it animates on load, not on scroll. */}
      <Hero />

      {/* No wrapper here on purpose. Product Collection animates its own parts
          — heading, then tiles row by row via ScrollTrigger.batch. Fading the
          whole section in as one block would swallow all of that. */}
      <ProductCollection />

      <Reveal variant="scale">
        <CategoryCarousel />
      </Reveal>

      <Reveal variant="clip">
        <VideoSection />
      </Reveal>

      {/* Like Product Collection, Coverage animates its own parts — copy, list
          and the map's build-in sequence. A section-level wrapper would fade
          all of that in as one block. */}
      <CoverageMap />
    </main>
  );
}
