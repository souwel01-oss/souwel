import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HOSPITALITY_GROUPS } from "@/lib/hospitality";
import { LiteYouTube } from "@/components/marketing/LiteYouTube";
import { PromoVideo } from "@/components/marketing/PromoVideo";
import { Reveal } from "@/components/animation/Reveal";

export const metadata: Metadata = {
  title: "Hospitality Linens",
  description:
    "Bed, bath, table and kitchen linen for hotels, resorts and banqueting, plus towelling for the pool, spa and salon floor. Specified for commercial laundering and quoted against your volumes.",
  alternates: { canonical: "/hospitality" },
  openGraph: {
    type: "website",
    url: "/hospitality",
    title: "Hospitality Linens | Souwel",
    description:
      "Bed, bath, table and kitchen linen for hotels, resorts and banqueting, plus towelling for the pool, spa and salon floor.",
  },
};

/**
 * The Hospitality landing page: a video band, then the five ranges.
 *
 * THIS IS THE CANONICAL HOSPITALITY PAGE. /categories/hospitality redirects
 * here rather than serving a second page about the same thing — two URLs
 * covering one range splits the inbound links and asks a search engine to pick
 * a winner.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TO REPLACE THE VIDEO, drop a file at:
 *
 *   public/videos/hospitality.mp4        ← the film
 *   public/videos/hospitality.jpg        ← optional still, used as the poster
 *
 * Until it exists the band plays the same footage the homepage falls back to,
 * so the section is a real, playable video rather than a black box with a dead
 * control on it. Nothing else changes when the file lands. Keep it under ~50MB;
 * these ship in the git repository and GitHub rejects anything over 100MB.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const VIDEO_FILE = "hospitality.mp4";
const VIDEO_POSTER = "hospitality.jpg";
const FALLBACK_YOUTUBE_ID = "rOzAV40WgMA";

const PUBLIC_VIDEOS = path.join(process.cwd(), "public", "videos");

function resolveVideo() {
  if (!existsSync(path.join(PUBLIC_VIDEOS, VIDEO_FILE))) return null;
  return {
    src: `/videos/${VIDEO_FILE}`,
    poster: existsSync(path.join(PUBLIC_VIDEOS, VIDEO_POSTER))
      ? `/videos/${VIDEO_POSTER}`
      : undefined,
  };
}

export default function HospitalityPage() {
  const video = resolveVideo();

  return (
    <main className="bg-background">
      {/* ── Video band ──────────────────────────────────────────────────
          Full bleed directly under the header: no container, no rounding, no
          frame. A 16:9 film inside a padded card reads as an embed; edge to
          edge it reads as the page opening on footage. */}
      <section
        aria-label="Souwel hospitality linens"
        className="bg-navy relative isolate overflow-hidden"
      >
        {video ? (
          <PromoVideo src={video.src} poster={video.poster} label="Hospitality Linens" />
        ) : (
          <LiteYouTube
            videoId={FALLBACK_YOUTUBE_ID}
            title="Souwel hospitality linens"
            poster="maxresdefault"
            priority
          />
        )}
      </section>

      {/* ── Heading ─────────────────────────────────────────────────────── */}
      <section className="border-premium/20 border-b">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <Reveal variant="fade-up">
            <p className="text-premium text-[13px] font-semibold tracking-[0.14em] uppercase">
              Hospitality
            </p>
            <h1 className="font-heading text-foreground mt-3 max-w-3xl text-4xl leading-[1.08] font-semibold text-balance sm:text-5xl">
              Hospitality Linens
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed text-pretty">
              Everything a property puts on a bed, hands to a guest, dresses a table with or works
              behind the pass. Built for the laundry cycle it will actually live in, supplied to one
              specification across every property in a group, and priced against your volumes rather
              than off a shelf.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── The five ranges ─────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          {/* SIX COLUMNS, NOT FIVE OR THREE. Five cards in a three-column grid
              leaves a hole on the last row that reads as a missing card. On six
              columns the first three take two columns each and the last two
              take three each, so both rows fill edge to edge and the change of
              width reads as a deliberate rhythm rather than a gap. */}
          <Reveal
            variant="fade-up"
            stagger
            className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-6"
          >
            {HOSPITALITY_GROUPS.map((group, index) => (
              <Link
                key={group.slug}
                href={`/hospitality/${group.slug}`}
                className={`group focus-visible:ring-ring block rounded-sm focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none ${
                  index < 3 ? "lg:col-span-2" : "lg:col-span-3"
                }`}
              >
                {/* The image, with the range name laid over its foot — the
                    treatment from the client's reference. The scrim is a
                    gradient rather than a flat tint so the top of the
                    photograph is untouched; a full overlay would grey out the
                    weave, which is the one thing the photograph is for. */}
                {/* The last two run wider AND shallower. At half the row
                    width a 4:3 frame is 420px tall against the top row's 276,
                    so the two trailing cards dominate a grid they are only
                    meant to complete. 2:1 puts them within six pixels of the
                    row above, which is what makes the 3-then-2 read as a
                    rhythm rather than as two sizes of card. */}
                <div
                  className={`relative aspect-[4/3] w-full overflow-hidden ${
                    index < 3 ? "" : "lg:aspect-[2/1]"
                  }`}
                >
                  <Image
                    src={group.image.src}
                    alt={group.image.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-[700ms] ease-[var(--ease-out)] group-hover:scale-[1.04]"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,37,64,0.78)_0%,rgba(10,37,64,0.28)_38%,transparent_62%)]"
                  />
                  <h2 className="text-ivory absolute right-5 bottom-4 left-5 text-[1.0625rem] leading-snug font-medium">
                    {group.title}
                  </h2>
                </div>

                <p className="text-muted-foreground mt-4 text-[14.5px] leading-relaxed">
                  {group.description}
                </p>

                <span className="text-primary-strong dark:text-primary mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold">
                  {group.items.length} lines
                  <ArrowRight
                    aria-hidden
                    className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── Quote prompt ────────────────────────────────────────────────── */}
      <section className="bg-navy text-ivory relative isolate overflow-hidden">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/4 -z-10 h-80 w-[36rem] rounded-full bg-[#0b97ff]/18 blur-[100px]"
        />
        <div className="mx-auto w-full max-w-6xl px-5 py-16 text-center sm:px-8 sm:py-20">
          <Reveal variant="fade-up">
            <h2 className="font-heading mx-auto max-w-2xl text-3xl font-semibold text-balance sm:text-4xl">
              Tell us what your property runs
            </h2>
            <p className="text-ivory/75 mx-auto mt-4 max-w-xl leading-relaxed">
              Sizes, weights and annual volumes. We come back with pricing, specifications and lead
              times — no account needed to ask.
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
    </main>
  );
}
