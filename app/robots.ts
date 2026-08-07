import type { MetadataRoute } from "next";
import { resolveBaseUrl } from "@/lib/base-url";

/**
 * robots.txt (NFR: SEO).
 *
 * The portal and the CRM are disallowed as well as being `noindex` on the pages
 * themselves — belt and braces, because a crawler that finds a deep link never
 * has to fetch the page to learn it should not.
 *
 * The base URL comes from lib/base-url, which falls back to the Vercel-injected
 * production domain. This file used to read NEXT_PUBLIC_APP_URL directly and
 * shipped `Sitemap: http://localhost:3000/sitemap.xml` to the live site.
 */
export default function robots(): MetadataRoute.Robots {
  const base = resolveBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/admin", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
