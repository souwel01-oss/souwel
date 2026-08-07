import { HeroVideoBackground } from "@/components/marketing/HeroVideoBackground";
import { Atmosphere } from "@/components/marketing/Atmosphere";
import { HeroContent } from "@/components/marketing/HeroContent";

/**
 * Hero (FR-007a): dark background, heading, intro text, "Get Started" CTA.
 *
 * The company video plays as a muted, looping backdrop behind the copy. All
 * text sits above a navy scrim (see HeroVideoBackground) so contrast holds
 * regardless of the frame showing — the footage is pale fabric, so unscrimmed
 * white text would fail AA outright.
 *
 * CTA remains white on brand blue at >=16px semibold, the only pairing that
 * clears the contrast floor for that fill (contracts/design-tokens.md).
 *
 * This shell stays a server component; the animated copy lives in HeroContent.
 */

const HERO_VIDEO_ID = "rOzAV40WgMA";

export function Hero() {
  return (
    <section className="bg-navy text-ivory relative isolate overflow-hidden">
      <HeroVideoBackground videoId={HERO_VIDEO_ID} label="Souwel textile manufacturing footage" />

      {/* Ambient glow sits above the video scrim but below the copy, so it adds
          depth without ever coming between the reader and the text. */}
      <Atmosphere variant="hero" />

      {/* Top padding is deliberately much smaller than the bottom: the eyebrow
          label that used to occupy this space is gone, and the section already
          sits below a sticky header. Symmetric padding left the heading
          stranded in the middle of the frame. */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-10 pb-20 sm:px-6 sm:pt-12 sm:pb-24 lg:px-8 lg:pt-14 lg:pb-28">
        <HeroContent />
      </div>
    </section>
  );
}
