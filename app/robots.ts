import type { MetadataRoute } from "next";
import { clientEnv } from "@/lib/env";

/**
 * robots.txt (NFR: SEO).
 *
 * The portal and the CRM are disallowed as well as being `noindex` on the pages
 * themselves — belt and braces, because a crawler that finds a deep link never
 * has to fetch the page to learn it should not.
 *
 * The base URL comes from NEXT_PUBLIC_APP_URL. It defaults to localhost, so the
 * Sitemap line is only correct once that variable is set in the deployment
 * environment. See the note on metadataBase in app/layout.tsx.
 */
export default function robots(): MetadataRoute.Robots {
  const base = clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/admin", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
