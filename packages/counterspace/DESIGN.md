---
name: Counterspace Field Laboratory
description: A living technical plate for manipulating signed vector fields into sustained geometry.
colors:
  field-paper: "#f9f6ef"
  graphite-ink: "#1b1a18"
  positive-red: "#d93a32"
  negative-blue: "#1146db"
  stable-green: "#3a8042"
  measured-gray: "#68655f"
  construction-gray: "#8f8a80"
  luminous-paper: "#fffaf0"
typography:
  display:
    fontFamily: "Onest Variable, Segoe UI, sans-serif"
    fontSize: "clamp(1rem, 1.35vw, 1.3rem)"
    fontWeight: 650
    lineHeight: 1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Onest Variable, Segoe UI, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 650
    lineHeight: 1.2
  body:
    fontFamily: "Onest Variable, Segoe UI, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Onest Variable, Segoe UI, sans-serif"
    fontSize: "0.66rem"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "0.13em"
  mono:
    fontFamily: "Cascadia Mono, Consolas, monospace"
    fontSize: "0.61rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  none: "0"
  full: "50%"
spacing:
  xs: "0.35rem"
  sm: "0.65rem"
  md: "0.85rem"
  lg: "1rem"
  xl: "1.25rem"
components:
  action-button:
    backgroundColor: "transparent"
    textColor: "{colors.graphite-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 0.85rem"
    height: "4rem"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.full}"
    size: "2rem"
  mobile-tab-active:
    backgroundColor: "{colors.graphite-ink}"
    textColor: "{colors.field-paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    height: "2.75rem"
  status-toast:
    backgroundColor: "{colors.graphite-ink}"
    textColor: "{colors.field-paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.6rem 0.85rem"
---

# Design System: Counterspace Field Laboratory

## Overview

**Creative North Star: "The Living Technical Plate"**

Counterspace Field Laboratory feels like a warm field-paper drawing that has become operable. Graphite construction geometry and measured editorial instruments frame the dominant chamber; signed red and blue remain continuous from controls to emitters to particles. The result is exact and tactile, never a generic dark sci-fi dashboard.

The system is compact without becoming card-dense. Panels behave like parts of one panoramic ledger, separated by hairlines and alignment rather than floating containers. Technical detail is available where it proves the field, while the chamber remains the primary visual and interactive fact.

**Key Characteristics:**

- Warm field paper with faint, static grain.
- Graphite geometry, hairlines, and tabular measurements.
- Signed red/blue polarity reinforced by plus/minus marks and directional glyphs.
- Circular emitter and measurement forms inside an otherwise square editorial frame.
- A dominant panoramic chamber bounded by narrow ledger instruments.
- Quiet, short state transitions with a single restrained equilibrium choreography.

## Colors

The palette is mostly paper and graphite; saturated color is reserved for signed polarity, with green appearing only when stability is confirmed.

### Primary

- **Graphite Ink:** Carries text, axes, primary tracks, active mobile tabs, and the strongest structural boundaries.

### Secondary

- **Positive Red:** Identifies positive polarity across emitters, bipolar controls, and particle structure.
- **Negative Blue:** Identifies negative polarity and provides the universal visible focus outline.

### Tertiary

- **Stable Green:** Appears only in confirmed stability states and the brief equilibrium ring.

### Neutral

- **Field Paper:** The continuous page, panel, and chamber ground.
- **Measured Gray:** Supports annotations, units, inactive measurements, and secondary copy.
- **Construction Gray:** Supplies the almost imperceptible inertia plane in the chamber.
- **Luminous Paper:** Keeps particle balance and emitter signs legible inside the field.

### Named Rules

**The Signed Color Rule.** Red and blue always communicate polarity and must retain a non-color sign, axis, or direction cue.

**The Earned Green Rule.** Green is not decoration or a general success accent; it appears only after sustained geometry qualifies as stable.

**The Paper Continuity Rule.** The chamber and its instruments share one warm ground. Do not introduce dark mode panels or unrelated tinted card surfaces.

## Typography

**Display Font:** Onest Variable (with Segoe UI and sans-serif fallbacks)  
**Body Font:** Onest Variable (with Segoe UI and sans-serif fallbacks)  
**Label/Mono Font:** Cascadia Mono (with Consolas and monospace fallbacks) for equations, seeds, and measured notation only

**Character:** A precise grotesk keeps the laboratory contemporary and legible. Compact uppercase labels and tabular values supply technical cadence; monospace is a measured accent, not the product's default voice.

### Hierarchy

- **Display** (650, responsive compact scale, tight tracking): Product identity in the top ledger, not oversized marketing display.
- **Title** (650, compact): Instrument headings, selected emitter names, and current form names.
- **Body** (400, compact with generous leading): Disclosure and explanatory text, held to approximately 65 characters per line where space permits.
- **Label** (650, uppercase with wide tracking): Section names, actions, scale endpoints, and persistent instrument labels.
- **Mono** (400, compact): Equations, seeds, time, energy, counts, and numeric measurements.

### Named Rules

**The Instrument Scale Rule.** Hierarchy comes from weight, case, tracking, and alignment; do not introduce oversized dashboard numerals or promotional headlines.

**The Measured Mono Rule.** Use monospace only where a value, seed, or equation benefits from fixed rhythm.

## Layout

The desktop shell is a full-viewport panoramic ledger: a 4rem top action bar, 13.5rem emitter rail, flexible chamber, 19.5rem control panel, and 5.75rem bottom stability instrument. At widths below 1180px, the side instruments narrow and secondary labels disappear before the chamber is compromised.

At 820px and below, the chamber remains the main view. The emitter rail disappears, control groups become a fixed tabbed bottom sheet above a 5.25rem stability instrument, and top actions reduce to their essential icon or preset. Below 520px, product identity and measurement columns compress again without replacing the chamber.

Spacing follows a compact editorial rhythm led by the documented 0.35rem, 0.65rem, 0.85rem, 1rem, and 1.25rem steps. Instruments use one-pixel rules and shared edges so the whole interface reads as a continuous plate rather than a grid of cards.

**The Chamber-First Rule.** Responsive reduction removes secondary labels and peripheral instruments before it reduces the chamber below a useful manipulation area.

## Elevation & Depth

The system is flat by default. Depth comes from the Three.js field's attenuation, translucent particle halos, construction planes, and nested rings rather than opaque walls or decorative shadows. Shadows appear only when a temporary surface must separate from the plate: the first-run disclosure uses a low ambient shadow, and the open mobile control sheet uses an upward ambient shadow.

### Shadow Vocabulary

- **Disclosure Float** (`0 0.75rem 2rem rgb(27 26 24 / 0.08)`): Separates the introductory disclosure from the live chamber until dismissed.
- **Mobile Sheet Lift** (`0 -1rem 2.5rem rgb(27 26 24 / 0.08)`): Distinguishes an expanded bottom sheet from the chamber beneath it.
- **Equilibrium Inset** (`inset 0 0 2.4rem rgb(58 128 66 / 0.08)`): A transient focus cue during confirmed equilibrium, never a resting panel effect.

**The Flat Instrument Rule.** Resting controls and panels use tonal continuity and hairlines; they do not float.

## Shapes

The frame is rectilinear and ledger-like: panels, notices, buttons, tabs, and toasts use square corners. Circles are reserved for field meaning and compact targets—emitter glyphs, polarity badges, operator marks, slider thumbs, the brand construction mark, and icon buttons. Hairline boundaries use graphite mixed to restrained opacity; strong one-pixel ink rules mark the outer ledger divisions.

**The Geometric Exception Rule.** A circle must denote an emitter, axis, measured point, or compact icon action. Do not round containers merely to make them friendly.

## Components

### Buttons

- **Shape:** Square editorial action cells at rest; circular only for icon-only construction actions.
- **Primary:** Transparent field-paper actions with graphite text and one-pixel dividers. Actions rely on concise uppercase labels or line icons instead of filled brand buttons.
- **Hover / Focus:** Hover adds a faint graphite wash or strengthens the boundary. Keyboard focus is a two-pixel negative-blue outline with a three-pixel offset.
- **Text actions:** Use a one-pixel structural border and centered icon-label pairing; destructive meaning stays in the label and icon rather than adding a new danger palette.

### Chips

- **Style:** Polarity badges are circular outlined signs, colored positive red or negative blue and always containing a plus or minus cue.
- **State:** Mobile control tabs are square segmented cells; the selected tab reverses to graphite ink on field paper.

### Cards / Containers

- **Corner Style:** Square, with no general-purpose radius.
- **Background:** Field paper at slight opacity where the live chamber must remain perceptible.
- **Shadow Strategy:** Flat at rest; only disclosure and expanded mobile-sheet states lift.
- **Border:** One-pixel graphite rules mixed to hairline or structural opacity.
- **Internal Padding:** Compact instrument spacing, typically 0.85rem to 1.25rem.

### Inputs / Fields

- **Style:** Native-looking controls remain legible, while range fields use a one-pixel graphite track and a small paper-filled circular thumb.
- **Focus:** All controls share the visible negative-blue focus outline.
- **Signed fields:** Bipolar ranges blend positive red through graphite into negative blue and retain explicit value labels.
- **Disabled / comfort state:** Low Sensory is an explicit checkbox with explanatory text; it suppresses equilibrium choreography immediately.

### Navigation

The top ledger combines the construction-mark wordmark, a quiet product-truth label, the preset selector, and concise action cells. On mobile, secondary action labels disappear while icons, labels for assistive technology, and core controls remain. Bottom-sheet tabs expose Emitter, Field, and Inspect as equivalent keyboard-operable groups.

### Emitter Ledger

Each emitter row combines a signed circular glyph and axis line, a compact name and measurement, and a tabular polarity output. Selection is a faint graphite wash rather than a detached card or glow.

### Stability Instrument

The bottom instrument is one continuous ruler from Chaotic through Cohering to Stable. A moving graphite marker becomes stable green only on confirmation; adjacent readouts name both the score and candidate geometry.

### Equilibrium Choreography

The shipped equilibrium moment uses a restrained 1.2-second green boundary ring, a small focus increase, and a minimal camera dolly. It does not literally change noise, field-line opacity, or trail length in this vertical slice. Reduced Motion and Low Sensory suppress the choreography while preserving the stability state and measurements.

## Do's and Don'ts

### Do:

- **Do** preserve the warm paper-and-graphite ground across chamber and instruments.
- **Do** pair polarity color with signs, axes, labels, and direction cues.
- **Do** let measurements and direct manipulation prove the field's behavior.
- **Do** keep the chamber dominant as side instruments compress or collapse.
- **Do** use square editorial containers and reserve circles for field semantics.
- **Do** suppress equilibrium motion when Reduced Motion or Low Sensory is active.

### Don't:

- **Don't** turn the laboratory into a generic dark sci-fi dashboard, neon HUD, or stack of interchangeable cards.
- **Don't** use stable green before sustained geometry has been confirmed.
- **Don't** use monospace as the default interface voice or imitate dense philosophical source-plate typography.
- **Don't** communicate polarity or stability through color alone.
- **Don't** add perpetual idle camera motion, animated grain, rapid flashes, or decorative looping effects.
- **Don't** claim the equilibrium effect changes field noise, field-line opacity, or trails unless those behaviors are actually implemented.
