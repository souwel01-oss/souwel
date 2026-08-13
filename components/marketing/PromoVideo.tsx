"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";

/**
 * Self-hosted promotional video.
 *
 * `preload="metadata"` on purpose: the browser fetches enough to paint the
 * first frame and nothing more, so two of these cost a few hundred kilobytes
 * on load rather than the whole file. The homepage LCP budget (plan.md, < 2.5s)
 * does not survive two auto-downloading videos.
 *
 * Controls appear only after the first press. Before that the frame is a clean
 * still with the brand play button over it; a native control bar sitting on a
 * poster frame is the thing that makes a marketing video look like an
 * attachment.
 */

export function PromoVideo({
  src,
  poster,
  label,
}: {
  src: string;
  poster?: string;
  label: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const start = () => {
    setStarted(true);
    void video.current?.play();
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black">
      <video
        ref={video}
        src={src}
        poster={poster}
        preload="metadata"
        playsInline
        controls={started}
        aria-label={label}
        className="h-full w-full object-cover"
      />

      {!started ? (
        <button
          type="button"
          onClick={start}
          aria-label={`Play video: ${label}`}
          className="group focus-visible:ring-ring absolute inset-0 grid place-items-center focus-visible:ring-2 focus-visible:ring-inset"
        >
          {/* Scrim keeps the control legible over a bright first frame. */}
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-black/10 transition-opacity group-hover:from-black/35"
          />
          <span
            aria-hidden
            className="bg-accent-gold text-navy relative grid size-16 place-items-center rounded-full shadow-xl transition-transform duration-300 group-hover:scale-110 sm:size-20"
          >
            <Play className="ml-1 size-6 fill-current sm:size-7" />
          </span>
        </button>
      ) : null}
    </div>
  );
}
