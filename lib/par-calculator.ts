import { z } from "zod";

/**
 * The PAR calculators: how much linen a property needs to keep in
 * circulation.
 *
 * PAR is the number of complete sets kept per bed or per room. At PAR 3 one
 * set is on the bed, one is in the laundry and one is on the shelf. Every
 * figure below is the same sum: what one bed or room uses, times how many
 * there are, times the PAR.
 *
 * THE SERVER RECOMPUTES EVERYTHING. The browser shows the steps; the action
 * in app/(marketing)/par-calculator/actions.ts runs `parReport` again on the
 * validated input, so the numbers in the email and in the CRM are never the
 * ones a browser sent.
 */

export const BED_SIZES = [
  { key: "king", label: "King" },
  { key: "queen", label: "Queen" },
  // "Full" because that is what our sheet calls it; many buyers say Double.
  { key: "full", label: "Full / Double" },
  { key: "twin", label: "Twin" },
] as const;

export type BedSize = (typeof BED_SIZES)[number]["key"];

export const SHEETING = [
  { key: "two-flat", label: "Two Flat Sheets", flat: 2, fitted: 0 },
  { key: "flat-fitted", label: "One Flat + One Fitted Sheet", flat: 1, fitted: 1 },
  { key: "triple-flat", label: "Triple Sheeting (Three Flat Sheets)", flat: 3, fitted: 0 },
  {
    key: "triple-fitted",
    label: "Triple Sheeting (One Fitted + Two Flat Sheets)",
    flat: 2,
    fitted: 1,
  },
] as const;

export type Sheeting = (typeof SHEETING)[number]["key"];

export const TOWEL_TYPES = [
  { key: "bathTowels", label: "Bath Towels" },
  { key: "bathSheets", label: "Bath Sheets" },
  { key: "handTowels", label: "Hand Towels" },
  { key: "washcloths", label: "Washcloths" },
  { key: "bathMats", label: "Bath Mats" },
] as const;

export type TowelType = (typeof TOWEL_TYPES)[number]["key"];

/**
 * Towels per room each amenity adds, before the PAR. Pool and Spa match the
 * reference calculator the client asked us to follow (two and one). Gym is
 * our own assumption of one, because the reference gave no example of it.
 */
export const AMENITIES = [
  { key: "pool", label: "Pool", towel: "Pool Towels", perRoom: 2 },
  { key: "gym", label: "Gym", towel: "Gym Towels", perRoom: 1 },
  { key: "spa", label: "Spa", towel: "Spa Towels", perRoom: 1 },
] as const;

export type Amenity = (typeof AMENITIES)[number]["key"];

export const SHEET_PAR = { min: 1, max: 5, default: 3 } as const;
export const TOWEL_PAR = { min: 1, max: 4, default: 3 } as const;

/** Upper bounds, so a stray extra zero cannot ask for a billion sheets. */
const MAX_COUNT = 100_000;
const MAX_PER_UNIT = 100;

const count = (max: number) => z.coerce.number().int().min(0).max(max);
const bySize = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({ king: schema, queen: schema, full: schema, twin: schema });

export const sheetsInputSchema = z.object({
  kind: z.literal("sheets"),
  beds: bySize(count(MAX_COUNT)),
  sheeting: z.enum(SHEETING.map((s) => s.key) as [Sheeting, ...Sheeting[]]),
  pillowcases: bySize(z.object({ standard: count(MAX_PER_UNIT), king: count(MAX_PER_UNIT) })),
  par: bySize(z.coerce.number().int().min(SHEET_PAR.min).max(SHEET_PAR.max)),
});

export const towelsInputSchema = z.object({
  kind: z.literal("towels"),
  rooms: z.coerce.number().int().min(1).max(MAX_COUNT),
  perRoom: z.object({
    bathTowels: count(MAX_PER_UNIT),
    bathSheets: count(MAX_PER_UNIT),
    handTowels: count(MAX_PER_UNIT),
    washcloths: count(MAX_PER_UNIT),
    bathMats: count(MAX_PER_UNIT),
  }),
  amenities: z.object({ pool: z.boolean(), gym: z.boolean(), spa: z.boolean() }),
  par: z.coerce.number().int().min(TOWEL_PAR.min).max(TOWEL_PAR.max),
});

export const parInputSchema = z.discriminatedUnion("kind", [sheetsInputSchema, towelsInputSchema]);

export type SheetsInput = z.infer<typeof sheetsInputSchema>;
export type TowelsInput = z.infer<typeof towelsInputSchema>;
export type ParInput = z.infer<typeof parInputSchema>;

export type ReportRow = { label: string; value: string };

export type ParReport = {
  title: string;
  /** What the buyer entered, as they will want to check it. */
  selections: ReportRow[];
  /** What they need to hold. */
  needs: ReportRow[];
  totals: { label: string; value: number }[];
};

export function defaultSheetsInput(): SheetsInput {
  const zero = { king: 0, queen: 0, full: 0, twin: 0 };
  const noCases = { standard: 0, king: 0 };
  const par = SHEET_PAR.default;
  return {
    kind: "sheets",
    beds: { ...zero },
    sheeting: "two-flat",
    pillowcases: {
      king: { ...noCases },
      queen: { ...noCases },
      full: { ...noCases },
      twin: { ...noCases },
    },
    par: { king: par, queen: par, full: par, twin: par },
  };
}

export function defaultTowelsInput(): TowelsInput {
  return {
    kind: "towels",
    rooms: 1,
    perRoom: { bathTowels: 0, bathSheets: 0, handTowels: 0, washcloths: 0, bathMats: 0 },
    amenities: { pool: false, gym: false, spa: false },
    par: TOWEL_PAR.default,
  };
}

const fmt = (n: number) => n.toLocaleString("en-US");

export function parReport(input: ParInput): ParReport {
  return input.kind === "sheets" ? sheetsReport(input) : towelsReport(input);
}

function sheetsReport(input: SheetsInput): ParReport {
  const sheeting = SHEETING.find((s) => s.key === input.sheeting) ?? SHEETING[0];
  const sizes = BED_SIZES.filter((size) => input.beds[size.key] > 0);

  const selections: ReportRow[] = [
    ...BED_SIZES.map((size) => ({ label: `${size.label} Beds`, value: fmt(input.beds[size.key]) })),
    { label: "Sheet Type", value: sheeting.label },
    ...sizes.map((size) => {
      const cases = input.pillowcases[size.key];
      return {
        label: `${size.label} Pillowcases per Bed`,
        value: `${cases.standard} Standard, ${cases.king} King`,
      };
    }),
    ...sizes.map((size) => ({
      label: `${size.label} PAR Level`,
      value: String(input.par[size.key]),
    })),
  ];

  const needs: ReportRow[] = [];
  let sheets = 0;
  let pillowcases = 0;
  for (const size of sizes) {
    const sets = input.beds[size.key] * input.par[size.key];
    const flat = sets * sheeting.flat;
    const fitted = sets * sheeting.fitted;
    const standard = sets * input.pillowcases[size.key].standard;
    const king = sets * input.pillowcases[size.key].king;
    sheets += flat + fitted;
    pillowcases += standard + king;

    needs.push({ label: `${size.label} Flat Sheets`, value: fmt(flat) });
    if (fitted) needs.push({ label: `${size.label} Fitted Sheets`, value: fmt(fitted) });
    if (standard) needs.push({ label: `${size.label} Standard Pillowcases`, value: fmt(standard) });
    if (king) needs.push({ label: `${size.label} King Pillowcases`, value: fmt(king) });
  }

  return {
    title: "Hotel Linen PAR",
    selections,
    needs,
    totals: [
      { label: "Total Sheets Needed", value: sheets },
      { label: "Total Pillowcases Needed", value: pillowcases },
    ],
  };
}

function towelsReport(input: TowelsInput): ParReport {
  const multiplier = input.rooms * input.par;
  const chosen = AMENITIES.filter((amenity) => input.amenities[amenity.key]);

  const selections: ReportRow[] = [
    { label: "Number of Rooms", value: fmt(input.rooms) },
    { label: "PAR Level", value: String(input.par) },
    ...TOWEL_TYPES.map((type) => ({
      label: `${type.label} per Room`,
      value: fmt(input.perRoom[type.key]),
    })),
    { label: "Amenities", value: chosen.length ? chosen.map((a) => a.label).join(", ") : "None" },
  ];

  const needs: ReportRow[] = [
    ...TOWEL_TYPES.map((type) => ({
      label: type.label,
      value: fmt(input.perRoom[type.key] * multiplier),
    })),
    ...chosen.map((amenity) => ({
      label: amenity.towel,
      value: fmt(amenity.perRoom * multiplier),
    })),
  ];

  const total =
    TOWEL_TYPES.reduce((sum, type) => sum + input.perRoom[type.key], 0) * multiplier +
    chosen.reduce((sum, amenity) => sum + amenity.perRoom, 0) * multiplier;

  return {
    title: "Towel PAR",
    selections,
    needs,
    totals: [{ label: "Grand Total Towels Needed", value: total }],
  };
}

/** The report as plain text: the email's text part and the CRM lead's message. */
export function parReportText(report: ParReport): string {
  const rows = (list: ReportRow[]) => list.map((row) => `${row.label}: ${row.value}`).join("\n");
  return [
    `${report.title} calculation`,
    "",
    "YOUR SELECTIONS",
    rows(report.selections),
    "",
    "YOUR LINEN NEEDS",
    rows(report.needs),
    "",
    ...report.totals.map((t) => `${t.label}: ${fmt(t.value)}`),
  ].join("\n");
}
