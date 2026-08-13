"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";

/**
 * Lightweight YouTube facade.
 *
 * A raw YouTube <iframe> pulls ~1MB of player JS on page load, which would wreck
 * the homepage LCP budget (plan.md targets LCP < 2.5s). Instead we render the
 * poster image plus a play control, and only mount the real iframe after the
 * user actually clicks — at which point autoplay resumes the intent.
 *
 * Uses youtube-nocookie.com so no tracking cookies are set until playback starts.
 * The wrapper reserves a 16:9 box up front, so swapping in the iframe causes no
 * layout shift (CLS budget).
 */

type LiteYouTubeProps = {
  videoId: string;
  title: string;
  className?: string;
  /** Poster quality. maxres is sharpest but does not exist for every video. */
  poster?: "maxresdefault" | "sddefault" | "hqdefault";
  priority?: boolean;
};

export function LiteYouTube({
  videoId,
  title,
  className,
  poster = "maxresdefault",
  priority = false,
}: LiteYouTubeProps) {
  const [playing, setPlaying] = useState(false);

  return (
    /* No border radius here on purpose: the caller decides. This used to
       hardcode `rounded-lg`, which a full-bleed usage cannot undo — two
       utilities of equal specificity are resolved by stylesheet order, not by
       the order they appear in the class string. */
    <div className={`relative aspect-video w-full overflow-hidden bg-black/40 ${className ?? ""}`}>
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="group focus-visible:ring-ring absolute inset-0 h-full w-full focus-visible:ring-2 focus-visible:ring-inset"
        >
          <Image
            src={`https://i.ytimg.com/vi/${videoId}/${poster}.jpg`}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />

          {/* Scrim keeps the play control legible over any thumbnail */}
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/10 transition-opacity group-hover:from-black/45"
          />

          <span
            aria-hidden
            className="bg-accent-gold text-navy absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full shadow-xl transition-transform duration-300 group-hover:scale-110 sm:size-20"
          >
            <Play className="ml-1 size-6 fill-current sm:size-7" />
          </span>
        </button>
      )}
    </div>
  );
}
