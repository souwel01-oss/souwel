import type { Metadata } from "next";
import { Hero } from "@/components/marketing/Hero";
import { ProductCollection } from "@/components/marketing/ProductCollection";
import { CategoryCarousel } from "@/components/marketing/CategoryCarousel";
import { VideoSection } from "@/components/marketing/VideoSection";
import { CoverageMap } from "@/components/marketing/CoverageMap";
import { Reveal } from "@/components/animation/Reveal";
import { IntroVideo } from "@/components/animation/IntroVideo";

const TITLE =
  "Souwel | Wholesale Textile Manufacturer & Distributor for Hospitality, Healthcare & Commercial Industries | Houston, TX";

const DESCRIPTION =
  "Souwel manufactures and distributes quality textiles in bulk for hospitality, healthcare, institutional laundry, and commercial businesses nationwide: built to last, priced fairly, delivered with care.";

export const metadata: Metadata = {
  // `absolute`, not a plain string. The root layout sets a "%s | Souwel"
  // template, and this title already opens with "Souwel" — left to the template
  // the tab would read "…| Houston, TX | Souwel".
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
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
