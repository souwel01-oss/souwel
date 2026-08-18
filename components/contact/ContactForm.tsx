"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Field, FormAlert, SubmitButton } from "@/components/auth/fields";
import { Label } from "@/components/ui/label";
import { submitContactMessage } from "@/app/(marketing)/contact/actions";
import { CONTACT_TOPICS } from "@/lib/contact-info";
import { cn } from "@/lib/utils";

/**
 * The contact enquiry form.
 *
 * Deliberately short. Every field beyond the four a reply actually needs —
 * who, where to write back, what about, what — is a reason to close the tab,
 * and this page is often the last step before a first conversation. Company
 * and phone are optional and say so.
 *
 * Validation is left to the server action rather than mirrored here, with two
 * exceptions handled inline because the browser gives them free: `type=email`
 * and `required`. `noValidate` is NOT set (unlike the quote form, which has
 * cross-row rules the browser cannot express), so the native bubble catches an
 * empty field before a round trip.
 */

export type ContactFormProps = {
  /** Prefill for a signed-in customer, so they are not retyping known details. */
  prefill?: { name: string; email: string; company: string };
  /** Copy for the confirmation state — the page owns the promise it makes. */
  responseTime: string;
};

export function ContactForm({ prefill, responseTime }: ContactFormProps) {
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    try {
      const result = await submitContactMessage({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        company: String(form.get("company") ?? ""),
        phone: String(form.get("phone") ?? ""),
        topic: String(form.get("topic") ?? "") || undefined,
        message: String(form.get("message") ?? ""),
        website: String(form.get("website") ?? ""),
      });

      if (result.ok) {
        setReference(result.reference);
      } else {
        setFormError(result.message);
      }
    } catch {
      setFormError("We could not reach the server. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (reference) {
    return (
      <div className="border-border bg-card rounded-2xl border p-8 text-center">
        <CheckCircle2 aria-hidden className="text-primary mx-auto size-10" />
        <h2 className="text-foreground mt-4 text-2xl font-semibold">Message received</h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-[15px] leading-relaxed">
          Your reference is{" "}
          <span className="text-foreground font-mono font-semibold">{reference}</span>. Someone from
          the team will come back to you within {responseTime}.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="border-border text-foreground hover:bg-muted inline-flex h-11 items-center rounded-lg border px-5 text-sm font-semibold transition-colors"
          >
            Back to home
          </Link>
          <Link
            href="/quote"
            className="bg-primary-strong text-primary-strong-foreground inline-flex h-11 items-center rounded-lg px-5 text-sm font-semibold transition-[filter] hover:brightness-110"
          >
            Request a quote
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      {formError ? <FormAlert kind="error">{formError}</FormAlert> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Your name"
          name="name"
          autoComplete="name"
          required
          defaultValue={prefill?.name}
          placeholder="Jane Whitfield"
        />
        <Field
          label="Work email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={prefill?.email}
          placeholder="jane@company.com"
        />
        <Field
          label="Company"
          name="company"
          autoComplete="organization"
          defaultValue={prefill?.company}
          hint="Optional"
          placeholder="Whitfield Hotel Group"
        />
        <Field
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          hint="Optional — quicker for anything urgent"
          placeholder="+1 713 555 0100"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contact-topic" className="text-foreground/80 text-[13px] font-semibold">
          What is this about?
        </Label>
        <select
          id="contact-topic"
          name="topic"
          defaultValue={CONTACT_TOPICS[0]}
          className={cn(
            "border-input bg-card text-foreground h-11 w-full rounded-lg border px-3 text-[15px]",
            "transition-[border-color,box-shadow] outline-none",
            "focus-visible:border-primary focus-visible:ring-primary/25 focus-visible:ring-4"
          )}
        >
          {CONTACT_TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contact-message" className="text-foreground/80 text-[13px] font-semibold">
          How can we help?
        </Label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          maxLength={4000}
          placeholder="Products you are looking at, rough volumes, where you need them delivered, and when."
          className={cn(
            "border-input bg-card text-foreground placeholder:text-muted-foreground/60 w-full resize-y rounded-lg border px-3.5 py-3 text-[15px] leading-relaxed",
            "transition-[border-color,box-shadow] outline-none",
            "focus-visible:border-primary focus-visible:ring-primary/25 focus-visible:ring-4"
          )}
        />
        <p className="text-muted-foreground text-xs">
          The more detail you give, the more useful our first reply will be.
        </p>
      </div>

      {/* Honeypot. Hidden from sight AND from the accessibility tree AND from
          the tab order — a screen-reader user must never be asked to fill in a
          trap. `left-[-9999px]` rather than `display:none` because some bots
          skip fields the browser reports as unrendered. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor="contact-website">Do not fill this in</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-3 sm:max-w-xs">
        <SubmitButton pending={pending} pendingLabel="Sending…">
          Send message
        </SubmitButton>
      </div>
    </form>
  );
}
