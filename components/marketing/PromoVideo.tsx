/**
 * Self-hosted promotional video: the picture and nothing else.
 *
 * It plays by itself, silent and on a loop, with no play button, no control
 * bar and no sound. Browsers only allow autoplay when a video is muted, so the
 * two go together; `playsInline` keeps iOS from opening it full screen.
 * `preload="metadata"` still lets the first frame paint at once while the rest
 * streams in.
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
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black">
      <video
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        className="pointer-events-none h-full w-full object-cover"
      />
    </div>
  );
}
