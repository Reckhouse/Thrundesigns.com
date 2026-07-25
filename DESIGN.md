---
name: Thrun Design Co.
description: Dark Editorial marketing system for a strategic design studio — near-black surfaces, gold accent, zero radius, Libre Baskerville + IBM Plex.
colors:
  bg: "#090b0d"
  bg-raised: "#111417"
  surface: "#15191c"
  contrast: "#eeeae1"
  fg: "#f3f1eb"
  fg-muted: "#b3aea4"
  ink: "#121416"
  line: "#2b3033"
  gold: "#c59a53"
  bronze: "#7a5d2f"
typography:
  display:
    fontFamily: "Libre Baskerville, Georgia, serif"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Libre Baskerville, Georgia, serif"
    fontWeight: 400
    lineHeight: 1.15
  body:
    fontFamily: "IBM Plex Sans, Helvetica Neue, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    letterSpacing: "0.14em"
rounded:
  none: "0px"
spacing:
  section-y: "96px"
  gutter: "40px"
  gutter-lg: "74px"
  container: "1440px"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px 16px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.bronze}"
    textColor: "{colors.fg}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.fg}"
    rounded: "{rounded.none}"
  nav-link:
    textColor: "{colors.fg}"
    typography: "{typography.label}"
  input-field:
    backgroundColor: "{colors.bg-raised}"
    textColor: "{colors.fg}"
    rounded: "{rounded.none}"
---

# Design System: Thrun Design Co.

## Overview

**Creative North Star: "The Dark Editorial Atelier"**

Thrun Design Co.’s public surfaces feel like a quiet studio after hours: charcoal planes, cream ink, and a single warm gold used sparingly like a brass rule on an editorial spread. The system favors restraint over spectacle — composition, typography, and honest copy do the persuasion work.

Density is editorial, not dashboard. Sections breathe with large vertical rhythm; borders are hairline charcoal; corners stay sharp (0 radius). Imagery is desaturated landscape and architectural atmosphere, never stock-smiley lifestyle collage.

**Key Characteristics:**
- Near-black charcoal field with cream type and rare gold accents
- Libre Baskerville display + IBM Plex Sans/Mono for body and labels
- Zero border-radius; hairline rules instead of cards-as-decoration
- Persuasion path always ends at the quote request

## Colors

A warm-dark editorial palette: charcoal grounds, parchment text, and a single metallic gold voice.

### Primary
- **Editorial Gold** (#c59a53): Primary actions, brand emphasis in the hero, hover accents on mono nav. Use sparingly so rarity signals importance.

### Secondary
- **Deep Bronze** (#7a5d2f): Hover/pressed companion to gold; secondary accent without competing.

### Neutral
- **Void Charcoal** (#090b0d): Page background (`bg`).
- **Raised Charcoal** (#111417): Elevated strips, sheets, popovers (`bg-raised`).
- **Surface Charcoal** (#15191c): Contained modules (`surface`).
- **Cream Ink** (#f3f1eb): Primary text (`fg`).
- **Muted Parchment** (#b3aea4): Supporting copy (`fg-muted`).
- **Contrast Cream** (#eeeae1): High-contrast panels (e.g. Why Thrun invert).
- **Near Ink** (#121416): Text on gold buttons (`ink`).
- **Hairline Graphite** (#2b3033): Borders and rules (`line`).

### Named Rules
**The One Gold Rule.** Gold appears on primary CTAs, brand lockup emphasis, and selective hover — never as a wash, gradient field, or decorative glow.

**The No-Purple Rule.** Do not introduce purple, indigo, neon, or glow accents. Stay in charcoal / cream / gold / bronze.

## Typography

**Display Font:** Libre Baskerville (with Georgia)
**Body Font:** IBM Plex Sans (with Helvetica Neue)
**Label/Mono Font:** IBM Plex Mono (with ui-monospace)

**Character:** Serif display carries editorial authority; Plex Sans keeps founder-facing body copy plain; mono uppercase labels act as quiet section instruments, not loud badges.

### Hierarchy
- **Display** (Libre, ~clamp large, tight leading): Hero brand and page-defining headlines.
- **Headline** (Libre): Section titles.
- **Title** (Libre or Plex medium): Card/service titles.
- **Body** (Plex Sans, ~16px, 1.6): Support copy; keep ~65–75ch where possible.
- **Label** (Plex Mono, ~11px, uppercase, 0.14em tracking): Nav, eyebrows, meta lines, button labels.

### Named Rules
**The Brand-First Display Rule.** On branded first viewports, the Thrun name/lockup must compete with — not surrender to — the headline.

## Layout

Max content width 1440px. Horizontal padding scales: 20px → 40px (md) → 74px (lg). Section vertical rhythm ~96px on desktop, tighter on mobile. Homepage persuasion order: Hero → Services → Work → Process → Engage → Why → Final CTA. One job per section; avoid dashboard grids and stat strips in the first viewport.

## Elevation & Depth

Flat by default. Depth comes from tonal steps (bg → bg-raised → surface) and the cream contrast panel — not from multi-layer shadows or glow. Hairline borders define modules.

### Named Rules
**The Flat-By-Default Rule.** No decorative drop shadows. If a surface needs separation, change tone or draw a 1px line.

## Shapes

**Radius is zero.** Every button, sheet, input, and media frame uses sharp corners. Form language is architectural: rectangles, rules, and occasional geometric marks (PrecisionMark) used sparingly.

### Named Rules
**The Zero-Radius Rule.** Do not introduce rounded-full pills, soft cards, or floating media tiles unless a platform control absolutely requires it.

## Components

### Buttons
- **Shape:** Sharp rectangle (0 radius).
- **Primary:** Gold fill, ink text, mono uppercase label; hover → bronze / cream text.
- **Ghost / outline:** Transparent or hairline border on charcoal; gold hover text where appropriate.

### Cards / Containers
Default: no cards. When a module needs enclosure (services, process), use surface tone + hairline border — no shadow, no radius. Prefer open editorial stacking over card grids when interaction does not require a container.

### Inputs / Fields
Charcoal raised field, hairline border, sharp corners. Focus uses gold ring. Errors sit inline near the field in plain language.

### Navigation
Mono uppercase links on charcoal. Desktop: horizontal; mobile: sheet from the right. Primary quote CTA always visible (shortens to “Quote” on small screens).

### Signature: PrecisionMark
A quiet geometric craft mark used sparingly (e.g. final CTA). Do not stamp every section.

## Do's and Don'ts

### Do:
- **Do** keep gold rare and purposeful (primary CTA + brand emphasis).
- **Do** label concept portfolio work as concepts — never as shipped client proof.
- **Do** push the persuasion path toward `/quote` with clear reply expectations.
- **Do** preserve Libre + Plex + zero radius as the identity triad.

### Don't:
- **Don't** invent testimonials, metrics, logos, or awards.
- **Don't** use purple gradients, glow, soft UI pills, or dashboard chrome on marketing surfaces.
- **Don't** fill the first viewport with stats, schedules, or secondary promos.
- **Don't** present inset hero media cards — hero imagery stays full-bleed / edge-dominant.
