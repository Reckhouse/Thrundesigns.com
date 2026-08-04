import { controlledChaosManifest } from "../manifest";
import {
  posterCreationV1Schema,
  type PosterCreationV1,
} from "./posterCreation.schema";
import { canonicalizeCreation, creationHash } from "./canonicalizeCreation";
import { hardenPosterCreationForPersist } from "../persistence/hardenCreation";

export type SerializedControlledChaosCreation = {
  stateSchemaVersion: number;
  experienceKey: typeof controlledChaosManifest.experienceKey;
  presetKey?: string;
  createdAt: string;
  state: PosterCreationV1;
  thumbnailUrl?: string;
  title?: string;
};

export function serializePosterCreation(
  document: PosterCreationV1,
  options?: {
    presetKey?: string;
    title?: string;
    thumbnailUrl?: string;
    createdAt?: string;
  },
): SerializedControlledChaosCreation {
  const hardened = hardenPosterCreationForPersist(document);
  if (!hardened.ok) {
    throw new Error(hardened.message);
  }
  const state = hardened.state;
  return {
    stateSchemaVersion: controlledChaosManifest.stateSchemaVersion,
    experienceKey: controlledChaosManifest.experienceKey,
    presetKey: options?.presetKey,
    createdAt: options?.createdAt ?? new Date().toISOString(),
    state,
    thumbnailUrl: options?.thumbnailUrl,
    title: options?.title ?? state.title,
  };
}

export function serializeCreationCanonicalJson(
  document: PosterCreationV1,
): string {
  return canonicalizeCreation(posterCreationV1Schema.parse(document));
}

export function hashPosterCreation(document: PosterCreationV1): string {
  return creationHash(posterCreationV1Schema.parse(document));
}
