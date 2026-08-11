"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Theme root.
 *
 * next-themes was already a dependency; this is the first thing to use it. It
 * handles the two parts that are genuinely fiddly to hand-roll:
 *
 *   - the pre-paint inline script that reads localStorage and stamps the class
 *     on <html> BEFORE first paint, so a dark-mode visitor never gets a white
 *     flash on the way in
 *   - keeping `system` live, so a visitor who has never chosen explicitly
 *     follows their OS as it changes rather than only at first load
 *
 * `disableTransitionOnChange` is deliberately OFF. It exists to suppress the
 * colour transition during a swap, and a smooth crossfade is exactly what was
 * asked for — see html.theme-anim in globals.css, which ThemeToggle turns on
 * for the duration of the change.
 *
 * <html suppressHydrationWarning> in app/layout.tsx is what makes the pre-paint
 * script safe: the class it writes is by definition not in React's server
 * output.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="souwel-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
