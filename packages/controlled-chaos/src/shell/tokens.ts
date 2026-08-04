/**
 * Dark Editorial tokens mirrored from the portfolio globals.
 * Package UI stays self-contained (inline styles) so preview embeds
 * still match without requiring host Tailwind classes.
 */

export const tokens = {
  bgDeep: "#0c0d0c",
  bg: "#171816",
  bgRaised: "#1c1e1b",
  surface: "#222522",
  contrast: "#ebe7df",
  fg: "#f4f1e9",
  fgMuted: "#c7c2b8",
  ink: "#171816",
  line: "rgba(255, 255, 255, 0.18)",
  gold: "#d4af6a",
  bronze: "#8a6a38",
  focusRing: "#d4af6a",
  fontDisplay: '"Libre Baskerville", Georgia, "Times New Roman", serif',
  fontSans: '"IBM Plex Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
  fontMono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
} as const;

/** Injected once on the lab root for keyboard `:focus-visible` rings. */
export const focusVisibleCss = `
[data-cc-lab] button:focus-visible,
[data-cc-lab] select:focus-visible,
[data-cc-lab] textarea:focus-visible,
[data-cc-lab] input:focus-visible,
[data-cc-lab] a:focus-visible {
  outline: 2px solid ${tokens.focusRing};
  outline-offset: 2px;
}
`;

export const defaultPhrase = "CHANGE ME";
export const posterAspect = 9 / 16;
