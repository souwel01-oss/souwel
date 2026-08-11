"use client";

import { useId, useMemo, useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/animation/gsap";
import { EASE } from "@/lib/animation/config";
import type { TrendPoint } from "@/lib/db/crm";

/**
 * Leads and orders per week.
 *
 * A LINE CHART BECAUSE THE JOB IS CHANGE OVER TIME, and two series because the
 * question staff actually ask is whether orders are keeping pace with enquiries
 * — which is a comparison, not two separate facts.
 *
 * ONE AXIS. Both series are counts of the same kind of thing, so they share a
 * scale honestly. Had they been counts against revenue, this would be two
 * charts rather than a second y-axis: two scales on one plot invent a
 * correlation the data does not contain, and where they cross is an artefact
 * of where the scales were pinned.
 *
 * The colours come from --chart-1 and --chart-2, which are validated per
 * theme — see the note in globals.css. Deliberately NOT the raw brand blue and
 * gold: those measure 2.95:1 and 2.21:1 on an ivory card, below the 3:1 a mark
 * needs to be seen.
 *
 * IDENTITY IS NEVER COLOUR-ALONE. There is a legend, both lines are labelled at
 * their right-hand end, and the whole series is available as a real table under
 * the chart — which is also what a screen reader gets, since an SVG polyline
 * conveys nothing to one.
 */

const PAD = { top: 16, right: 52, bottom: 26, left: 34 };
const VIEW = { w: 720, h: 240 };

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const root = useRef<HTMLDivElement>(null);
  const clipId = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);

  const geometry = useMemo(() => {
    const max = Math.max(4, ...data.map((d) => Math.max(d.leads, d.orders)));
    // Round the ceiling up to something a person would choose, so the
    // gridlines land on whole numbers rather than 3.75.
    const step = max <= 8 ? 2 : max <= 20 ? 5 : max <= 50 ? 10 : 25;
    const ceiling = Math.ceil(max / step) * step;

    const plotW = VIEW.w - PAD.left - PAD.right;
    const plotH = VIEW.h - PAD.top - PAD.bottom;

    const x = (i: number) =>
      PAD.left + (data.length <= 1 ? plotW / 2 : (i / (data.length - 1)) * plotW);
    const y = (v: number) => PAD.top + plotH - (v / ceiling) * plotH;

    const line = (key: "leads" | "orders") =>
      data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join(" ");

    // At most five gridlines, and fewer when the ceiling is small — five lines
    // across a range of 0–4 gives fractional labels on integer counts.
    const tickCount = Math.min(5, ceiling / step + 1);
    const ticks: number[] = Array.from({ length: tickCount }, (_, i) =>
      Math.round((ceiling / (tickCount - 1)) * i)
    );

    return { x, y, ceiling, plotW, plotH, ticks, leads: line("leads"), orders: line("orders") };
  }, [data]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // Draw-on. `pathLength` normalises every path to 1 so one dash pair works
      // for both lines regardless of their real length.
      gsap.fromTo(
        "[data-series]",
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 1.1, ease: EASE.out, stagger: 0.12 }
      );
      gsap.from("[data-end-dot], [data-end-label]", {
        opacity: 0,
        duration: 0.4,
        delay: 0.75,
        ease: EASE.soft,
      });
    },
    { scope: root, dependencies: [data] }
  );

  const active = hover !== null ? data[hover] : null;
  const empty = data.every((d) => d.leads === 0 && d.orders === 0);

  return (
    <div ref={root}>
      {/* Legend. Present because there are two series; the swatch carries the
          identity so the text can stay in ink rather than wearing series colour. */}
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <LegendKey color="var(--chart-1)" label="Leads" />
        <LegendKey color="var(--chart-2)" label="Orders" />
        <span className="text-muted-foreground ml-auto text-[11.5px]">Last 12 weeks, per week</span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
          className="h-[240px] w-full touch-none"
          role="img"
          aria-label={`Leads and orders per week over the last ${data.length} weeks. The same figures are listed in the table below.`}
          onPointerMove={(e) => {
            const box = e.currentTarget.getBoundingClientRect();
            const px = ((e.clientX - box.left) / box.width) * VIEW.w;
            const ratio = (px - PAD.left) / geometry.plotW;
            const i = Math.round(ratio * (data.length - 1));
            setHover(i >= 0 && i < data.length ? i : null);
          }}
          onPointerLeave={() => setHover(null)}
        >
          <defs>
            <clipPath id={clipId}>
              <rect x={PAD.left} y={0} width={geometry.plotW} height={VIEW.h} />
            </clipPath>
          </defs>

          {/* Gridlines: hairline, solid, recessive. Never dashed — a dashed grid
              competes with the data for attention. */}
          {geometry.ticks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={VIEW.w - PAD.right}
                y1={geometry.y(t)}
                y2={geometry.y(t)}
                stroke="var(--border)"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={geometry.y(t) + 4}
                textAnchor="end"
                className="fill-[var(--muted-foreground)] text-[11px] tabular-nums"
              >
                {t}
              </text>
            </g>
          ))}

          {/* x labels — every third bucket, or twelve dates collide. */}
          {data.map((d, i) =>
            i % 3 === 0 || i === data.length - 1 ? (
              <text
                key={d.label + i}
                x={geometry.x(i)}
                y={VIEW.h - 6}
                textAnchor={i === data.length - 1 ? "end" : "middle"}
                className="fill-[var(--muted-foreground)] text-[11px]"
              >
                {d.label}
              </text>
            ) : null
          )}

          {hover !== null ? (
            <line
              x1={geometry.x(hover)}
              x2={geometry.x(hover)}
              y1={PAD.top}
              y2={VIEW.h - PAD.bottom}
              stroke="var(--foreground)"
              strokeOpacity={0.25}
              strokeWidth={1}
            />
          ) : null}

          <g clipPath={`url(#${clipId})`}>
            {(["orders", "leads"] as const).map((key) => (
              <path
                key={key}
                data-series
                d={key === "leads" ? geometry.leads : geometry.orders}
                fill="none"
                stroke={key === "leads" ? "var(--chart-1)" : "var(--chart-2)"}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray={1}
              />
            ))}
          </g>

          {/* Hovered points, and the end markers that anchor the direct labels.
              Both carry a 2px ring in the surface colour so they stay readable
              where the two lines cross. */}
          {(["leads", "orders"] as const).map((key) => {
            const i = hover ?? data.length - 1;
            const point = data[i];
            if (!point) return null;
            return (
              <circle
                key={key}
                data-end-dot={hover === null ? "" : undefined}
                cx={geometry.x(i)}
                cy={geometry.y(point[key])}
                r={4.5}
                fill={key === "leads" ? "var(--chart-1)" : "var(--chart-2)"}
                stroke="var(--card)"
                strokeWidth={2}
              />
            );
          })}

          {/* Direct labels at the right edge — the second identity channel, and
              the "relief" the contrast check asks for. */}
          {(["leads", "orders"] as const).map((key) => {
            const last = data[data.length - 1];
            if (!last) return null;
            return (
              <text
                key={key}
                data-end-label
                x={VIEW.w - PAD.right + 10}
                y={geometry.y(last[key]) + 4}
                className="fill-[var(--foreground)] text-[11px] font-semibold tabular-nums"
              >
                {last[key]}
              </text>
            );
          })}
        </svg>

        {/* Tooltip. Positioned in percentage terms so it tracks the SVG's own
            responsive scaling rather than a fixed pixel grid. */}
        {active ? (
          <div
            className="bg-popover text-popover-foreground border-border pointer-events-none absolute top-2 z-10 -translate-x-1/2 rounded-lg border px-3 py-2 text-[12px] shadow-lg"
            style={{
              left: `${(geometry.x(hover!) / VIEW.w) * 100}%`,
            }}
          >
            <p className="text-muted-foreground mb-1 font-semibold">Week of {active.label}</p>
            <p className="flex items-center gap-2 tabular-nums">
              <span
                aria-hidden
                className="size-2 rounded-full"
                style={{ background: "var(--chart-1)" }}
              />
              Leads <strong className="ml-auto">{active.leads}</strong>
            </p>
            <p className="flex items-center gap-2 tabular-nums">
              <span
                aria-hidden
                className="size-2 rounded-full"
                style={{ background: "var(--chart-2)" }}
              />
              Orders <strong className="ml-auto">{active.orders}</strong>
            </p>
          </div>
        ) : null}
      </div>

      {empty ? (
        <p className="text-muted-foreground mt-3 text-center text-[12.5px]">
          No quote requests or orders in this period yet.
        </p>
      ) : null}

      {/* The table view. Not a fallback — it is the accessible reading of the
          same data, and the reason the sub-3:1 colour warning is answered
          rather than ignored. */}
      <details className="group mt-4">
        <summary className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex cursor-pointer list-none items-center gap-1.5 rounded-md text-[12px] font-semibold focus-visible:ring-2 focus-visible:outline-none">
          <span className="transition-transform group-open:rotate-90">›</span>
          View as table
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-left text-[12.5px]">
            <caption className="sr-only">Leads and orders per week</caption>
            <thead>
              <tr className="border-border/60 text-muted-foreground border-b">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Week of
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Leads
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Orders
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={d.label + i} className="border-border/40 border-b last:border-0">
                  <th scope="row" className="text-foreground py-1.5 pr-4 font-normal">
                    {d.label}
                  </th>
                  <td className="text-foreground py-1.5 pr-4 tabular-nums">{d.leads}</td>
                  <td className="text-foreground py-1.5 tabular-nums">{d.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

function LegendKey({ color, label }: { color: string; label: string }) {
  return (
    <span className="text-foreground/80 flex items-center gap-2 text-[12.5px] font-medium">
      {/* A short line-key rather than a square: it matches the mark the reader
          is looking for on the plot. */}
      <span aria-hidden className="h-[2px] w-5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
