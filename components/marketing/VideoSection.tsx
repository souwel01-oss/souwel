import { LiteYouTube } from "@/components/marketing/LiteYouTube";

/**
 * Promotional video band (FR-007d) — two players, no copy.
 *
 * DELIBERATELY TEXTLESS. No kicker, no heading, no captions, no durations: the
 * videos speak for themselves and the section is the pause between the
 * catalogue above and the coverage map below.
 *
 * The section still carries an `aria-label`, and each player still has a
 * `title`. Neither is rendered — they exist because a screen reader landing in
 * a region with no text at all has nothing to announce but "region", and a
 * bare play button with no accessible name is unusable. Removing visible text
 * is a design decision; removing the accessible name would be a defect.
 *
 * These are real embeds, not a facade over nothing. What was here before was a
 * decorative gradient with a play button that did nothing when pressed and two
 * invented durations ("2:40", "3:15") presented as fact — a control that looks
 * live and is dead reads as a broken site, which is worse than no control.
 *
 * LiteYouTube keeps the cost down: the poster frame loads, and the ~1MB player
 * bundle only mounts once someone actually presses play.
 */

/**
 * The videos, in order.
 *
 * ONLY REAL IDS BELONG HERE. An id that does not resolve renders a broken
 * poster and a player that fails on press, so the section maps over whatever is
 * configured rather than assuming two — one video centred is a finished-looking
 * section; two slots where one is dead is not.
 */
const PROMO_VIDEOS: { videoId: string; title: string }[] = [
  { videoId: "rOzAV40WgMA", title: "Souwel company and product overview" },
];

export function VideoSection() {
  if (PROMO_VIDEOS.length === 0) return null;

  const single = PROMO_VIDEOS.length === 1;

  return (
    /* Full bleed: no section padding, no container, no frame and no rounding,
       so the footage runs edge to edge and none of the navy shows around it.
       The navy stays as the element's own background only so there is no white
       flash while the poster frame decodes. */
    <section
      aria-label="Souwel promotional videos"
      className="bg-navy text-ivory relative isolate overflow-hidden"
    >
      <div className={single ? "" : "grid lg:grid-cols-2"}>
        {PROMO_VIDEOS.map((video) => (
          <LiteYouTube
            key={video.videoId}
            videoId={video.videoId}
            title={video.title}
            poster="maxresdefault"
          />
        ))}
      </div>
    </section>
  );
}
