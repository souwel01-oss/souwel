import { existsSync } from "node:fs";
import path from "node:path";
import { LiteYouTube } from "@/components/marketing/LiteYouTube";
import { PromoVideo } from "@/components/marketing/PromoVideo";

/**
 * Promotional video band (FR-007d) — two players, no copy.
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
 * ─────────────────────────────────────────────────────────────────────────────
 * TO ADD OR REPLACE A VIDEO, drop the file into public/videos/ with the exact
 * name below. Nothing else has to change.
 *
 *   public/videos/promo-1.mp4      ← left / first
 *   public/videos/promo-2.mp4      ← right / second
 *
 * Optional still frame, shown before playback and used as the poster:
 *
 *   public/videos/promo-1.jpg
 *   public/videos/promo-2.jpg
 *
 * ONLY FILES THAT ACTUALLY EXIST ARE RENDERED. The check is a filesystem lookup
 * at build time, which is possible because this is a server component. A slot
 * pointing at a missing file would render a black box with a play button that
 * fails silently on press — the exact defect this section had before, when it
 * was a gradient with a dead control over it. One video centred is a finished
 * section; two slots with a dead one is not.
 *
 * KEEP EACH FILE UNDER ~50MB. These ship in the git repository, and GitHub
 * rejects any single file over 100MB outright. If the finished cuts are larger
 * than that, they belong on Cloudinary — already configured for this project —
 * rather than in the repo.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const SLOTS = [
  { file: "promo-1.mp4", poster: "promo-1.jpg", label: "Souwel company and product overview" },
  { file: "promo-2.mp4", poster: "promo-2.jpg", label: "Inside Souwel manufacturing" },
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
 * Not a placeholder in the bad sense — it is a real, playable video, the same
 * footage the hero uses. It fills BOTH halves so the split is visible now
 * rather than only after the files land: the same clip twice, on purpose, at
 * the client's request, so the layout can be judged before the footage exists.
 *
 * The moment promo-1.mp4 appears in public/videos/, this stops being used —
 * per half, so uploading one file replaces the left side and leaves this on the
 * right until the second arrives.
 */
const FALLBACK_YOUTUBE_ID = "rOzAV40WgMA";

const HALVES = [
  { key: "left", label: "Souwel company and product overview" },
  { key: "right", label: "Inside Souwel manufacturing" },
];

export function VideoSection() {
  const videos = resolveSlots();

  return (
    /* Full bleed: no section padding, no container, no frame and no rounding,
       so the footage runs edge to edge. The two halves sit side by side on
       desktop and stack on a phone, where half a 16:9 frame is too small to
       read. */
    <section
      aria-label="Souwel promotional videos"
      className="bg-navy text-ivory relative isolate overflow-hidden"
    >
      <div className="grid lg:grid-cols-2">
        {HALVES.map((half, index) => {
          const uploaded = videos[index];
          return uploaded ? (
            <PromoVideo
              key={half.key}
              src={uploaded.src}
              poster={uploaded.posterSrc}
              label={uploaded.label}
            />
          ) : (
            <LiteYouTube
              key={half.key}
              videoId={FALLBACK_YOUTUBE_ID}
              title={half.label}
              poster="maxresdefault"
            />
          );
        })}
      </div>
    </section>
  );
}
