# Contract: Design Tokens & Component Theming

**Feature**: 001-b2b-textile-portal-crm

The brand palette, the semantic layer built on it, and the rules governing where each color may be used.

---

## Brand Palette (raw tokens)

Registered in `tailwind.config.ts` under `theme.extend.colors`.

| Token | Hex | Intended use |
|---|---|---|
| `primary` | `#0b97ff` | CTAs, links, primary buttons |
| `accent-yellow` | `#f9eb3e` | Highlight badges |
| `accent-gold` | `#C9A84C` | Premium accents, image frames |
| `navy` | `#0A2540` | Headers, dark sections, footer |
| `ivory` | `#FAF6EF` | Page background |
| `platinum` | `#E5E0D8` | Subtle backgrounds |
| `champagne` | `#F7E7CE` | Section dividers |
| `burgundy` | `#6D1A2A` | Title cards, borders |
| `maroon` | `#800020` | Accent overlays |
| `olive` | `#4A5C2F` | Lifestyle accents |
| `cognac` | `#8B4513` | Warm depth, trim |
| `forest` | `#2D4A22` | Premium depth |
| `oxblood` | `#4A0E0E` | Ultra-premium edge |

---

## Semantic Tokens

shadcn/ui theming runs on CSS variables in `globals.css`. Components consume the **semantic** layer, not raw brand names — this is what makes the usage rules below enforceable in review.

| Semantic token | Maps to | Used for |
|---|---|---|
| `--background` | `ivory` | Page background |
| `--foreground` | `navy` | Body text |
| `--card` | `#FFFFFF` | Card surfaces, product image backdrops |
| `--muted` | `platinum` | Subtle fills, disabled states |
| `--muted-foreground` | `navy` @ 70% | Secondary text |
| `--border` | `platinum` | Default borders |
| `--primary` | `primary` | Interactive fills |
| `--primary-foreground` | `#FFFFFF` | Text on primary fills |
| `--accent` | `champagne` | Hover/active tints on light surfaces |
| `--premium` | `accent-gold` | Image frames, premium rules |
| `--premium-alt` | `burgundy` | Title cards, premium borders |
| `--destructive` | `maroon` | Errors, destructive actions |
| `--ring` | `primary` | Focus rings |

---

## Usage Rules

### Marketing surfaces — `app/(marketing)/**`, `components/marketing/**`

Full palette available. Jewel tones (`maroon`, `olive`, `cognac`, `forest`, `oxblood`) are permitted **only** as supporting accents — lifestyle imagery overlays, section depth, decorative rules — never as the fill of a primary interactive element.

### Data-heavy UI — `app/(portal)/**`, `app/(crm)/**`, `components/portal/**`, `components/crm/**`

Restricted to: `ivory`, `platinum`, `navy`, `primary`, `#FFFFFF`, plus `maroon` **solely** as `--destructive` for error and delete states.

**Prohibited in tables, forms, and dashboard chrome**: `accent-gold`, `accent-yellow`, `burgundy`, `champagne`, `olive`, `cognac`, `forest`, `oxblood`. A jewel tone appearing in a data table is a review rejection.

### Status colors

Quote and order status badges use a fixed, palette-independent set so status meaning never collides with brand accents:

| Status | Treatment |
|---|---|
| `REQUESTED` / `PENDING` | Neutral — `platinum` bg, `navy` text |
| `QUOTED` / `IN_PRODUCTION` | Info — `primary` @ 10% bg, darkened primary text |
| `ACCEPTED` / `SHIPPED` | Positive — green-600 family |
| `DECLINED` / `CANCELLED` | Negative — `maroon` @ 10% bg, `maroon` text |
| `FULFILLED` / `COMPLETED` | Success — green-700 family |

---

## Accessibility Constraints

Carried forward from `research.md` §6. These are contract requirements, not suggestions.

| Combination | Ratio | Verdict |
|---|---|---|
| `navy` on `ivory` | ~13.8:1 | ✅ AAA — the default text pairing |
| `#FFFFFF` on `primary` | ~3.1:1 | ⚠️ Large text / button labels ≥ 18px only |
| `primary` on `ivory` | ~2.9:1 | ❌ **Fails AA for body text.** Inline links use a darkened variant (`#0668B3`, ~5.4:1) |
| `accent-gold` on `ivory` | ~2.1:1 | ❌ **Never for text.** Frames, rules, decoration only |
| `accent-yellow` on `ivory` | ~1.2:1 | ❌ **Never for text.** Badge fills with `navy` text only |
| `#FFFFFF` on `burgundy` | ~9.7:1 | ✅ AAA |
| `#FFFFFF` on `navy` | ~13.8:1 | ✅ AAA |

**Rules**:
1. Body text is `navy` on `ivory`/`platinum`/white, or white on `navy`/`burgundy`/`maroon`/`forest`/`oxblood`.
2. `accent-gold` and `accent-yellow` are non-text tokens. Any text on them must be `navy`.
3. Primary buttons are white text on `primary` fill at ≥ 16px semibold; inline text links use the darkened primary variant.
4. Focus rings are always visible — `--ring` at 2px offset. Never removed.
5. Status is never conveyed by color alone — badges pair color with a text label.

---

## Product Image Treatment (FR-008)

Product hero images render on a **white** background (`--card`) with a thin `accent-gold` frame:

```
bg-white · p-6 · border border-[--premium] (1px) · rounded-sm
```

This treatment is specific to product hero and gallery imagery. It is not applied to lifestyle photography, category cards, or marketing tiles.

---

## Typography & Spacing

- **Headings**: a serif or high-contrast display face for marketing surfaces (premium register); system sans for dashboards (data density).
- **Body**: 16px base minimum; line-height 1.5+.
- **Dashboard tables**: 14px permitted for dense data, never below.
- **Spacing scale**: standard Tailwind. Marketing sections use generous vertical rhythm (`py-16` → `py-24`); dashboards use compact spacing (`py-4` → `py-8`).

---

## Responsive Breakpoints (FR-026, SC-007)

Standard Tailwind breakpoints. Every one of these must be verified:

| Surface | Mobile (< 640px) | Tablet (640–1024px) | Desktop (> 1024px) |
|---|---|---|---|
| Homepage hero | Stacked, single column | Stacked, wider | Side-by-side |
| ContentShowcaseGrid | 1 column | 2 columns | 3–4 columns |
| CategoryCarousel | 1 card + swipe | 2 cards + arrows | 3–4 cards + arrows |
| VideoSection | Stacked vertically | Stacked | Two side by side |
| CoverageMap | Text above map | Text above map | Text beside map |
| Footer | Accordion columns | 2 columns | 4 columns |
| Portal / CRM tables | Card list (no h-scroll) | Horizontal scroll | Full table |
| Portal / CRM nav | Drawer | Collapsed sidebar | Full sidebar |

**Hard rule**: no horizontal page scroll at any viewport width. Wide tables scroll inside their own container.
