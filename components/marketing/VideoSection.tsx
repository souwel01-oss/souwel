import { existsSync } from "node:fs";
import path from "node:path";
import { LiteYouTube } from "@/components/marketing/LiteYouTube";
import { PromoVideo } from "@/components/marketing/PromoVideo";

/**
 * Promotional video band (FR-007d) â€” two players, no copy.
 *
 * DELIBERATELY TEXTLESS. No kicker, no heading, no captions, no durations: the
 * videos speak for themselves and the section is the pause between the
 * catalogue above and the coverage map below.
 *
 * The section still carries an `aria-label`, and each player still has one.
 * Neither renders. They exist because a region with no text at all announces as
 * nothing, and a bare play button with no accessible name cannot be used.
 * Dropping visible copy is a design decision; dropping the accessible name
 * would be a defect.
 *
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * TO ADD OR REPLACE A VIDEO, drop the file into public/videos/ with the exact
 * name below. Nothing else has to change.
 *
 *   public/videos/promo-1.mp4      â† left / first
 *   public/videos/promo-2.mp4      â† right / second
 *
 * Optional still frame, shown before playback and used as the poster:
 *
 *   public/videos/promo-1.jpg
 *   public/videos/promo-2.jpg
 *
 * ONLY FILES THAT ACTUALLY EXIST ARE RENDERED. The check is a filesystem lookup
 * at build time, which is possible because this is a server component. A slot
 * pointing at a missing file would render a black box with a play button that
 * fails silently on press â€” the exact defect this section had before, when it
 * was a gradient with a dead control over it. One video centred is a finished
 * section; two slots with a dead one is not.
 *
 * KEEP EACH FILE UNDER ~50MB. These ship in the git repository, and GitHub
 * rejects any single file over 100MB outright. If the finished cuts are larger
 * than that, they belong on Cloudinary â€” already configured for this project â€”
 * rather than in the repo.
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 */

const SLOTS = [
  { file: "promo-1.mp4", poster: "promo-1.jpg", label: "Our Process" },
  { file: "promo-2.mp4", poster: "promo-2.jpg", label: "Delivered with Care" },
];

const PUBLIC_DIR = path.join(process.cwd(), "public", "videos");

function resolveSlots() {
  return SLOTS.filter((slot) => existsSync(path.join(PUBLIC_DIR, slot.file))).map((slot) => ({
    ...slot,
    src: `/videos/${slot.file}`,
    posterSrc: existsSync(path.join(PUBLIC_DIR, slot.poster))
      ? `/videos/${slot.poster}`
      : undefined,
  }));
}

/**
 * What plays until the real cuts are uploaded.
 *
 * Not a placeholder in the bad sense: two real, playable videos, one for each
 * side of the business, embedded from YouTube rather than copied. Left is
 * Health-Care (how a hospital's linen is washed and handled), right is
 * Hospitality (how cotton becomes bath towels). They are other people's
 * films, chosen because neither shows a supplier's branding; replace them with
 * the client's own as soon as those exist.
 *
 * Per half: uploading promo-1.mp4 replaces the left side and leaves this on the
 * right until promo-2.mp4 arrives.
 */
const FALLBACK = { label: "Hospitality Textiles", videoId: "lo7n9zExxW0" };

export function VideoSection() {
  const uploaded = resolveSlots()[0];

  return (
    /* One video, centred. An uploaded promo-1.mp4 replaces the YouTube film. */
    <section
      aria-label="Souwel promotional video"
      className="bg-navy text-ivory relative isolate overflow-hidden"
    >
      <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        {uploaded ? (
          <PromoVideo src={uploaded.src} poster={uploaded.posterSrc} label={uploaded.label} />
        ) : (
          <LiteYouTube videoId={FALLBACK.videoId} title={FALLBACK.label} poster="maxresdefault" />
        )}
      </div>
    </section>
  );
}
