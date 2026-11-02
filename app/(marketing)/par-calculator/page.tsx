import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ParCalculator } from "@/components/par-calculator/ParCalculator";

export const metadata: Metadata = {
  title: "Par Calculators",
  description:
    "Work out how many sheets, pillowcases and towels your property needs to keep in circulation, and get the breakdown by email.",
  alternates: { canonical: "/par-calculator" },
};

/**
 * The PAR calculators, reached from "Par Calculator" in the header. The
 * calculators themselves are components/par-calculator/ParCalculator.tsx.
 */
export default function ParCalculatorPage() {
  return (
    <main className="bg-background">
      <section className="border-premium/20 border-b">
        <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-12 sm:px-8 sm:pt-14 sm:pb-14">
          <nav aria-label="Breadcrumb">
            <ol className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-[13px]">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <ChevronRight aria-hidden className="size-3.5 shrink-0" />
              <li className="text-foreground font-medium">Par Calculators</li>
            </ol>
          </nav>

          <h1 className="font-heading text-foreground mt-6 text-3xl leading-[1.1] font-semibold sm:text-4xl lg:text-5xl">
            Par Calculators
          </h1>
          <p className="text-muted-foreground mt-5 max-w-2xl text-[15.5px] leading-relaxed text-pretty">
            Find out how much linen your property needs to keep running. PAR is the number of
            complete sets you hold per bed or room: at PAR 3, one is in use, one is in the laundry
            and one is on the shelf. Answer four short steps and we will email you the full
            breakdown.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <ParCalculator />
        </div>
      </section>
    </main>
  );
}
