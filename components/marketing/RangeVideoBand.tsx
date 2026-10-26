import { existsSync } from "node:fs";
import path from "node:path";
import { LiteYouTube } from "@/components/marketing/LiteYouTube";
import { PromoVideo } from "@/components/marketing/PromoVideo";

/**
 * The full-bleed video band at the top of a range page: Hospitality,
 * Health-Care and Commercial.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TO GIVE A RANGE ITS OWN FILM, drop a file at:
 *
 *   public/videos/<name>.mp4        ← the film ("health-care.mp4")
 *   public/videos/<name>.jpg        ← optional still, used as the poster
 *
 * Until it exists, the band plays the same footage the homepage falls back
 * to, so the section is a real, playable video rather than a black box with a
 * dead control. Nothing else changes when the file arrives. Keep it under
 * ~50MB: these files ship in the git repository, and GitHub rejects anything
 * over 100MB.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Full bleed directly under the header: no container, no rounding, no frame.
 * A 16:9 film inside a padded card reads as an embed; edge to edge it reads
 * as the page opening on footage.
 */

const FALLBACK_YOUTUBE_ID = "rOzAV40WgMA";
const PUBLIC_VIDEOS = path.join(process.cwd(), "public", "videos");

function resolveVideo(name: string) {
  if (!existsSync(path.join(PUBLIC_VIDEOS, `${name}.mp4`))) return null;
  return {
    src: `/videos/${name}.mp4`,
    poster: existsSync(path.join(PUBLIC_VIDEOS, `${name}.jpg`)) ? `/videos/${name}.jpg` : undefined,
  };
}

export function RangeVideoBand({
  name,
  label,
}: {
  /** The file name in public/videos, without its extension. */
  name: string;
  /** What the film is of: the section's accessible name and the player's label. */
  label: string;
}) {
  const video = resolveVideo(name);

  return (
    <section
      aria-label={`Souwel ${label.toLowerCase()}`}
      className="bg-navy relative isolate overflow-hidden"
    >
      {video ? (
        <PromoVideo src={video.src} poster={video.poster} label={label} />
      ) : (
        <LiteYouTube
          videoId={FALLBACK_YOUTUBE_ID}
          title={`Souwel ${label.toLowerCase()}`}
          poster="maxresdefault"
          priority
        />
      )}
    </section>
  );
}
