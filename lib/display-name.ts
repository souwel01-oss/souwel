/**
 * A product's name without its blend. Several names carry the blend after a
 * comma ("Flat Sheet — T200 Solid, 55% Cotton / 45% Polyester"); the pages and
 * cards show the blend on its own line, so the name is shown without it.
 */
export function plainName(name: string, blend: string | null | undefined): string {
  if (!blend) return name;
  return name.replace(`, ${blend}`, "").replace(` (${blend})`, "");
}
