"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { createStore, useStore, type StoreApi } from "zustand";
import {
  createDefaultPosterCreation,
  validatePhraseInput,
  type PosterCreationV1,
  type PosterPalette,
  type VisualSystemKey,
} from "../serialization/posterCreation.schema";
import { createRandomSeed } from "../seed/createSeededRandom";
import type { FontKey } from "../typography/font-manifest";
import {
  parseParticleConfig,
  particlePresets,
  type ParticleDisintegrationConfig,
} from "../systems/particle-disintegration/particleDisintegration.schema";
import {
  parseChromeConfig,
  chromePresets,
  defaultChromeLiquidConfig,
  type ChromeLiquidConfig,
} from "../systems/chrome-liquid/chromeLiquid.schema";
import {
  parseCrtConfig,
  crtPresets,
  crtConfigToPostprocessing,
  defaultCrtPhotocopyConfig,
  type CrtPhotocopyConfig,
} from "../systems/crt-photocopy/crtPhotocopy.schema";
import { defaultParticleDisintegrationConfig } from "../systems/particle-disintegration/particleDisintegration.schema";
import { sanitizeSvgMarkup } from "../svg/SvgSanitizer";
import type { ForceMode } from "../systems/types";
import {
  ACTIVE_VISUAL_SYSTEM_KEYS,
  type ActiveVisualSystemKey,
} from "../systems/registry";

const HISTORY_LIMIT = 40;

export type PosterLabStoreState = {
  document: PosterCreationV1;
  draftPhrase: string;
  past: PosterCreationV1[];
  future: PosterCreationV1[];
  onboardingStep: number;
  userPaused: boolean | null;
  forceMode: ForceMode;
  presetKey?: string;
  svgError: string | null;

  hydrateFromPreset: (presetKey?: string) => void;
  hydrateFromDocument: (
    document: PosterCreationV1,
    options?: { presetKey?: string },
  ) => void;
  setDraftPhrase: (value: string) => void;
  commitPhrase: () => { ok: true } | { ok: false; message: string };
  setFontKey: (fontKey: FontKey) => void;
  setPalette: (palette: PosterPalette) => void;
  setLoopDuration: (seconds: 6 | 8 | 12) => void;
  randomizeSeed: () => void;
  setSeed: (seed: string) => void;
  setUserPaused: (paused: boolean | null) => void;
  setOnboardingStep: (step: number) => void;
  setForceMode: (mode: ForceMode) => void;
  setVisualSystem: (key: ActiveVisualSystemKey) => void;
  setParticleConfig: (patch: Partial<ParticleDisintegrationConfig>) => void;
  applyParticlePreset: (presetKey: string) => void;
  setChromeConfig: (patch: Partial<ChromeLiquidConfig>) => void;
  applyChromePreset: (presetKey: string) => void;
  setCrtConfig: (patch: Partial<CrtPhotocopyConfig>) => void;
  applyCrtPreset: (presetKey: string) => void;
  importSvgMarkup: (
    markup: string,
  ) => { ok: true } | { ok: false; message: string };
  clearSvgAsset: () => void;
  undo: () => void;
  redo: () => void;
};

function cloneDocument(document: PosterCreationV1): PosterCreationV1 {
  return structuredClone(document);
}

function pushHistory(
  past: PosterCreationV1[],
  current: PosterCreationV1,
): PosterCreationV1[] {
  const next = [...past, cloneDocument(current)];
  if (next.length > HISTORY_LIMIT) next.shift();
  return next;
}

function defaultConfigForSystem(key: VisualSystemKey): Record<string, unknown> {
  if (key === "chrome-liquid") {
    return defaultChromeLiquidConfig as unknown as Record<string, unknown>;
  }
  if (key === "crt-photocopy") {
    return defaultCrtPhotocopyConfig as unknown as Record<string, unknown>;
  }
  return defaultParticleDisintegrationConfig as unknown as Record<
    string,
    unknown
  >;
}

export function createPosterLabStore(options?: {
  document?: PosterCreationV1;
  presetKey?: string;
}): StoreApi<PosterLabStoreState> {
  const initial =
    options?.document ??
    createDefaultPosterCreation({ presetKey: options?.presetKey });

  return createStore<PosterLabStoreState>((set, get) => {
    const patchDocument = (
      updater: (document: PosterCreationV1) => PosterCreationV1,
    ) => {
      const state = get();
      const nextDocument = updater(cloneDocument(state.document));
      set({
        document: nextDocument,
        past: pushHistory(state.past, state.document),
        future: [],
      });
    };

    return {
      document: initial,
      draftPhrase: initial.typography.phrase,
      past: [],
      future: [],
      onboardingStep: 1,
      userPaused: null,
      forceMode: "push",
      presetKey: options?.presetKey,
      svgError: null,

      hydrateFromPreset(presetKey) {
        const document = createDefaultPosterCreation({ presetKey });
        set({
          document,
          draftPhrase: document.typography.phrase,
          past: [],
          future: [],
          onboardingStep: 1,
          presetKey,
          svgError: null,
        });
      },

      hydrateFromDocument(document, hydrateOptions) {
        set({
          document: cloneDocument(document),
          draftPhrase: document.typography.phrase,
          past: [],
          future: [],
          onboardingStep: 1,
          presetKey: hydrateOptions?.presetKey,
          svgError: null,
        });
      },

      setDraftPhrase(value) {
        set({ draftPhrase: value.slice(0, 120) });
      },

      commitPhrase() {
        const parsed = validatePhraseInput(get().draftPhrase);
        if (!parsed.ok) return parsed;
        patchDocument((document) => {
          document.typography.phrase = parsed.value;
          return document;
        });
        if (get().onboardingStep === 1) {
          set({ onboardingStep: 2 });
        }
        return { ok: true as const };
      },

      setFontKey(fontKey) {
        patchDocument((document) => {
          document.typography.fontKey = fontKey;
          return document;
        });
      },

      setPalette(palette) {
        patchDocument((document) => {
          document.palette = palette;
          return document;
        });
      },

      setLoopDuration(seconds) {
        patchDocument((document) => {
          document.document.loopDurationSeconds = seconds;
          return document;
        });
      },

      randomizeSeed() {
        patchDocument((document) => {
          document.seed = createRandomSeed();
          return document;
        });
      },

      setSeed(seed) {
        const next = seed.trim().slice(0, 64);
        if (!next) return;
        patchDocument((document) => {
          document.seed = next;
          return document;
        });
      },

      setUserPaused(paused) {
        set({ userPaused: paused });
      },

      setOnboardingStep(step) {
        set({ onboardingStep: step });
      },

      setForceMode(mode) {
        set({ forceMode: mode });
      },

      setVisualSystem(key) {
        if (
          !(ACTIVE_VISUAL_SYSTEM_KEYS as readonly string[]).includes(key)
        ) {
          return;
        }
        patchDocument((document) => {
          const previousKey = document.visualSystem.key;
          const keepConfig = previousKey === key;
          document.visualSystem = {
            key,
            version: 1,
            config: keepConfig
              ? document.visualSystem.config
              : defaultConfigForSystem(key),
          };
          if (key === "crt-photocopy") {
            document.postprocessing = crtConfigToPostprocessing(
              parseCrtConfig(document.visualSystem.config),
            );
          } else {
            document.postprocessing = {
              ...document.postprocessing,
              enabled: false,
            };
          }
          return document;
        });
        if (get().onboardingStep < 3) {
          set({ onboardingStep: 3 });
        }
      },

      setParticleConfig(patch) {
        patchDocument((document) => {
          const current = parseParticleConfig(document.visualSystem.config);
          document.visualSystem = {
            key: "particle-disintegration",
            version: 1,
            config: parseParticleConfig({ ...current, ...patch }),
          };
          document.postprocessing = {
            ...document.postprocessing,
            enabled: false,
          };
          return document;
        });
      },

      applyParticlePreset(presetKey) {
        const preset = particlePresets.find((entry) => entry.key === presetKey);
        if (!preset) return;
        patchDocument((document) => {
          document.visualSystem = {
            key: "particle-disintegration",
            version: 1,
            config: preset.config,
          };
          document.postprocessing = {
            ...document.postprocessing,
            enabled: false,
          };
          return document;
        });
        set({ presetKey });
        if (get().onboardingStep < 3) {
          set({ onboardingStep: 3 });
        }
      },

      setChromeConfig(patch) {
        patchDocument((document) => {
          const current = parseChromeConfig(document.visualSystem.config);
          document.visualSystem = {
            key: "chrome-liquid",
            version: 1,
            config: parseChromeConfig({ ...current, ...patch }),
          };
          document.postprocessing = {
            ...document.postprocessing,
            enabled: false,
          };
          return document;
        });
      },

      applyChromePreset(presetKey) {
        const preset = chromePresets.find((entry) => entry.key === presetKey);
        if (!preset) return;
        const next = createDefaultPosterCreation({
          presetKey,
          phrase: get().document.typography.phrase,
          seed: get().document.seed,
        });
        patchDocument((document) => {
          document.visualSystem = {
            key: "chrome-liquid",
            version: 1,
            config: preset.config,
          };
          document.palette = next.palette;
          document.lighting = next.lighting;
          document.typography.depth = next.typography.depth;
          document.typography.bevel = next.typography.bevel;
          document.postprocessing = {
            ...document.postprocessing,
            enabled: false,
          };
          return document;
        });
        set({ presetKey });
        if (get().onboardingStep < 3) {
          set({ onboardingStep: 3 });
        }
      },

      setCrtConfig(patch) {
        patchDocument((document) => {
          const current = parseCrtConfig(document.visualSystem.config);
          const next = parseCrtConfig({ ...current, ...patch });
          document.visualSystem = {
            key: "crt-photocopy",
            version: 1,
            config: next,
          };
          document.postprocessing = crtConfigToPostprocessing(next);
          return document;
        });
      },

      applyCrtPreset(presetKey) {
        const preset = crtPresets.find((entry) => entry.key === presetKey);
        if (!preset) return;
        const next = createDefaultPosterCreation({
          presetKey,
          phrase: get().document.typography.phrase,
          seed: get().document.seed,
        });
        patchDocument((document) => {
          document.visualSystem = {
            key: "crt-photocopy",
            version: 1,
            config: preset.config,
          };
          document.palette = next.palette;
          document.postprocessing = crtConfigToPostprocessing(preset.config);
          return document;
        });
        set({ presetKey });
        if (get().onboardingStep < 3) {
          set({ onboardingStep: 3 });
        }
      },

      importSvgMarkup(markup) {
        const result = sanitizeSvgMarkup(markup);
        if (!result.ok) {
          set({ svgError: result.message });
          return result;
        }
        patchDocument((document) => {
          document.asset = {
            type: "svg",
            normalizedSvg: result.svg,
            checksum: result.checksum,
          };
          return document;
        });
        set({ svgError: null });
        return { ok: true as const };
      },

      clearSvgAsset() {
        patchDocument((document) => {
          delete document.asset;
          return document;
        });
        set({ svgError: null });
      },

      undo() {
        const { past, document, future } = get();
        if (past.length === 0) return;
        const previous = past[past.length - 1]!;
        set({
          document: previous,
          draftPhrase: previous.typography.phrase,
          past: past.slice(0, -1),
          future: [cloneDocument(document), ...future].slice(0, HISTORY_LIMIT),
        });
      },

      redo() {
        const { past, document, future } = get();
        if (future.length === 0) return;
        const next = future[0]!;
        set({
          document: next,
          draftPhrase: next.typography.phrase,
          past: pushHistory(past, document),
          future: future.slice(1),
        });
      },
    };
  });
}

type PosterLabStoreContextValue = StoreApi<PosterLabStoreState> | null;

const PosterLabStoreContext = createContext(
  null as PosterLabStoreContextValue,
);

export function PosterLabStoreProvider({
  children,
  document,
  presetKey,
}: {
  children: ReactNode;
  document?: PosterCreationV1;
  presetKey?: string;
}) {
  const [store] = useState(() =>
    createPosterLabStore({ document, presetKey }),
  );
  return (
    <PosterLabStoreContext.Provider value={store}>
      {children}
    </PosterLabStoreContext.Provider>
  );
}

export function usePosterLabStore<T>(
  selector: (state: PosterLabStoreState) => T,
): T {
  const store = useContext(PosterLabStoreContext);
  if (!store) {
    throw new Error("usePosterLabStore must be used within PosterLabStoreProvider");
  }
  return useStore(store, selector);
}

export function usePosterLabStoreApi(): StoreApi<PosterLabStoreState> {
  const store = useContext(PosterLabStoreContext);
  if (!store) {
    throw new Error(
      "usePosterLabStoreApi must be used within PosterLabStoreProvider",
    );
  }
  return store;
}
