/**
 * Server-safe hardening before a creation is persisted.
 * Re-sanitizes SVG, drops non-replayable local audio mode, cleans titles.
 */

import { sanitizeSvgMarkup } from "../svg/SvgSanitizer";
import {
  posterCreationV1Schema,
  type PosterCreationV1,
} from "../serialization/posterCreation.schema";
import { parseAudioConfig } from "../audio/audio.schema";

export type HardenCreationResult =
  | { ok: true; state: PosterCreationV1 }
  | { ok: false; message: string };

function scrubTitle(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const cleaned = value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return cleaned || undefined;
}

/**
 * Prepare document state for durable storage.
 * Local audio files cannot be replayed — mode falls back to off.
 */
export function hardenPosterCreationForPersist(
  input: unknown,
): HardenCreationResult {
  const parsed = posterCreationV1Schema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message || "Invalid poster state",
    };
  }

  const state = structuredClone(parsed.data);
  state.title = scrubTitle(state.title);

  if (state.asset?.type === "svg" && state.asset.normalizedSvg) {
    const sanitized = sanitizeSvgMarkup(state.asset.normalizedSvg);
    if (!sanitized.ok) {
      return { ok: false, message: sanitized.message };
    }
    state.asset = {
      ...state.asset,
      normalizedSvg: sanitized.svg,
      checksum: sanitized.checksum,
    };
  }

  const audio = parseAudioConfig(state.audio);
  if (audio.mode === "local") {
    // Local files never leave the browser — do not persist a dead local mode.
    state.audio = parseAudioConfig({ ...audio, mode: "off" });
  } else {
    state.audio = audio;
  }

  return { ok: true, state: posterCreationV1Schema.parse(state) };
}
