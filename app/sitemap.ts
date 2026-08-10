import type { MetadataRoute } from "next";
import { resolveBaseUrl } from "@/lib/base-url";
import { LIVE_ROUTES } from "@/lib/site-config";
import { PRODUCT_PAGE_SLUGS } from "@/lib/product-slugs";

/**
 * sitemap.xml (NFR: SEO).
 *
 * ONLY ROUTES THAT ACTUALLY RESOLVE GO IN HERE, which is why it reads from
 * LIVE_ROUTES rather than from MAIN_NAV. It is tempting to list every page the
 * site is planned to have, but a sitemap is a set of promises to a crawler:
 * submitting URLs that return 404 is worse than omitting them, because it
 * teaches the crawler the file is unreliable and spends crawl budget on dead
 * links. Today that means the homepage and nothing else.
 *
 * /dashboard and /admin are deliberately absent and stay absent: they are meant
 * to be behind auth and carry per-customer data.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = resolveBaseUrl();
  const now = new Date();

  // LIVE_ROUTES covers everything that is not a product page. The product pages
  // come from PRODUCT_PAGE_SLUGS — the same list the route's
  // generateStaticParams builds from — so a product cannot exist as a page and
  // be missing from the sitemap, or vice versa.
  const pages = [
    ...LIVE_ROUTES.map((r) => r.href),
    ...PRODUCT_PAGE_SLUGS.map((slug) => `/products/${slug}`),
  ];

  return pages.map((href) => ({
    url: `${base}${href}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: href === "/" ? 1 : 0.7,
  }));
}
