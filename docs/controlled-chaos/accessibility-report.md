# Controlled Chaos — Accessibility report

**Phase:** 12  
**Package:** `@thrun-design/controlled-chaos` `0.12.0`  
**Target:** WCAG 2.2 AA for lab controls and recoverable failure UI

## Requirements covered

| Requirement | Implementation |
|-------------|----------------|
| Canvas accessible name | `aria-label="Interactive poster canvas"` on the canvas host |
| Canvas description | Hidden description span `id="cc-poster-canvas-description"` + `aria-describedby` |
| Keyboard controls | Native `<button>`, `<select>`, `<textarea>`, `<input type="file">` |
| Focus visibility | `:focus-visible` gold ring via `focusVisibleCss` on `[data-cc-lab]` |
| Labeled fields | `htmlFor` / `id` pairing for phrase, font, visual system, audio, system params |
| Export actions | Explicit “Export PNG” / “Export video” labels |
| Live status | `aria-live="polite"` on export/status dock; `role="alert"` + assertive live for phrase/SVG/audio/load errors |
| Error recovery | Error boundary + WebGL context-lost UI with **Retry renderer** (no raw exception text in UI) |
| Reduced motion | `useReducedMotion` → quality low, demand frameloop, audio reactive disabled |
| Creation pages | `noindex`; sanitized titles; meaningful thumbnail `alt` from title |
| Case study path | Static poster + copy remain usable without mounting WebGL |

## Lab chrome

- Toolbar pause uses `aria-pressed`.
- Inspector panels expose `aria-label` regions (Poster controls, Content, Timeline).
- Phrase hint overlay is `pointer-events: none` and decorative relative to the canvas description.

## Known limits (v1)

- The WebGL canvas itself is not a screen-reader-navigable scene graph; meaning comes from surrounding copy + description.
- Pointer/gesture force modes are pointer-primary; keyboard alternatives remain pause / undo / redo / randomize / system controls.
- Rapier systems may be heavier on assistive-tech machines — quality auto + reduced motion mitigate.

## Follow-ups

- Optional high-contrast text summary of the active system + seed for AT users.
- Manual VoiceOver / TalkBack pass on iOS Safari and Chrome Android after deploy.
