"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/animation/gsap";

/**
 * Live weave viewer — the fabric, actually woven, in a canvas.
 *
 * WHY THIS EXISTS. A specification table tells a buyer "200–400 TC, percale or
 * sateen". Those are the two decisions that change how the sheet looks and
 * feels, and on every other textile site they are two numbers in a cell. Here
 * they are rendered: drag the thread count and the yarns visibly multiply and
 * thin; switch construction and the interlacing re-forms in front of you, plain
 * 1/1 becoming the long warp floats that give sateen its sheen.
 *
 * It is not decoration. It is the page explaining the one thing the page is
 * about, and it is the reason a buyer stays on it.
 *
 * THE WEAVE IS REAL, NOT A TEXTURE. Both patterns are the genuine interlacing:
 *
 *   Percale — plain weave. Every warp end passes over one weft pick and under
 *   the next, the tightest possible interlacing. That is what makes it matte
 *   and crisp: no yarn ever floats far enough to catch the light.
 *
 *   Sateen — five-end warp-faced satin. Each warp end floats over four picks
 *   before binding under one, and the binding points step across by two so they
 *   never line up into a visible twill line. Those long floats are the sheen.
 *
 * Thread count is ends plus picks per inch, so a balanced construction has
 * TC/2 of each — which is why the canvas shows half as many yarns per inch as
 * the number on the slider.
 *
 * PERFORMANCE. One canvas, drawn only when something changes, and during a
 * transition on gsap's ticker rather than a private rAF loop so it shares the
 * frame with every other animation on the page. Backed by devicePixelRatio so
 * the yarns are not soft on a retina display, and capped at 2 because a 3x
 * buffer costs four times the fill for no visible gain at this scale.
 */

type Weave = "percale" | "sateen";

/** How much cloth the canvas shows. Small enough that individual yarns are
 *  legible at 400 TC, large enough that the sateen float pattern repeats. */
const INCHES = 0.3;
/**
 * The constructions actually offered. The slider steps between INDICES of this
 * array rather than over the thread-count numbers themselves.
 *
 * The first version ran the input continuously from 200 to 400 and snapped the
 * result to the nearest entry here. That is stuck by construction: ArrowRight
 * moves 300 to 301, the snap rounds 301 straight back to 300, and the control
 * cannot be operated by keyboard at all. Measured it — sixty ArrowLeft presses
 * and the value never left 300.
 *
 * Stepping over indices also fixes the tick labels underneath, which are evenly
 * spaced by flexbox while 200/250/300/400 are not evenly spaced numerically —
 * so on a continuous track the thumb never actually sat on its own label.
 */
const TC_STOPS = [200, 250, 300, 400];

const COPY: Record<Weave, { label: string; handle: string; note: string }> = {
  percale: {
    label: "Percale",
    handle: "Crisp, matte, cool to the touch",
    note: "Plain 1/1 weave. The tightest interlacing there is — no yarn floats far enough to catch the light, which is what makes percale matte and why it sleeps cool.",
  },
  sateen: {
    label: "Sateen",
    handle: "Smooth, lustrous, warmer hand",
    note: "Five-end warp-faced satin. Each end floats over four picks before binding under one, and those long floats are what produce the sheen.",
  },
};

/** Stable per-cell pseudo-random, so the dissolve between weaves is the same
 *  every time rather than sparkling on each redraw. */
function hash(i: number, j: number) {
  const n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

/** Is the warp (vertical yarn) on top at this intersection? */
function warpOnTop(weave: Weave, i: number, j: number) {
  if (weave === "percale") return (i + j) % 2 === 0;
  // 5-end satin, step 2: warp binds under on one pick in five.
  return (i * 2 + j) % 5 !== 0;
}

export function FabricWeaveViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tc, setTc] = useState(300);
  const [weave, setWeave] = useState<Weave>("percale");

  // Animated values, kept out of React state — they change every frame during a
  // transition and re-rendering the component 60 times a second to move a
  // number the DOM never reads would be pure waste.
  const anim = useRef({ tc: 300, mix: 0 });
  const from = useRef<Weave>("percale");
  const to = useRef<Weave>("percale");

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    if (cssW === 0) return;

    if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const { tc: liveTc, mix } = anim.current;
    // Ends per inch = TC / 2 for a balanced construction.
    const perInch = liveTc / 2;
    const cols = Math.max(6, Math.round(INCHES * perInch));
    const cellW = cssW / cols;
    // Square cells: this is a balanced construction, so ends and picks are at
    // the same spacing. Deriving rows from the cell size rather than from the
    // aspect ratio keeps the yarns square at every canvas shape — the earlier
    // version computed rows separately and the weave stretched on wide screens.
    const cellH = cellW;
    const rowCount = Math.ceil(cssH / cellH) + 1;

    // Yarn slightly narrower than its cell, so the shadow gap between yarns
    // reads as the space light falls into. A flush fill looks like a grid, not
    // like cloth.
    const gap = 0.14;
    const yw = cellW * (1 - gap);
    const yh = cellH * (1 - gap);

    // Ground: the shadow that shows through between yarns.
    ctx.fillStyle = "#cfc7b8";
    ctx.fillRect(0, 0, cssW, cssH);

    // Cylindrical shading — dark edge, lit centre, dark edge. This is the whole
    // difference between "rounded rectangles" and "threads".
    //
    // The two yarn systems are lit very slightly differently. Warp and weft sit
    // perpendicular to each other, so in real cloth they never catch the light
    // the same way, and giving them identical tone is what makes a rendered
    // weave read as a flat grid.
    const yarnGradient = (x: number, y: number, w: number, h: number, vertical: boolean) => {
      const g = vertical
        ? ctx.createLinearGradient(x, 0, x + w, 0)
        : ctx.createLinearGradient(0, y, 0, y + h);
      if (vertical) {
        g.addColorStop(0, "#cfc8ba");
        g.addColorStop(0.3, "#fdfbf8");
        g.addColorStop(0.62, "#f2eee6");
        g.addColorStop(1, "#c6bfb1");
      } else {
        g.addColorStop(0, "#c4bdaf");
        g.addColorStop(0.34, "#f5f1ea");
        g.addColorStop(0.64, "#e9e4da");
        g.addColorStop(1, "#bcb5a7");
      }
      return g;
    };

    const isWarpUp = (i: number, j: number) => {
      const a = warpOnTop(from.current, i, j);
      const b = warpOnTop(to.current, i, j);
      if (a === b) return a;
      // Cells where the two patterns disagree flip one by one as the mix
      // advances — the threads look like they are re-interlacing rather than
      // one image cross-fading into another.
      return hash(i, j) < mix ? b : a;
    };

    // Pass 1: every weft (horizontal) yarn, full width.
    for (let j = 0; j < rowCount; j++) {
      const y = j * cellH + (cellH - yh) / 2;
      ctx.fillStyle = yarnGradient(0, y, cssW, yh, false);
      ctx.fillRect(0, y, cssW, yh);
    }

    // Pass 2: warp (vertical) yarns, but only where they sit on top.
    for (let i = 0; i < cols; i++) {
      const x = i * cellW + (cellW - yw) / 2;
      for (let j = 0; j < rowCount; j++) {
        if (!isWarpUp(i, j)) continue;
        // EXACTLY one cell tall, spanning the full cell pitch.
        //
        // A run of consecutive up-cells then abuts into one continuous thread
        // on its own — which is what gives sateen its long floats — while a
        // single up-cell in plain weave stays a single crossing.
        //
        // The first version drew each float two cells tall and offset half a
        // cell, meaning that in plain weave the floats at row j and row j+2
        // met end to end and every warp end became an unbroken column. The
        // canvas rendered vertical stripes rather than cloth.
        const y = j * cellH;
        ctx.fillStyle = yarnGradient(x, y, yw, cellH, true);
        ctx.fillRect(x, y, yw, cellH);
      }
    }

    // Pass 3: soft contact shadow under each float edge. Cheap depth — without
    // it the two yarn systems look like they are printed on the same plane.
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#8d8478";
    for (let i = 0; i < cols; i++) {
      const x = i * cellW + (cellW - yw) / 2;
      for (let j = 0; j < rowCount; j++) {
        if (isWarpUp(i, j)) continue;
        const y = j * cellH + (cellH - yh) / 2;
        ctx.fillRect(x - cellW * gap * 0.5, y, cellW * gap, yh);
      }
    }
    ctx.globalAlpha = 1;
  }, []);

  // Redraw on resize. The canvas is fluid, and a stale backing store shows up
  // as a blurred or stretched weave.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    draw();
    const ro = new ResizeObserver(() => draw());
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [draw]);

  // Thread count: tween the value and redraw each frame, so yarns visibly
  // multiply and thin rather than snapping to a new picture.
  useEffect(() => {
    if (prefersReducedMotion()) {
      anim.current.tc = tc;
      draw();
      return;
    }
    const tween = gsap.to(anim.current, {
      tc,
      duration: 0.85,
      ease: "power2.inOut",
      onUpdate: draw,
    });
    return () => {
      tween.kill();
    };
  }, [tc, draw]);

  // Construction: dissolve the interlacing from one pattern to the other.
  useEffect(() => {
    if (to.current === weave) return;
    from.current = to.current;
    to.current = weave;

    if (prefersReducedMotion()) {
      anim.current.mix = 1;
      draw();
      return;
    }
    anim.current.mix = 0;
    const tween = gsap.to(anim.current, {
      mix: 1,
      duration: 0.7,
      ease: "power2.inOut",
      onUpdate: draw,
    });
    return () => {
      tween.kill();
    };
  }, [weave, draw]);

  const perInch = Math.round(tc / 2);
  const copy = COPY[weave];

  return (
    <div className="border-premium/30 overflow-hidden rounded-2xl border bg-white">
      <div className="grid lg:grid-cols-5">
        {/* The cloth */}
        <div className="relative lg:col-span-3">
          <canvas
            ref={canvasRef}
            // role=img plus a label that states the CURRENT construction: the
            // canvas is information, and without this it is a blank element to
            // anyone not looking at it. The readouts below repeat the same
            // facts as text, so nothing here is available only as pixels.
            role="img"
            aria-label={`Magnified view of ${copy.label} weave at ${tc} thread count — ${perInch} ends and ${perInch} picks per inch`}
            className="block aspect-[4/3] w-full lg:aspect-auto lg:h-full lg:min-h-[26rem]"
          />
          {/* Vignette, so the cloth reads as a lit sample under a loupe rather
              than a tile that stops at the edge of the box. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_10px_rgb(120_110_95/0.28)]"
          />
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-[#0A2540]/80 px-3 py-1 text-[10.5px] font-semibold tracking-[0.14em] text-white/90 uppercase backdrop-blur-sm">
            {INCHES}″ of cloth, magnified
          </span>
        </div>

        {/* The controls */}
        <div className="flex flex-col justify-center gap-7 p-6 sm:p-8 lg:col-span-2">
          <div>
            <p className="text-premium-alt text-[10.5px] font-semibold tracking-[0.2em] uppercase">
              Construction
            </p>
            {/* A real radiogroup, so arrow keys work and the state is announced.
                Two styled <button>s would look identical and be silent. */}
            <div role="radiogroup" aria-label="Weave construction" className="mt-3 flex gap-2">
              {(Object.keys(COPY) as Weave[]).map((w) => (
                <button
                  key={w}
                  type="button"
                  role="radio"
                  aria-checked={weave === w}
                  onClick={() => setWeave(w)}
                  className={`focus-visible:ring-ring flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
                    weave === w
                      ? "border-premium bg-premium/12 text-foreground shadow-[0_0_0_1px_rgb(201_168_76/0.35)]"
                      : "border-premium/25 text-muted-foreground hover:border-premium/50 hover:text-foreground"
                  }`}
                >
                  {COPY[w].label}
                </button>
              ))}
            </div>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{copy.note}</p>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-4">
              <label
                htmlFor="tc-slider"
                className="text-premium-alt text-[10.5px] font-semibold tracking-[0.2em] uppercase"
              >
                Thread count
              </label>
              <span className="font-heading text-foreground text-2xl leading-none font-semibold tabular-nums">
                {tc}
                <span className="text-muted-foreground ml-1 text-xs font-normal">TC</span>
              </span>
            </div>

            <input
              id="tc-slider"
              type="range"
              // Index-based, so every stop of the control is a real product and
              // one arrow press moves exactly one construction. See TC_STOPS.
              min={0}
              max={TC_STOPS.length - 1}
              step={1}
              value={TC_STOPS.indexOf(tc)}
              onChange={(e) => setTc(TC_STOPS[Number(e.target.value)])}
              aria-valuetext={`${tc} thread count, ${perInch} ends and ${perInch} picks per inch`}
              className="weave-slider mt-4 w-full"
            />

            <div
              aria-hidden
              className="text-muted-foreground mt-2 flex justify-between text-[11px]"
            >
              {TC_STOPS.map((s) => (
                <span key={s} className={s === tc ? "text-foreground font-semibold" : ""}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Same facts as the canvas, in text. */}
          <dl className="border-premium/20 grid grid-cols-2 gap-x-5 gap-y-4 border-t pt-6">
            <div>
              <dt className="text-muted-foreground text-[10.5px] font-semibold tracking-[0.14em] uppercase">
                Ends × picks
              </dt>
              <dd className="text-foreground mt-1 text-sm font-medium tabular-nums">
                {perInch} × {perInch} / in
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-[10.5px] font-semibold tracking-[0.14em] uppercase">
                Handle
              </dt>
              <dd className="text-foreground mt-1 text-sm font-medium">{copy.handle}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
