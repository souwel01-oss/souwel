import type { Metadata } from "next";
import { Source_Sans_3, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
// Shared with app/sitemap.ts and app/robots.ts. It was inline here once, and
// that is exactly how those two ended up emitting localhost URLs on the live
// site while this file was correct.
import { resolveBaseUrl } from "@/lib/base-url";
import "./globals.css";

/**
 * Typography per contracts/design-tokens.md:
 * - Marketing surfaces use a high-contrast serif display face (premium register)
 * - Dashboards use a system-style sans (data density)
 */
const sans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const heading = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

/*
 * There is deliberately no mono webfont. Geist Mono used to be loaded here and
 * exposed as --font-mono, but nothing on the site ever rendered in it — no
 * `font-mono` class, no component. It was a whole extra font file fetched on
 * every page for zero rendered glyphs. --font-mono now resolves to the system
 * mono stack in globals.css, which costs nothing and looks the same for the
 * incidental cases (tabular figures, code) it would ever be used for.
 */

export const metadata: Metadata = {
  metadataBase: new URL(resolveBaseUrl()),
  title: {
    default: "Souwel — B2B Textile Manufacturing",
    template: "%s | Souwel",
  },
  description:
    "Premium textile manufacturing for hospitality, health-care, institutional laundry, and commercial/automotive sectors.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      // The script in <head> adds `anim-ready` to this element before React
      // hydrates, so the client className never matches the server one and
      // React logs a hydration mismatch for <html>. This is the sanctioned fix
      // for pre-paint class scripts and it is scoped to this element's
      // attributes only — children still hydrate under the normal rules.
      suppressHydrationWarning
      className={`${sans.variable} ${heading.variable} h-full antialiased`}
    >
      {/*
        suppressHydrationWarning here is about BROWSER EXTENSIONS, not our own
        markup — and it is scoped to this element's own attributes only, so
        every child in <head> still hydrates under the normal rules.

        Extensions (password managers, ad blockers, dark-mode toggles, Grammarly)
        routinely stamp an attribute onto <head> while the HTML is still
        parsing, which is before React loads. React then hydrates, finds an
        attribute on <head> that is not in its tree, and logs "a tree hydrated
        but some attributes of the server rendered HTML didn't match" — with the
        diff anchored on <head>. Reproduced exactly that, by injecting a single
        attribute onto document.head pre-hydration; a clean profile with no
        extensions produced no warning on any route.

        Nothing we render puts a dynamic attribute on <head>, so there is no
        real mismatch this could ever be masking. Without it the app is correct
        but every visitor running a common extension sees a red dev overlay on
        a healthy page.
      */}
      <head suppressHydrationWarning>
        {/*
          Runs before first paint, ahead of hydration.

          Without it the hero flashes: the server HTML paints at full opacity,
          then ~700ms later GSAP hydrates, sets its from-states, and the copy
          vanishes before animating back in. Measured that exact sequence —
          visible at 416ms, opacity 0 at 898ms, revealed by 1826ms.

          Gating the hidden state on a class this script adds means:
            - JS disabled  -> class never added -> content simply visible
            - JS enabled   -> content hidden before paint, no flash
            - JS broken    -> the failsafe below reveals everything anyway

          The failsafe is the important half. Anything already animated has an
          inline opacity, which outranks the class, so removing it is a no-op
          for the healthy path and a rescue for the broken one.
        */}
        {/*
          The second half decides whether the intro overlay plays. It has to run
          here, before paint, for the same reason as the block above: deciding in
          a component means the hero paints first and the overlay drops on top of
          it, which looks like a bug rather than an entrance.

          Two gates, both of which must pass:
            - homepage only          (an intro on /login is just a delay)
            - not prefers-reduced-motion

          There is deliberately NO once-per-session gate. This plays on every
          load and every refresh, by request. The sequence is held under three
          seconds precisely because repeat visitors now see it every time — that
          budget is the only thing standing between "branded" and "in the way".

          THE 2950ms TIMEOUT IS THE PRIMARY MECHANISM, NOT A FAILSAFE, AND THAT
          IS THE FIX FOR THE REAL SLOWNESS.

          `data-intro` is what shows the overlay and locks scrolling, so its
          removal is the moment the visitor gets the page. That used to happen
          inside React, which meant it waited for hydration — and hydration is
          precisely what is slow on a slow device. Walking the site on a
          4x-throttled CPU: the page painted at ~0.5s, then sat behind the
          overlay until 3.9s. Moving only the dissolve to CSS did not help,
          because the attribute removal was still behind React; re-measured at
          4.1s, no better.

          Removing it here instead — outside React, on a timer started before
          first paint — makes the sequence cost the same on every device. It
          lands just past the CSS dissolve (2000ms delay + 800ms fade), so the
          overlay is already fully transparent when the attribute goes.

          React's own cleanup still runs and is still correct; it now just
          unmounts a node that is already invisible and already unlocked.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.documentElement;d.classList.add('anim-ready');
setTimeout(function(){d.classList.remove('anim-ready')},3400);
try{if(location.pathname==='/'&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.setAttribute('data-intro','');setTimeout(function(){d.removeAttribute('data-intro')},2950);}}catch(e){}})();`,
          }}
        />
      </head>
      {/*
        And <body> for the same reason — this is the one that actually fires in
        practice. Tested each of the three root elements by stamping a single
        attribute on it before hydration: <html> and <head> were already covered
        by the two above, and <body> was the only one still logging a mismatch.

        <body> is also the most common target. Grammarly marks it with
        `data-gr-ext-installed` and `data-new-gr-c-s-check-loaded`, and password
        managers and accessibility extensions behave the same way, so this is the
        attribute that reaches a real visitor's console.

        Same narrow scope as the others: this element's own attributes only.
        Every child — the entire app — still hydrates under the normal rules, and
        nothing we render puts a dynamic attribute on <body>, so there is no real
        mismatch this can hide.
      */}
      <body suppressHydrationWarning className="flex min-h-full flex-col">
        {/* Owns the light/dark class on <html>. Wraps everything, including the
            Toaster, so a toast raised on a dark page is not the one white
            rectangle on screen. */}
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
