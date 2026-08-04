import { particleDisintegrationDefinition } from "./particle-disintegration/definition";
import { chromeLiquidDefinition } from "./chrome-liquid/definition";
import { crtPhotocopyDefinition } from "./crt-photocopy/definition";
import { inflatableTypeDefinition } from "./inflatable-type/definition";
import { elasticTypeDefinition } from "./elastic-type/definition";
import { tornPaperDefinition } from "./torn-paper/definition";
import { typeArchitectureDefinition } from "./type-architecture/definition";
import type { VisualSystemDefinition } from "./types";
import type { VisualSystemKey } from "../serialization/posterCreation.schema";

export const visualSystemRegistry = {
  "particle-disintegration": particleDisintegrationDefinition,
  "chrome-liquid": chromeLiquidDefinition,
  "crt-photocopy": crtPhotocopyDefinition,
  "inflatable-type": inflatableTypeDefinition,
  "elastic-type": elasticTypeDefinition,
  "torn-paper": tornPaperDefinition,
  "type-architecture": typeArchitectureDefinition,
} as const satisfies Partial<
  Record<VisualSystemKey, VisualSystemDefinition<unknown>>
>;

export const ACTIVE_VISUAL_SYSTEM_KEYS = [
  "particle-disintegration",
  "chrome-liquid",
  "crt-photocopy",
  "inflatable-type",
  "elastic-type",
  "torn-paper",
  "type-architecture",
] as const satisfies ReadonlyArray<VisualSystemKey>;

export type ActiveVisualSystemKey = (typeof ACTIVE_VISUAL_SYSTEM_KEYS)[number];

export function getVisualSystemDefinition(
  key: string,
): VisualSystemDefinition<unknown> | null {
  if (key in visualSystemRegistry) {
    return visualSystemRegistry[key as keyof typeof visualSystemRegistry];
  }
  return null;
}

export function listRegisteredVisualSystems(): VisualSystemDefinition<unknown>[] {
  return ACTIVE_VISUAL_SYSTEM_KEYS.map(
    (key) => visualSystemRegistry[key],
  ) as VisualSystemDefinition<unknown>[];
}
