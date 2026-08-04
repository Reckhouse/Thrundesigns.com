# Accessibility report — experience sections

## Requirements covered

| Requirement | Implementation |
|-------------|----------------|
| Section heading | `Eyebrow` + optional `SectionHeading` in `ThreeExperienceSection` |
| Descriptive text beside canvas | Section description + poster alt text |
| Keyboard-accessible load action | Native `<button>` for “Try the interactive version” |
| Meaningful poster alt | Required `mediaAsset.alt` in Studio; resolved for `<Image>` |
| Fallback video label | `aria-label` from filename / fallback string |
| Fullscreen launch | Normal `Link` / `ExperienceLaunchLink` |
| Error announcement | `role="alert"` / `aria-live="polite"` in boundary + lab |
| Reduced motion | `useReducedMotion` downgrades viewport/immediate → interaction |
| Navigable when renderer fails | Poster/video + case study copy + launch/retry controls |

## Creation pages

- Noindex (visitor content should not become search snippets).
- Titles sanitized before metadata (`safeMetaText`).
- Replay errors expose recoverable UI without trapping focus.

## Studio

- Static preview only — does not initialize WebGL inside document forms.
- Warnings surface missing posters, replay IDs, and capability mismatches.

## Follow-ups when real WebGL ships

- Ensure canvas has an accessible name / describedby pairing with the section copy.
- Confirm focus remains in page when the experience mounts.
- Audit any custom controls inside the package against WCAG 2.2 AA for keyboard and name/role/value.
