import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { SouwelLogo } from "@/components/marketing/SouwelLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SITE } from "@/lib/site-config";

/**
 * Shell for every authentication screen.
 *
 * A SPLIT, NOT A CENTRED CARD ON AN EMPTY PAGE. Sign-in is where a B2B buyer
 * decides whether this is a real manufacturer, and a lone form floating in
 * whitespace says nothing. The left panel keeps the brand present — navy, gold
 * hairline, one photograph of actual product — and the right side stays a
 * quiet, high-contrast column so the form itself is never fighting it.
 *
 * The panel is `hidden lg:block`: below that width it would push the form
 * under the fold, and a decorative half-screen above a sign-in field is the
 * classic way to make a phone login feel broken.
 *
 * DELIBERATELY NOT WRAPPED IN THE MARKETING SHELL. No mega-menu, no footer
 * link farm. Every extra link on a sign-in page is another way to leave it.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* ---------------------------------------------------------------- */}
      {/* Brand panel                                                       */}
      {/* ---------------------------------------------------------------- */}
      <aside className="bg-navy relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between">
        {/* The photograph is the panel's only texture, so it has to survive the
            washes on top of it. The first pass ran it at 0.22 under a gradient
            that started at FULL navy, which erased it completely — the panel
            rendered as a flat navy rectangle. The image is now readable and the
            gradient only gets opaque where the copy sits. */}
        <Image
          src="/images/products/bed-sheets.jpg"
          alt=""
          fill
          sizes="50vw"
          priority
          className="object-cover opacity-40"
        />
        {/* Two washes, not one: a vertical navy gradient for text legibility
            and an off-centre gold bloom so the panel is not a flat rectangle. */}
        <div
          aria-hidden
          className="from-navy/55 via-navy/75 to-navy absolute inset-0 bg-gradient-to-b"
        />
        <div
          aria-hidden
          className="absolute -top-24 -right-20 size-[32rem] rounded-full opacity-70 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgb(201 168 76 / 0.5), transparent 66%)",
          }}
        />

        <div className="relative z-10 p-10">
          <Link
            href="/"
            aria-label={`${SITE.name} home`}
            className="focus-visible:ring-ring inline-flex rounded-md focus-visible:ring-2 focus-visible:outline-none"
          >
            <SouwelLogo height={24} plate />
          </Link>
        </div>

        <div className="relative z-10 max-w-lg p-10 pb-14">
          <span aria-hidden className="bg-accent-gold mb-7 block h-px w-16" />
          <p className="font-heading text-ivory text-[2.1rem] leading-[1.2]">{SITE.tagline}</p>
          <p className="text-ivory/65 mt-5 text-[15px] leading-relaxed">
            Manage your quotations, orders and documents in one place — and keep every
            specification you have ever approved on record.
          </p>

          <ul className="text-ivory/55 mt-9 flex flex-wrap gap-x-7 gap-y-2 text-[11px] font-semibold tracking-[0.13em] uppercase">
            {["Hospitality", "Health-Care", "Institutional", "Commercial"].map((s) => (
              <li key={s} className="flex items-center gap-2">
                <span aria-hidden className="bg-accent-gold/70 size-1 rounded-full" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* ---------------------------------------------------------------- */}
      {/* Form column                                                       */}
      {/* ---------------------------------------------------------------- */}
      <main className="bg-background relative flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 sm:px-8">
          {/* On desktop the panel already carries the logo, so this slot is the
              way back to the site. On mobile the panel is gone, so it has to
              carry the mark as well. */}
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-2 rounded-md py-2 text-[12px] font-semibold tracking-[0.1em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <ArrowLeft aria-hidden className="size-3.5" />
            <span className="lg:hidden">
              <SouwelLogo height={18} />
            </span>
            <span className="hidden lg:inline">Back to site</span>
          </Link>

          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[26rem]">{children}</div>
        </div>
      </main>
    </div>
  );
}
