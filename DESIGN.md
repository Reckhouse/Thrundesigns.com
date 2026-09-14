---
name: Thrun Design Co.
description: Charcoal & Ivory identity with the homepage's approved Editorial Split.
colors:
  bg-deep: "#0c0d0c"
  bg: "#171816"
  bg-raised: "#1c1e1b"
  surface: "#222522"
  contrast: "#ebe7df"
  fg: "#f4f1e9"
  fg-muted: "#c7c2b8"
  ink: "#171816"
  line: "rgba(255, 255, 255, 0.18)"
  gold: "#d4af6a"
  bronze: "#8a6a38"
  ivory-secondary-ink: "#514d46"
  ivory-brass-ink: "#71521f"
  ivory-numeral: "#746e64"
  ivory-line: "rgba(23, 24, 22, 0.24)"
typography:
  caption:
    fontFamily: "IBM Plex Sans, Helvetica Neue, sans-serif"
    fontSize: "0.75rem"
  action-small:
    fontFamily: "IBM Plex Sans, Helvetica Neue, sans-serif"
    fontSize: "0.8125rem"
  gallery-caption:
    fontFamily: "Libre Baskerville, Georgia, serif"
    fontSize: "1.05rem"
  artifact-title:
    fontFamily: "Libre Baskerville, Georgia, serif"
    fontSize: "1.15rem"
  work-category-title:
    fontFamily: "Libre Baskerville, Georgia, serif"
    fontSize: "26px"
  service-number:
    fontFamily: "Libre Baskerville, Georgia, serif"
    fontSize: "2.5rem"
  process-heading:
    fontFamily: "Libre Baskerville, Georgia, serif"
    fontSize: "clamp(2rem, 2.8vw, 2.75rem)"
  closing-heading:
    fontFamily: "Libre Baskerville, Georgia, serif"
    fontSize: "clamp(2.5rem, 4.7vw, 4.5rem)"
  brand-tablet:
    fontFamily: "Libre Baskerville, Georgia, serif"
    fontSize: "clamp(3rem, 7vw, 5rem)"
  brand-mobile:
    fontFamily: "Libre Baskerville, Georgia, serif"
    fontSize: "clamp(3.5rem, 13vw, 4.5rem)"
  closing-mobile:
    fontFamily: "Libre Baskerville, Georgia, serif"
    fontSize: "3rem"
  display:
    fontFamily: "Libre Baskerville, Georgia, serif"
    fontSize: "clamp(3.5rem, 6.65vw, 6rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  hero-headline:
    fontFamily: "Libre Baskerville, Georgia, serif"
    fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Libre Baskerville, Georgia, serif"
    fontSize: "clamp(2rem, 3.6vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Libre Baskerville, Georgia, serif"
    fontSize: "clamp(1.25rem, 1.7vw, 1.5rem)"
    fontWeight: 400
    lineHeight: 1.3
  body:
    fontFamily: "IBM Plex Sans, Helvetica Neue, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  body-compact:
    fontFamily: "IBM Plex Sans, Helvetica Neue, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    lineHeight: 1.4
    letterSpacing: "0.14em"
rounded:
  none: "0px"
spacing:
  homepage-section-y: "clamp(56px, 6vw, 88px)"
  homepage-gutter: "clamp(24px, 5vw, 74px)"
  service-row-y: "22px"
  gallery-gap: "28px"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 18px"
    height: "52px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.bronze}"
    textColor: "{colors.fg}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.fg}"
    rounded: "{rounded.none}"
    padding: "0 18px"
    height: "52px"
  text-link:
    textColor: "{colors.fg}"
    typography: "{typography.label}"
  input-field:
    backgroundColor: "transparent"
    rounded: "{rounded.none}"
    padding: "8px 12px"
    height: "44px"
  project-frame:
    backgroundColor: "{colors.bg-raised}"
    rounded: "{rounded.none}"
  service-row:
    textColor: "{colors.ink}"
    padding: "22px 0"
---
# Design System: Thrun Design Co.

## Overview

**Creative North Star: "The Dark Editorial Atelier"**

The approved Charcoal & Ivory direction develops the existing identity through stronger section contrast, open editorial structure, and an oversized serif brand presence. Warm brass emphasizes actions; Libre Baskerville and IBM Plex retain the original typographic voice.

This document records the implemented homepage Editorial Split alongside shared identity primitives. Homepage composition, fluid type, and responsive rules are scoped to that surface; they do not assert a redesign of other routes. Product truth remains in PRODUCT.md. Implementation authority is src/app/globals.css and the actual component styles.

**Key Characteristics:**

- Solid charcoal and ivory bands with sharp edges and restrained rules
- Libre Baskerville display with IBM Plex Sans body and IBM Plex Mono labels
- Interactive Living Engraving and actual project artwork
- Open numbered service rows and an asymmetric featured gallery

## Colors

Charcoal and warm ivory form the main contrast; brass is the single accent family.

### Primary

Editorial Brass (gold) fills quote actions and emphasizes dark-surface content. Deep Bronze (bronze) is its established hover companion. Brass Ink (ivory-brass-ink) provides readable hover emphasis on ivory; the inquiry band locally assigns this value to gold.

### Neutral

Deep Charcoal (bg-deep) grounds work and closing bands. Studio Charcoal (bg) is the homepage field and opaque header. Raised Charcoal (bg-raised) and Surface Charcoal (surface) support shared modules. Warm Ivory (contrast) grounds services, process, and inquiry. Cream Ink (fg) and Muted Parchment (fg-muted) serve dark surfaces; Dark Ink (ink), Secondary Ink (ivory-secondary-ink), and Stone Numeral (ivory-numeral) serve light surfaces. Divider colors are contextual: line on dark, ivory-line on light.

**The Surface Contrast Rule.** On ivory, use dark supporting ink and brass ink; do not carry pale dark-surface text into small light-surface text.

## Typography

**Display Font:** Libre Baskerville, with Georgia and serif fallback.  
**Body Font:** IBM Plex Sans, with Helvetica Neue and sans-serif fallback.  
**Label/Mono Font:** IBM Plex Mono, with ui-monospace and monospace fallback.

The serif provides editorial scale; sans paragraphs stay conversational, and uppercase mono distinguishes labels and actions.

Frontmatter display describes the homepage brand, limited to 8ch. Hero-headline serves the h1 with a 25ch measure. Introductory body copy has a 58ch maximum. Standard section titles use headline; service and process titles use title. Primary-action labels use medium weight and 0.12em tracking.

The process heading uses clamp(2rem, 2.8vw, 2.75rem), and the close uses clamp(2.5rem, 4.7vw, 4.5rem). Below 900px, the brand uses clamp(3rem, 7vw, 5rem); below 600px it uses clamp(3.5rem, 13vw, 4.5rem). Service numerals move from 2.5rem to 2rem on mobile; process numerals move from 3.5rem to 3rem. These are actual homepage variants, not a replacement of shared typography throughout the site.

## Layout

Homepage content centers within 1440px using the fluid gutters and section rhythm in frontmatter. The desktop hero splits at 1.08fr / 1fr with a 16px gap and a 540px horse stage. Services split at 0.8fr / 1.25fr; process at 0.8fr / 2fr; the close at 1.1fr / 1fr.

The gallery uses three desktop columns at 1.7fr / 0.75fr / 0.75fr, aligned at the top, with a 40px heading-to-gallery interval. The leading coffee project has a square frame. Secondary portrait artwork determines its own height at natural aspect ratio, without a wide background frame or minimum image height. Service rows use a 52px number column with a 24px gap. Actions wrap with a 20px / 24px gap.

Below 900px (max-width: 899px), services and process stack their introduction above content. The square gallery lead spans both equal columns, with the two smaller portrait works paired beneath it. The hero remains split at 1fr / 0.9fr with a 440px stage.

Below 600px (max-width: 599px), hero, process steps, and close become single columns. The gallery retains its two-column portrait pair below the full-width square lead; secondary captions reduce to 1.05rem. The mobile horse area is 450px tall, reserving 110px for its caption and keyboard controls. Service rows use a 38px number column and 16px gap; process dividers become horizontal.

The fixed homepage header is 96px high at all viewport widths, with a matching hero offset. Section scroll margin remains 96px on larger screens and 80px below 600px. Existing navigation switches to a menu sheet below the shared lg breakpoint (1024px), independently of the homepage layout thresholds.

## Elevation & Depth

Solid tonal bands and thin borders create homepage separation. Scene glass and plate surfaces become opaque charcoal without backdrop filtering or box shadows. Inquiry and proof containers lose enclosing panel borders and backgrounds. Other routes retain their incumbent treatments.

**The Flat Homepage Rule.** Separate homepage content with tone, space, or a rule; do not add decorative card shadows.

## Shapes

Controls and media frames have square corners. The first gallery image uses cover within a clipped square frame. The second and third retain contain sizing with relative positioning, full width, automatic height, a transparent background, and visible overflow to preserve their natural portrait compositions. The established geometric mark may retain its circle; zero radius describes containers, not every illustration.

## Components

### Actions

Primary quote links are brass rectangles with dark text and frontmatter dimensions. Hover changes to bronze and cream and may sweep a translucent highlight across the face. Secondary buttons use a brass outline. Text links pair uppercase mono with an up-right arrow. Service links use underlined sans text (0.8125rem) with a 44px minimum height on mobile.

Homepage links have a 2px currentColor focus outline offset by 6px. Shared controls outside that override retain the global 2px brass outline offset by 3px. Keyboard focus remains visible independently of hover.

### Navigation

Preserve the existing brand mark, displayed at 96px high on the homepage. Desktop links use medium uppercase mono, expanding to 14px and 0.17em tracking at lg. Mobile opens a right-hand sheet. The quote action stays visible and shortens to “Quote” below sm.

### Service and process rows

Services are open numbered articles on ivory with separators, serif titles, compact copy, and contextual links. Process steps use large stone numerals with vertical dividers on desktop and top dividers on mobile.

### Work gallery and moving work

Use actual CMS-resolved images and retain concept labels. Secondary featured artwork retains its natural aspect ratio and does not scale on hover. The lead image scales to 1.025 over 0.65s using cubic-bezier(0.16, 1, 0.3, 1). Remaining projects use the existing marquee with a 40-second requested duration. Project links remain usable without motion.

### Living Engraving and model stage

The draggable particle horse remains the live hero signature, enlarged within its stage. Reduced motion requests staticMode for the horse, stops the marquee and gallery hover transform, and keeps the 3D stage visible and stationary with keyboard rotation and removal controls. Global CSS shortens animations and transitions and disables smooth scrolling for reduced motion.

The 3D stage arranges models horizontally in a landscape canvas and vertically in a portrait canvas, fitting them to equal viewport cells. The stage is 58svh tall with a 320px minimum, increasing to 68svh at md. It displays loading status, an error alert with a reload-to-retry action, and a visible Reset models control during normal motion. Recognized public GLB files from the configured Sanity dataset use the same-origin /api/model-assets/[filename] route; other resolved URLs retain their existing path. The runtime canvas and asset delivery remain application-owned rather than simulated by the design panel.

### Shared fields

The existing input primitive is square and transparent with a thin border, 44px minimum height, and brass focus border. Disabled and invalid states remain component-owned. This records a shared primitive, not a new homepage form or quote-page redesign.

Homepage artwork controls use 44px minimum targets. Pause animations is shared across the hero, project strip, and model stage and persists for the browser session. Reduced-motion preferences keep automatic movement paused while explicit rotation/removal controls remain usable. Model render loops stop offscreen and in hidden tabs without unloading assets. Horse controls reserve space below the canvas; model controls sit above the stage, never on top of the models.

Portrait images retain intrinsic width/height and use responsive sizes matching their actual columns. Quote fields expose required status and associated errors; invalid Continue actions focus the first failing field.

## Do's and Don'ts

### Do:

- **Do** preserve Libre Baskerville, IBM Plex, the existing brand mark, and sharp container corners.
- **Do** use dark supporting ink and brass ink on ivory.
- **Do** retain complete secondary project artwork and honest concept labels.
- **Do** preserve live interactions and readable reduced-motion alternatives.
- **Do** scope the new composition and responsive rules to the homepage.

### Don't:

- **Don't** replace CMS artwork or copy with illustrative comp content.
- **Don't** reintroduce a mountain backdrop or cobalt into the approved homepage.
- **Don't** crop secondary gallery compositions to fill their frames.
- **Don't** treat this homepage handoff as evidence that other routes were redesigned.

The homepage uses the supplied mountain photograph behind the hero and model stage. A bounded scroll displacement (maximum 48px) creates depth; pause freezes it and reduced motion presents a static landscape. The existing typography and horse artwork remain. Dark overlays preserve foreground contrast.
