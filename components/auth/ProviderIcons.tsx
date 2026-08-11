/**
 * Official Google and Apple marks.
 *
 * THESE ARE NOT DECORATIVE ICONS AND THEY ARE NOT INTERCHANGEABLE WITH THE
 * LUCIDE SET used everywhere else on the site. Both companies publish binding
 * rules for their sign-in buttons, and both rules are about the mark itself:
 *
 *   Google — the "G" must keep its four brand colours (#4285F4 #34A853
 *   #FBBC05 #EA4335). It may not be recoloured, mono-toned, or tinted to match
 *   a host design, which rules out `currentColor`. It is hard-coded here for
 *   that reason, and it is the one place in this codebase where raw hex is
 *   correct rather than a palette leak.
 *
 *   Apple — the mark is single-colour and must be black on a light button or
 *   white on a dark one, never a brand colour. `currentColor` is therefore the
 *   right choice here, and it is what lets the same component satisfy the rule
 *   in both our themes automatically.
 *
 * What we ARE free to change is the button around them: corner radius,
 * spacing, and typeface follow our design system, which is what both sets of
 * guidelines permit.
 */

export function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

export function AppleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.42 2.2-1.12 3.02-.85.99-2.23 1.76-3.38 1.67a3.7 3.7 0 0 1 1.06-3.02c.75-.87 2.06-1.55 3.44-1.67zM20.9 17.06c-.55 1.27-.81 1.84-1.52 2.96-.99 1.56-2.39 3.5-4.12 3.52-1.54.01-1.93-1-4.02-.99-2.09.01-2.52 1.01-4.06.99-1.73-.02-3.06-1.77-4.05-3.33C.36 15.87-.13 10.75 1.86 8.03c.97-1.34 2.5-2.13 3.94-2.13 1.47 0 2.39.8 3.6.8 1.18 0 1.9-.8 3.6-.8 1.28 0 2.64.7 3.61 1.9-3.17 1.74-2.66 6.27.29 7.26z" />
    </svg>
  );
}
