/** Ensure portfolio labels stay honest when CMS omits “Concept”. */
export function withConceptLabel(industry?: string | null): string {
  if (!industry?.trim()) return "Concept";
  return industry.includes("Concept") ? industry : `${industry} · Concept`;
}
