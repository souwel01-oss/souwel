import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { PortalTopBar } from "@/components/portal/PortalTopBar";

/**
 * Customer portal shell.
 *
 * THIS IS THE ACCESS CONTROL — not middleware.ts, which only checks that a
 * cookie exists. The session is verified here, on the server, before any child
 * page renders. A forged, expired or revoked cookie gets past the middleware
 * and is stopped at this line.
 *
 * `getSessionUser` fails closed: if the session store is unreachable it
 * returns null and this redirects, so an outage can never present a portal
 * page to a stranger.
 */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  if (!user) {
    // The precise destination is preserved by middleware.ts, which sees the
    // full pathname. Reaching here without a valid session usually means the
    // cookie was present but no longer good, so the plain path is right.
    redirect("/login?next=/dashboard");
  }

  return (
    <div className="bg-background flex min-h-dvh flex-1">
      {/* Ambient field. The glass cards need something to blur — over a flat
          background `backdrop-filter` produces a slightly-wrong grey rather
          than a translucent pane. Fixed, so it does not scroll with content,
          and pointer-events-none so it never eats a click.

          The first pass used 0.10-0.11 alphas and was invisible on ivory: the
          cards rendered as plain white panels and the whole glass treatment
          did nothing. These values are where the tint reads through the card
          without becoming a colour wash over the page. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(58rem 38rem at 10% -6%, rgb(11 151 255 / 0.20), transparent 62%)," +
            "radial-gradient(46rem 32rem at 98% 2%, rgb(201 168 76 / 0.24), transparent 64%)," +
            "radial-gradient(44rem 32rem at 76% 96%, rgb(109 26 42 / 0.13), transparent 62%)",
        }}
      />

      <PortalSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <PortalTopBar user={{ name: user.name, email: user.email, image: user.image }} />

        {/* pb-24 on mobile clears the fixed bottom nav; without it the last row
            of any list is permanently under it. */}
        <main className="flex-1 px-4 pt-6 pb-24 sm:px-7 lg:pb-10">{children}</main>
      </div>
    </div>
  );
}
