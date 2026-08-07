import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The floating dev badge sits bottom-left and overlaps page content while
  // scrolling, which makes it look like sections are clipped during review.
  // Dev-only UI — never present in production builds.
  devIndicators: false,

  images: {
    // AVIF first, WebP second, original last. Next content-negotiates, so a
    // browser that cannot decode AVIF simply gets WebP as before — this only
    // adds a smaller option for browsers that can. The product photography is
    // the bulk of the homepage's image weight, and AVIF is typically 20-30%
    // under WebP on this kind of soft-gradient fabric imagery.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // YouTube poster frames for the LiteYouTube facade.
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      // Product imagery (Cloudinary) — Phase 3+.
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
