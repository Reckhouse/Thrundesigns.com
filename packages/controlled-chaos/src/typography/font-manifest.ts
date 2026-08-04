/**
 * Server-safe curated font registry.
 * Typeface JSON files live under public/experiences/controlled-chaos/fonts/.
 */

export type FontManifestEntry = {
  key: string;
  displayName: string;
  family: string;
  style: string;
  weight: number;
  typefaceFile: string;
  license: string;
  category: "display" | "grotesk" | "serif" | "mono" | "experimental";
  supportsExtrusion: boolean;
  supportsParticles: boolean;
};

export const FONT_MANIFEST = [
  {
    key: "helvetiker-regular",
    displayName: "Helvetiker Regular",
    family: "Helvetiker",
    style: "normal",
    weight: 400,
    typefaceFile: "helvetiker_regular.typeface.json",
    license: "Three.js examples typeface (facetype.js conversion)",
    category: "grotesk",
    supportsExtrusion: true,
    supportsParticles: true,
  },
  {
    key: "helvetiker-bold",
    displayName: "Helvetiker Bold",
    family: "Helvetiker",
    style: "normal",
    weight: 700,
    typefaceFile: "helvetiker_bold.typeface.json",
    license: "Three.js examples typeface (facetype.js conversion)",
    category: "grotesk",
    supportsExtrusion: true,
    supportsParticles: true,
  },
  {
    key: "optimer-regular",
    displayName: "Optimer Regular",
    family: "Optimer",
    style: "normal",
    weight: 400,
    typefaceFile: "optimer_regular.typeface.json",
    license: "Three.js examples typeface (facetype.js conversion)",
    category: "serif",
    supportsExtrusion: true,
    supportsParticles: true,
  },
  {
    key: "optimer-bold",
    displayName: "Optimer Bold",
    family: "Optimer",
    style: "normal",
    weight: 700,
    typefaceFile: "optimer_bold.typeface.json",
    license: "Three.js examples typeface (facetype.js conversion)",
    category: "serif",
    supportsExtrusion: true,
    supportsParticles: true,
  },
  {
    key: "gentilis-regular",
    displayName: "Gentilis Regular",
    family: "Gentilis",
    style: "normal",
    weight: 400,
    typefaceFile: "gentilis_regular.typeface.json",
    license: "Three.js examples typeface (facetype.js conversion)",
    category: "serif",
    supportsExtrusion: true,
    supportsParticles: true,
  },
] as const satisfies readonly FontManifestEntry[];

export type FontKey = (typeof FONT_MANIFEST)[number]["key"];

export const DEFAULT_FONT_KEY: FontKey = "helvetiker-bold";

export const FONT_KEYS = FONT_MANIFEST.map((entry) => entry.key) as [
  FontKey,
  ...FontKey[],
];

export function getFontEntry(key: string): FontManifestEntry | undefined {
  return FONT_MANIFEST.find((entry) => entry.key === key);
}

export function resolveTypefaceUrl(
  key: string,
  assetBasePath = "/experiences/controlled-chaos",
): string | null {
  const entry = getFontEntry(key);
  if (!entry) return null;
  const base = assetBasePath.replace(/\/$/, "");
  return `${base}/fonts/${entry.typefaceFile}`;
}
