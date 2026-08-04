import { particleDisintegrationDefinition } from "./particle-disintegration/definition";
import type { VisualSystemDefinition } from "./types";
import type { VisualSystemKey } from "../serialization/posterCreation.schema";

export const visualSystemRegistry = {
  "particle-disintegration": particleDisintegrationDefinition,
} as const satisfies Partial<
  Record<VisualSystemKey, VisualSystemDefinition<unknown>>
>;

export function getVisualSystemDefinition(
  key: string,
): VisualSystemDefinition<unknown> | null {
  if (key in visualSystemRegistry) {
    return visualSystemRegistry[key as keyof typeof visualSystemRegistry];
  }
  return null;
}
