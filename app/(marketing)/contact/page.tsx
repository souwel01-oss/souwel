import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { CONTACT, addressLine, telHref } from "@/lib/contact-info";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Talk to Souwel about wholesale textiles for hospitality, health care, institutional laundry and commercial use. Send an enquiry and a real person replies within one business day.",
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    url: "/contact",
    title: "Contact Souwel",
    description:
      "Tell us what you need and a real person will come back to you within one business day.",
  },
};

/** One channel in the sidebar. Rendered only when there is something to show. */
function Channel({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3.5">
      <span
        aria-hidden
        className="border-premium/30 bg-premium/10 text-premium grid size-10 shrink-0 place-items-center rounded-lg border"
      >
        <Icon className="size-[18px]" />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.12em] uppercase">
          {label}
        </p>
        <div className="text-foreground mt-1 text-[15px] leading-relaxed break-words">
          {children}
        </div>
      </div>
    </li>
  );
}

const STEPS = [
  {
    title: "We read it, not a robot",
    body: "Your message lands directly in front of the team that handles supply — there is no ticket queue in between.",
  },
  {
    title: "We come back with substance",
    body: "Specifications, realistic volumes and lead times for what you asked about, not a brochure.",
  },
  {
    title: "You decide from there",
    body: "Samples, a formal quote, or nothing at all. Nothing is charged and no account is needed to start.",
  },
];

export default async function ContactPage() {
  const user = await getSessionUser();
  const profile = user
    ? await prisma.customerProfile.findUnique({
        where: { userId: user.id },
        select: { companyName: true, contactName: true },
      })
    : null;

  const prefill = user
    ? {
        name: profile?.contactName ?? user.name,
        email: user.email,
        company: profile?.companyName ?? "",
      }
    : undefined;

  // Direct channels are only rendered once real details exist in
  // lib/contact-info.ts — see the note at the top of that file for why they
  // are not stubbed with plausible-looking numbers.
  const hasDirectChannel = Boolean(CONTACT.email || CONTACT.phone || CONTACT.address);

  return (
    <main className="bg-background">
      {/* Header band. Navy rather than the page background so the page opens
          with the same dark surface the site opens with, and so the form below
          reads as the one bright thing on the screen. */}
      <section className="bg-navy text-ivory relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={{
            backgroundImage:
              "radial-gradient(60% 80% at 15% 0%, rgba(201,168,76,0.16), transparent 70%), radial-gradient(50% 70% at 90% 100%, rgba(11,151,255,0.14), transparent 70%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <p className="text-premium text-[13px] font-semibold tracking-[0.14em] uppercase">
            Contact us
          </p>
          <h1 className="font-heading mt-3 max-w-2xl text-3xl leading-tight font-semibold text-balance sm:text-4xl lg:text-5xl">
            Let&rsquo;s talk about what you need
          </h1>
          <p className="text-ivory/80 mt-5 max-w-xl text-[15px] leading-relaxed sm:text-base">
            Whether you are pricing a single order or looking for a supplier you can keep coming
            back to, tell us what you are working with. A real person reads every message and
            replies within {CONTACT.responseTime}.
          </p>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
        {/* Form first in the DOM as well as on screen: it is the thing this
            page exists to get used, and on a phone the sidebar stacks below it
            rather than pushing it under a fold of addresses. */}
        <section aria-labelledby="contact-form-heading">
          <h2 id="contact-form-heading" className="text-foreground text-xl font-semibold">
            Send us a message
          </h2>
          <p className="text-muted-foreground mt-2 mb-7 text-[15px] leading-relaxed">
            No account required.{" "}
            {!user ? (
              <>
                <Link
                  href="/login?next=%2Fcontact"
                  className="text-primary font-semibold underline underline-offset-4"
                >
                  Sign in
                </Link>{" "}
                if you have one and this will be added to your history.
              </>
            ) : (
              <>This will be added to your account history.</>
            )}
          </p>

          <ContactForm prefill={prefill} responseTime={CONTACT.responseTime} />
        </section>

        <aside className="grid content-start gap-5">
          <div className="border-border bg-card rounded-2xl border p-6">
            <h2 className="text-foreground text-lg font-semibold">Reach us directly</h2>

            <ul className="mt-5 grid gap-5">
              {CONTACT.email ? (
                <Channel icon={Mail} label="Email">
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="hover:text-primary transition-colors"
                  >
                    {CONTACT.email}
                  </a>
                  {CONTACT.salesEmail && CONTACT.salesEmail !== CONTACT.email ? (
                    <>
                      <br />
                      <a
                        href={`mailto:${CONTACT.salesEmail}`}
                        className="hover:text-primary transition-colors"
                      >
                        {CONTACT.salesEmail}
                      </a>
                    </>
                  ) : null}
                </Channel>
              ) : null}

              {CONTACT.phone ? (
                <Channel icon={Phone} label="Phone">
                  <a href={telHref(CONTACT.phone)} className="hover:text-primary transition-colors">
                    {CONTACT.phone}
                  </a>
                </Channel>
              ) : null}

              {CONTACT.address ? (
                <Channel icon={MapPin} label="Address">
                  <address className="not-italic">{addressLine(CONTACT.address)}</address>
                </Channel>
              ) : null}

              {!hasDirectChannel ? (
                <Channel icon={MessageSquare} label="Enquiries">
                  The form is the fastest way to us right now, and it reaches the team directly. We
                  are based in {CONTACT.baseCity} and ship nationwide.
                </Channel>
              ) : null}

              <Channel icon={Clock} label="Hours">
                <ul className="grid gap-1">
                  {CONTACT.hours.map((h) => (
                    <li key={h.days} className="flex flex-wrap gap-x-2">
                      <span className="text-muted-foreground">{h.days}</span>
                      <span>{h.time}</span>
                    </li>
                  ))}
                </ul>
              </Channel>
            </ul>
          </div>

          {/* The one thing a visitor on this page most often actually wants.
              Kept as a separate card so it is not read as a footnote to the
              address block. */}
          <div className="border-premium/30 bg-premium/[0.07] rounded-2xl border p-6">
            <h2 className="text-foreground text-lg font-semibold">Know what you need already?</h2>
            <p className="text-muted-foreground mt-2 text-[14.5px] leading-relaxed">
              Skip the back and forth. List your products and volumes and we will reply with
              pricing, specifications and lead times.
            </p>
            <Link
              href="/quote"
              className="bg-primary-strong text-primary-strong-foreground focus-visible:ring-ring mt-4 inline-flex h-11 items-center rounded-lg px-5 text-sm font-semibold transition-[filter] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Request a quote
            </Link>
          </div>
        </aside>
      </div>

      <section aria-labelledby="next-heading" className="border-border/60 border-t">
        <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
          <h2 id="next-heading" className="text-foreground text-xl font-semibold">
            What happens next
          </h2>
          <ol className="mt-7 grid gap-6 sm:grid-cols-3 sm:gap-8">
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <span
                  aria-hidden
                  className="border-border text-premium grid size-9 place-items-center rounded-full border font-mono text-sm font-semibold"
                >
                  {i + 1}
                </span>
                <h3 className="text-foreground mt-4 text-[15.5px] font-semibold">{step.title}</h3>
                <p className="text-muted-foreground mt-2 text-[14.5px] leading-relaxed">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
