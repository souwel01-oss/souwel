/**
 * Vercel's build: `npm run vercel-build`, which Vercel prefers over `build`.
 *
 * Migrates and seeds the database first, but only when one is configured.
 * The public site does not need a database to build, because its product
 * pages come from content files. Before this script, a deploy with no
 * DIRECT_URL failed at its first step with "Connection url is empty". Every
 * deploy from GitHub failed that way, Preview and Production alike, so no page
 * change could go live until the database was connected.
 *
 * WITH DIRECT_URL SET, a failed migration still fails the build. Code that
 * expects a schema the database does not have must not go live.
 *
 * Run through `npm run`, which puts node_modules/.bin on the PATH for the
 * commands below.
 */

import { execSync } from "node:child_process";

const run = (command) => execSync(command, { stdio: "inherit" });

if (process.env.DIRECT_URL) {
  run("prisma migrate deploy");
  run("tsx prisma/seed-catalog.ts");
} else {
  console.warn(
    [
      "",
      "WARNING: DIRECT_URL is not set, so the database migration and catalogue seed are skipped.",
      "The public pages still build. Sign-in, the quote form, the customer portal and the CRM",
      "will not work until DATABASE_URL and DIRECT_URL are set on Vercel (docs/deployment.md).",
      "",
    ].join("\n")
  );
}

run("next build");
