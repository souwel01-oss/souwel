/**
 * The site's absolute base URL — ONE resolver, used by everything that emits an
 * absolute URL.
 *
 * This exists because having two resolvers shipped a bug to production. The
 * Vercel-aware version lived inline in app/layout.tsx, so `metadataBase` (and
 * therefore every canonical and og:url) was correct on the live site — while
 * app/sitemap.ts and app/robots.ts still read NEXT_PUBLIC_APP_URL directly and
 * fell back to localhost. The deployed robots.txt read:
 *
 *     Sitemap: http://localhost:3000/sitemap.xml
 *
 * and the sitemap listed localhost URLs. Both files are exactly the ones a
 * crawler reads first, so the one place the mistake was invisible in the page
 * source was the one place it did the most damage.
 *
 * Fallback order, most explicit first:
 *   NEXT_PUBLIC_APP_URL            set deliberately; always wins
 *   VERCEL_PROJECT_PRODUCTION_URL  the project's stable production domain,
 *                                  injected by Vercel — correct even when read
 *                                  during a preview build
 *   VERCEL_URL                     this specific deployment's URL
 *   http://localhost:3000          local development
 *
 * VERCEL_PROJECT_PRODUCTION_URL is checked before VERCEL_URL on purpose: a
 * canonical or a sitemap entry should point at the site's real address, never
 * at a per-deployment hostname that changes on every push.
 */
export function resolveBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
