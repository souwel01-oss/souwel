import Link from "next/link";
import { Reveal } from "@/components/animation/Reveal";

/** The navy "Request a quote" band at the foot of each range page. */
export function RangeQuotePrompt() {
  return (
    <section className="bg-navy text-ivory relative isolate overflow-hidden">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/4 -z-10 h-80 w-[36rem] rounded-full bg-[#0b97ff]/18 blur-[100px]"
      />
      <div className="mx-auto w-full max-w-6xl px-5 py-16 text-center sm:px-8 sm:py-20">
        <Reveal variant="fade-up">
          <h2 className="font-heading mx-auto max-w-2xl text-3xl font-semibold text-balance sm:text-4xl">
            Partner with us for your linen program
          </h2>
          <p className="text-ivory/75 mx-auto mt-4 max-w-xl leading-relaxed">
            Sizes, weights and annual volumes. We come back with pricing, specifications and lead
            times.
          </p>
          <Link
            href="/quote"
            className="bg-accent-gold text-navy focus-visible:ring-ring mt-8 inline-flex h-12 items-center rounded-lg px-7 text-[15px] font-semibold transition-[filter,transform] duration-200 hover:brightness-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-navy)] focus-visible:outline-none active:translate-y-px"
          >
            Request a quote
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
