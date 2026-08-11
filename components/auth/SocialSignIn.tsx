"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { AppleMark, GoogleMark } from "@/components/auth/ProviderIcons";
import { cn } from "@/lib/utils";

/**
 * "Continue with Google / Apple".
 *
 * WHICH BUTTONS EXIST IS DECIDED ON THE SERVER, not here — the parent passes
 * `providers` down from lib/auth's `enabledSocialProviders`, which is derived
 * from whether the credentials are actually present. A button for a provider
 * that has not been configured is worse than no button: it looks like a
 * supported route into the account and dead-ends on a redirect error.
 *
 * `callbackURL` is where the provider sends the visitor back to. It carries
 * the same `next` the password form uses, so a deep link into the portal
 * survives a round trip through Google.
 */
export function SocialSignIn({
  providers,
  callbackURL,
  disabled,
}: {
  providers: { google: boolean; apple: boolean };
  callbackURL: string;
  disabled?: boolean;
}) {
  const [pending, setPending] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!providers.google && !providers.apple) return null;

  async function go(provider: "google" | "apple") {
    setError(null);
    setPending(provider);
    try {
      // Resolves by navigating away; the finally below only runs if it fails.
      await authClient.signIn.social({ provider, callbackURL });
    } catch {
      setError(`Could not reach ${provider === "google" ? "Google" : "Apple"}. Please try again.`);
      setPending(null);
    }
  }

  const busy = pending !== null || disabled;

  return (
    <div className="grid gap-2.5">
      {providers.google && (
        <button
          type="button"
          onClick={() => go("google")}
          disabled={busy}
          aria-busy={pending === "google"}
          className={cn(
            socialButton,
            // Google's guidelines call for a white (or neutral) button surface.
            // On our dark theme that becomes the light-on-dark variant they
            // also permit, so the mark keeps its required contrast either way.
            "border-input bg-card text-foreground hover:bg-muted"
          )}
        >
          {pending === "google" ? (
            <Loader2 aria-hidden className="size-[18px] animate-spin" />
          ) : (
            <GoogleMark className="size-[18px]" />
          )}
          Continue with Google
        </button>
      )}

      {providers.apple && (
        <button
          type="button"
          onClick={() => go("apple")}
          disabled={busy}
          aria-busy={pending === "apple"}
          className={cn(
            socialButton,
            // Apple permits black-on-light or white-on-dark only. Both are
            // expressed with tokens so the mark inverts with the theme.
            "border-navy bg-navy text-ivory hover:bg-navy/90",
            "dark:border-input dark:bg-ivory dark:text-navy dark:hover:bg-ivory/90"
          )}
        >
          {pending === "apple" ? (
            <Loader2 aria-hidden className="size-[18px] animate-spin" />
          ) : (
            <AppleMark className="mb-0.5 size-[18px]" />
          )}
          Continue with Apple
        </button>
      )}

      {error ? (
        <p role="alert" className="text-destructive text-xs font-medium">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Our design system, their mark — the split both sets of brand rules allow. */
const socialButton =
  "inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border text-[14px] font-semibold " +
  "transition-[background-color,border-color,transform] duration-200 ease-[var(--ease-out)] " +
  "active:translate-y-px focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-[var(--background)] focus-visible:outline-none " +
  "disabled:cursor-not-allowed disabled:opacity-60";
