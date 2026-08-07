import type { MetadataRoute } from "next";
import { clientEnv } from "@/lib/env";
import { LIVE_ROUTES } from "@/lib/site-config";

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
  const base = clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

  return LIVE_ROUTES.map((r) => ({
    url: `${base}${r.href}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: r.href === "/" ? 1 : 0.7,
  }));
}
