import {
  createDefaultPosterCreation,
  posterCreationV1Schema,
  type PosterCreationV1,
} from "./posterCreation.schema";

/**
 * Load + migrate creation document state in memory.
 * Never mutates stored records — callers may save a new copy.
 */
export function migratePosterCreation(value: unknown): PosterCreationV1 {
  if (
    value &&
    typeof value === "object" &&
    "schemaVersion" in value &&
    (value as { schemaVersion?: unknown }).schemaVersion === 1
  ) {
    return posterCreationV1Schema.parse(value);
  }

  // Legacy / empty payloads: wrap into a fresh V1 document when possible.
  if (value && typeof value === "object") {
    const legacy = value as Record<string, unknown>;
    const phrase =
      typeof legacy.phrase === "string"
        ? legacy.phrase
        : typeof legacy.title === "string"
          ? legacy.title
          : undefined;
    const seed = typeof legacy.seed === "string" ? legacy.seed : undefined;
    return createDefaultPosterCreation({ phrase, seed });
  }

  return createDefaultPosterCreation();
}

export function deserializePosterCreation(value: unknown): PosterCreationV1 {
  return migratePosterCreation(value);
}
