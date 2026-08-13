"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/animation/gsap";
import { DUR, EASE, START, STAGGER } from "@/lib/animation/config";

/**
 * Interactive dot-matrix map of the continental US, on a dark field.
 *
 * WHY DARK. Glow is light, and light only reads against dark. The previous
 * ivory version could carry the dots and the outline but had nowhere to put a
 * halo — a bright halo on a near-white card is invisible, and a dark one is a
 * smudge. Moving the card to Deep Navy is what makes the markers, the routes and
 * the depth wash all possible, and it sits inside the brand: navy is already the
 * site's dark surface (hero, footer), so this reads as one of those rather than
 * as a new theme.
 *
 * ROUTE LINES — the curves between markers are the "distribution network" the
 * caption claims. They are quadratic arcs, not straight segments: a straight
 * line between two points on a map reads as a border, a bowed one reads as a
 * route. Each carries a short bright dash that travels its length on a loop,
 * which is the only continuously moving thing in the section, so it is kept slow
 * and low-contrast.
 *
 * STRUCTURE — the map is SVG, the markers are HTML on top of it. That split is
 * deliberate. The dot field and outline want vector precision; the markers want
 * hover states, a tooltip, keyboard focus and a ripple, all of which are far
 * cheaper and more accessible as real DOM than as SVG. The two stay in register
 * because each marker is positioned by percentage of the same viewBox the SVG
 * uses, so they scale together at every width with no JS measurement.
 *
 * MARKERS ARE BUTTONS, not divs. The tooltip carries information that is not
 * anywhere else on the page, so it has to be reachable without a mouse. Hover
 * and focus-visible open it through the same CSS.
 *
 * TOOLTIP CLAMPING — placement is derived from each node's own coordinates at
 * build time rather than measured at runtime: nodes near the left or right edge
 * anchor their tooltip to that edge instead of centring it, and nodes near the
 * top flip it below the marker. Nothing can overflow the card, and there is no
 * layout read on hover. See `placement` and the .map-tip-* rules in globals.css.
 *
 * The dot field is a `<pattern>` clipped to a `<clipPath>` of the US boundary,
 * not ~1,500 individual circles: same picture, ~1KB of markup instead of ~60KB.
 */

/** US boundary, traced from real coastline/border coordinates and projected
 *  equirectangularly (cos-corrected at 37N) into the 1000x541 viewBox. */
const POINTS =
  "5.1,25.7 37.6,12.8 509.4,12.8 509.4,4.3 516.2,12.8 606.8,34.2 625.6,27.8 692.3,66.3 717.9,77 726.5,91.9 728.2,141.1 716.2,162.5 786.3,145.4 823.9,134.7 859.8,98.4 914.5,98.4 921.4,91.9 953.8,44.9 977.8,53.5 991.5,83.4 936.8,128.3 926.5,156.1 907.7,177.5 888.9,183.9 871.8,190.3 856.4,228.8 846.2,269.4 837.6,271.6 841,307.9 805.1,333.6 782.9,355 752.1,387 745.3,412.7 767.5,494 767.5,521.8 750.4,523.9 723.1,466.2 717.9,436.2 695.7,419.1 641,412.7 608.5,414.8 594.9,438.4 533.3,425.5 476.9,464 471.8,506.8 442.7,496.1 403.4,423.4 376.1,440.5 350.4,425.5 316.2,380.6 287.2,391.3 239.3,391.3 174.4,365.7 135,365.7 112.8,333.6 75.2,320.8 51.3,269.4 17.1,196.7 13.7,134.7 5.1,70.6";

const VIEW_W = 1000;
const VIEW_H = 541;

type Node = {
  /** The city itself — the tooltip's first line, and what the gold marks. */
  city: string;
  /** The region it serves, kept because the card still says "6 REGIONS". */
  region: string;
  /** States the region covers — the tooltip's third line. */
  states: string;
  x: number;
  y: number;
};

/**
 * Destination cities, projected from real lat/lon.
 *
 * HOUSTON IS INDEX 0 AND THAT IS LOAD-BEARING. Every route is drawn from
 * NODES[0] outward, so moving it out of first position silently rewires the
 * network instead of merely reordering a list.
 *
 * The coordinates are unchanged from the regional version that preceded this —
 * they were already projected to the city at the centre of each region, so
 * naming them is the only thing that moved.
 */
const HUB = 0;

const NODES: Node[] = [
  { city: "Houston", region: "South Central", states: "TX · OK · LA", x: 482.1, y: 359.7 },
  // Nudged in from the true Seattle projection (45.6, 42.6). That point is
  // inside the boundary, but only just — the marker's halo straddled the corner
  // and read as sitting off the coast.
  { city: "Seattle", region: "Pacific Northwest", states: "WA · OR · ID", x: 56, y: 58 },
  { city: "Los Angeles", region: "West Coast", states: "CA · NV · AZ", x: 115.6, y: 332.5 },
  { city: "Chicago", region: "Great Lakes", states: "IL · IN · OH · MI", x: 638.8, y: 165.1 },
  { city: "Atlanta", region: "Southeast", states: "GA · FL · SC · AL", x: 694.2, y: 338.9 },
  { city: "New York", region: "Northeast", states: "NY · NJ · MA · PA", x: 871.8, y: 190.1 },
];

/**
 * Hub and spoke: every route starts at Houston and ends at one city.
 *
 * This replaced a chain that ran coast to coast and closed a loop in the east.
 * A chain says "these places are connected to each other"; the claim here is
 * that one origin supplies all of them, and a viewer reads direction from the
 * shape long before they read an arrowhead.
 */
const LINKS: number[] = NODES.map((_, i) => i).filter((i) => i !== HUB);

/**
 * Quadratic arc between two nodes.
 *
 * The control point is the midpoint pushed along the segment's perpendicular,
 * by a fixed fraction of the distance — so every route bows by the same visual
 * amount regardless of length, and long transcontinental runs do not flatten
 * out into straight lines while short ones balloon.
 */
function arc(a: Node, b: Node, bow = 0.1, trimStart = 15, trimEnd = 17) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  // Perpendicular, consistently to one side so the arcs never cross each other.
  // The bow is shallower than the chain version used: five curves leaving one
  // point fan out on their own, and the deeper bow bent them back across each
  // other around the hub.
  const cx = mx + dy * bow;
  const cy = my - dx * bow;

  // Pull both ends back along the curve's own tangent — which at an endpoint of
  // a quadratic is the line to the control point. Without this the route starts
  // underneath Houston's marker and its arrowhead lands on top of the
  // destination's, so the two brightest things on the map sit on each other.
  const trim = (from: { x: number; y: number }, toward: { x: number; y: number }, by: number) => {
    const vx = toward.x - from.x;
    const vy = toward.y - from.y;
    const len = Math.hypot(vx, vy) || 1;
    return { x: from.x + (vx / len) * by, y: from.y + (vy / len) * by };
  };

  const start = trim(a, { x: cx, y: cy }, trimStart);
  const end = trim(b, { x: cx, y: cy }, trimEnd);

  return `M ${start.x} ${start.y} Q ${cx} ${cy} ${end.x} ${end.y}`;
}

/**
 * Tooltip placement, decided from the node's position in the viewBox.
 *
 * Horizontal: a tooltip centred on a marker within ~20% of an edge would hang
 * off the card, so those anchor to the edge instead.
 * Vertical: tooltips sit above the marker, except near the top where there is
 * no room and they flip below.
 *
 * These return plain CSS classes rather than Tailwind position/translate
 * utilities on purpose: the open/close animation is itself a transform, and a
 * Tailwind `-translate-x-1/2` sitting in the utilities layer would win over it
 * and make centred tooltips jump sideways as they fade in.
 */
function placement(node: Node) {
  const xPct = (node.x / VIEW_W) * 100;
  const below = node.y / VIEW_H < 0.22;

  const align = xPct < 20 ? "map-tip-start" : xPct > 80 ? "map-tip-end" : "map-tip-center";

  return `${align} ${below ? "map-tip-below" : "map-tip-above"}`;
}

export function CoverageMapGraphic() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root || prefersReducedMotion()) return;

      const outline = root.querySelector<SVGPolygonElement>("[data-map='outline']");

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: START, once: true },
      });

      // The border draws itself first, so the shape is established before it
      // fills in — the dots landing into an already-drawn outline reads as the
      // map being built rather than as a picture fading up.
      if (outline) {
        const len = outline.getTotalLength();
        gsap.set(outline, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
        tl.to(outline, { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut" });
      }

      tl.fromTo(
        "[data-map='dots']",
        { opacity: 0, scale: 0.97, transformOrigin: "50% 50%" },
        { opacity: 1, scale: 1, duration: DUR.cinematic, ease: EASE.out },
        outline ? "-=1.05" : 0
      ).fromTo(
        "[data-map='marker']",
        { opacity: 0, scale: 0.3 },
        {
          opacity: 1,
          scale: 1,
          duration: DUR.base,
          ease: EASE.bounce,
          stagger: STAGGER.item,
        },
        "-=0.5"
      );

      // The ripple runs on the CSS side, but it must not start until the marker
      // it belongs to has actually arrived.
      tl.set("[data-map='ripple']", { opacity: 1 }, "-=0.2");

      // Light travelling each route.
      //
      // One short dash and one very long gap, so the pattern never repeats
      // within the path and exactly one pulse is in flight at a time. Offset
      // starts at +dash (the dash sits just before the path start, off-screen)
      // and runs to -length (just past the end), so it enters and leaves rather
      // than popping into existence mid-route.
      //
      // Duration is derived from length, not fixed: a fixed duration makes the
      // short hops crawl and the coast-to-coast run sprint. Constant speed is
      // what makes six independent lines read as one network.
      const pulses = gsap.utils.toArray<SVGPathElement>("[data-map='pulse']");
      pulses.forEach((path, i) => {
        const len = path.getTotalLength();
        const dash = Math.min(len * 0.22, 90);
        gsap.set(path, { strokeDasharray: `${dash} ${len}`, strokeOpacity: 0.85 });
        tl.fromTo(
          path,
          { strokeDashoffset: dash },
          {
            strokeDashoffset: -len,
            duration: len / 190,
            ease: "none",
            repeat: -1,
            // Spread so they do not all set off together, which would read as a
            // single sweep across the whole map instead of six routes.
            repeatDelay: 1.1,
            delay: i * 0.55,
          },
          "<"
        );
      });

      // Markers are absolutely positioned by percentage, so a width change needs
      // no recalculation — but the trigger's start point does.
      ScrollTrigger.refresh();
    },
    { scope }
  );

  return (
    <div ref={scope} className="relative">
      {/* aspect-ratio matches the viewBox, so the markers' percentage offsets
          land on the same spots the SVG draws and the box is reserved before
          paint — no layout shift when the graphic resolves. */}
      <div className="relative w-full" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="absolute inset-0 h-full w-full overflow-visible"
          role="img"
          aria-label="Dot-matrix map of the continental United States. Houston is the central distribution hub, with routes running out to Seattle, Los Angeles, Chicago, Atlanta and New York."
        >
          <defs>
            {/* Light dots on a dark field, the inverse of the previous version. */}
            <pattern id="coverage-dots" width="14" height="12.9" patternUnits="userSpaceOnUse">
              <circle cx="7" cy="6.45" r="2.4" fill="#7FC7FF" />
            </pattern>

            <clipPath id="coverage-us">
              <polygon points={POINTS} />
            </clipPath>

            {/* Depth wash. The field is brighter toward the middle of the
                country and falls away at the edges, which stops the dot grid
                from reading as flat wallpaper and gives the landmass the sense
                of being lit from within. */}
            <radialGradient id="coverage-depth" cx="50%" cy="46%" r="65%">
              <stop offset="0%" stopColor="#1E8FE0" stopOpacity="0.4" />
              <stop offset="48%" stopColor="#0b97ff" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#0b97ff" stopOpacity="0.03" />
            </radialGradient>

            {/* Applied to the dots so their opacity falls off toward the edges
                rather than stopping dead at the clip boundary. */}
            <linearGradient id="coverage-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.72" />
              <stop offset="42%" stopColor="#fff" stopOpacity="1" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0.5" />
            </linearGradient>
            <mask id="coverage-mask">
              <rect width={VIEW_W} height={VIEW_H} fill="url(#coverage-fade)" />
            </mask>

            {/* Bloom. Blur a copy of the source and lay the sharp original back
                over it — the standard way to get a glow that still has a crisp
                edge, rather than a shape that is merely out of focus.
                The filter region has to be oversized or the blur is clipped at
                the element's own bounding box and the halo ends in a hard line. */}
            <filter id="coverage-bloom" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="coverage-bloom-soft" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="9" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Arrowhead at each route's destination.
                `orient="auto"` turns it to the path's tangent, so one marker
                definition serves all five spokes at whatever angle they arrive.
                It is deliberately NOT on the bloomed copy of the path: a filter
                applies to markers too, and a blurred arrowhead is a smudge. */}
            <marker
              id="coverage-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5.5"
              markerHeight="5.5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M 0 0.6 L 9.4 5 L 0 9.4 L 2.2 5 Z" fill="#E4C778" />
            </marker>
          </defs>

          <g clipPath="url(#coverage-us)">
            <rect width={VIEW_W} height={VIEW_H} fill="url(#coverage-depth)" />
            <rect
              data-map="dots"
              width={VIEW_W}
              height={VIEW_H}
              fill="url(#coverage-dots)"
              fillOpacity="0.5"
              mask="url(#coverage-mask)"
            />
          </g>

          {/* Glowing border. Starts at opacity 0 only when JS will animate it;
              the attributes here keep it visible if the timeline never runs. */}
          <polygon
            data-map="outline"
            points={POINTS}
            fill="none"
            stroke="#4FB3FF"
            strokeOpacity="0.55"
            strokeWidth="1.6"
            strokeLinejoin="round"
            filter="url(#coverage-bloom)"
          />

          {/* Routes. Two passes per link: a dim continuous line that is always
              there, and a short bright dash that travels it. The travelling dash
              is the only thing GSAP touches — the base line is static so the
              network still reads with JS off or under reduced motion. */}
          {/* Routes. Three passes per spoke, because one path cannot be both
              bloomed and carry a crisp arrowhead — an SVG filter applies to the
              marker as well, and a blurred arrowhead is just a smudge.

              1. a soft gold glow under the line
              2. the crisp line, which owns the arrowhead
              3. the travelling pulse, the only thing GSAP touches

              The base passes are static, so the network still reads with JS off
              or under reduced motion. */}
          <g fill="none" strokeLinecap="round">
            {LINKS.map((to) => (
              <path
                key={`glow-${to}`}
                d={arc(NODES[HUB], NODES[to])}
                stroke="#C9A84C"
                strokeOpacity="0.3"
                strokeWidth="2.2"
                filter="url(#coverage-bloom-soft)"
              />
            ))}
            {LINKS.map((to) => (
              <path
                key={`base-${to}`}
                d={arc(NODES[HUB], NODES[to])}
                stroke="#D9BC6B"
                strokeOpacity="0.72"
                strokeWidth="1.25"
                markerEnd="url(#coverage-arrow)"
              />
            ))}
            {LINKS.map((to) => (
              <path
                key={`pulse-${to}`}
                data-map="pulse"
                d={arc(NODES[HUB], NODES[to])}
                stroke="#F4E0A6"
                strokeWidth="2.4"
                strokeOpacity="0"
                filter="url(#coverage-bloom-soft)"
              />
            ))}
          </g>
        </svg>

        {/* Markers. Gold against the blue field — the map is the network and
            the cities are the points on it, so they are the one thing that is
            not blue. Houston runs larger because it is the origin, and size is
            the only cue that survives when someone is not hovering anything. */}
        {NODES.map((node, i) => {
          const isHub = i === HUB;
          return (
            <button
              key={node.city}
              type="button"
              data-map="marker"
              aria-label={
                isHub
                  ? `${node.city}, central distribution hub for the ${node.region} region, covering ${node.states.replace(/ · /g, ", ")}`
                  : `${node.city}, ${node.region} distribution region, covering ${node.states.replace(/ · /g, ", ")}`
              }
              style={{
                left: `${(node.x / VIEW_W) * 100}%`,
                top: `${(node.y / VIEW_H) * 100}%`,
                // Staggered so the six ripples never pulse in unison, which
                // would read as a single blinking graphic rather than six
                // independent locations.
                ["--ripple-delay" as string]: `${i * 0.45}s`,
              }}
              className="group absolute z-10 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full focus-visible:outline-none"
            >
              {/* Ripple. opacity is lifted by the entrance timeline so it cannot
                  pulse before its marker exists. */}
              <span
                aria-hidden
                data-map="ripple"
                className={`map-marker-ripple absolute rounded-full bg-[#C9A84C]/30 opacity-0 ${
                  isHub ? "size-7" : "size-5"
                }`}
              />

              {/* Soft halo — grows and brightens on hover/focus. Blurred rather
                than a flat disc, so the marker sits IN the glow instead of on a
                visible circle of colour. */}
              <span
                aria-hidden
                className={`absolute rounded-full bg-[#C9A84C]/45 blur-[7px] transition-all duration-300 ease-[var(--ease-out)] group-hover:bg-[#E4C778]/80 group-focus-visible:bg-[#E4C778]/80 ${
                  isHub
                    ? "size-11 group-hover:size-14 group-focus-visible:size-14"
                    : "size-8 group-hover:size-11 group-focus-visible:size-11"
                }`}
              />

              {/* Core dot. Pale gold rather than solid brand gold: at this size a
                fully saturated dot goes muddy against the blue, where a lifted
                core inside a gold halo reads as a light source. */}
              <span
                aria-hidden
                className={`relative rounded-full bg-[#F6E7B4] transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.35] group-focus-visible:scale-[1.35] ${
                  isHub
                    ? "size-[0.9375rem] shadow-[0_0_0_2.5px_rgb(201_168_76/0.7),0_0_20px_5px_rgb(201_168_76/0.85)]"
                    : "size-[0.6875rem] shadow-[0_0_0_2px_rgb(201_168_76/0.6),0_0_14px_3px_rgb(201_168_76/0.75)]"
                }`}
              />

              {/* Tooltip. aria-hidden because the button's aria-label already
                  carries the same text — announcing both would duplicate it. */}
              <span
                aria-hidden
                className={`map-tooltip pointer-events-none absolute z-20 w-max max-w-[11rem] rounded-lg border border-[#4FB3FF]/35 bg-[#061726]/92 px-3 py-2 text-left shadow-[0_10px_34px_-12px_rgb(0_0_0/0.75),0_0_22px_-6px_rgb(11_151_255/0.45)] backdrop-blur-md ${placement(node)}`}
              >
                <span className="text-ivory block text-[13px] leading-tight font-semibold">
                  {node.city}
                  {isHub ? (
                    <span className="ml-1.5 align-middle text-[10px] font-semibold tracking-wider text-[#E4C778] uppercase">
                      Hub
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 block text-[11px] leading-tight tracking-wide text-[#9BC4E4]">
                  {node.region}
                </span>
                <span className="mt-0.5 block text-[11px] leading-tight tracking-wide text-[#7FA5C4]">
                  {node.states}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
