import { Play } from "lucide-react";
import { Atmosphere } from "@/components/marketing/Atmosphere";

/**
 * Video section (FR-007d): two videos side by side — company/product overview
 * and manufacturing process.
 *
 * Placeholders until real assets land. Aspect ratio is reserved up front so
 * swapping in real media causes no layout shift (CLS budget, plan.md).
 * Real embeds must keep loading="lazy" per FR-007d lazy-load requirement.
 */

const VIDEOS = [
  {
    title: "Company & Product Overview",
    description: "Who we supply, and what we make for them.",
    duration: "2:40",
  },
  {
    title: "Inside Our Manufacturing",
    description: "From yarn selection through finishing and quality control.",
    duration: "3:15",
  },
];

export function VideoSection() {
  return (
    <section className="bg-navy text-ivory relative isolate overflow-hidden py-20 sm:py-28 lg:py-32">
      <Atmosphere variant="section" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading offset into the second column — the flush-left section header
            is the same move on every other section, so this one breaks it. */}
        <div className="grid lg:grid-cols-12">
          <div className="lg:col-span-7 lg:col-start-4">
            <p className="text-accent-gold mb-4 text-xs font-semibold tracking-[0.2em] uppercase">
              See The Process
            </p>
            <h2 className="font-heading text-3xl leading-[1.08] font-semibold text-balance sm:text-4xl lg:text-5xl">
              How we build textiles that last
            </h2>
          </div>
        </div>

        {/* Flush two-up, equal height. An earlier version dropped the second
            card by 56px; because these are grid items with the default
            `align-items: stretch`, that margin came out of the second card's
            height instead of moving it, leaving one card visibly shorter than
            the other. Any stagger here has to come from the row, not a margin. */}
        <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {VIDEOS.map((video) => (
            <figure
              key={video.title}
              style={{ "--glow": "#C9A84C" } as React.CSSProperties}
              /* The glass panel wraps thumb + caption together, so the frosted
                 edge is actually visible — behind an opaque thumbnail alone it
                 would have nothing to blur. */
              className="glass glass-glow card-lift group rounded-xl p-3 sm:p-4"
            >
              <div className="relative aspect-video overflow-hidden rounded-lg">
                {/* Placeholder surface — replace with <iframe loading="lazy"> or <video preload="none"> */}
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(109,26,42,0.5) 0%, rgba(10,37,64,0.2) 55%, rgba(45,74,34,0.4) 100%)",
                  }}
                />

                <button
                  type="button"
                  className="focus-visible:ring-ring absolute inset-0 grid place-items-center focus-visible:ring-2 focus-visible:ring-inset"
                  aria-label={`Play video: ${video.title}`}
                >
                  <span className="bg-accent-gold text-navy pulse-gold grid size-16 place-items-center rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110 sm:size-20">
                    <Play className="ml-1 size-6 fill-current sm:size-7" />
                  </span>
                </button>

                <span className="absolute right-3 bottom-3 rounded bg-black/60 px-2 py-1 text-xs font-medium tabular-nums">
                  {video.duration}
                </span>
              </div>

              <figcaption className="px-2 pt-5 pb-2">
                <h3 className="font-heading text-lg font-semibold">{video.title}</h3>
                <span aria-hidden className="bg-accent-gold/70 rule-draw mt-3 block h-px w-10" />
                <p className="text-ivory/70 mt-3 text-sm">{video.description}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
