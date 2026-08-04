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
} from "../serialization/posterCreation.schema";
import { createRandomSeed } from "../seed/createSeededRandom";
import type { FontKey } from "../typography/font-manifest";

const HISTORY_LIMIT = 40;

export type PosterLabStoreState = {
  document: PosterCreationV1;
  draftPhrase: string;
  past: PosterCreationV1[];
  future: PosterCreationV1[];
  onboardingStep: number;
  userPaused: boolean | null;
  presetKey?: string;

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
      presetKey: options?.presetKey,

      hydrateFromPreset(presetKey) {
        const document = createDefaultPosterCreation({ presetKey });
        set({
          document,
          draftPhrase: document.typography.phrase,
          past: [],
          future: [],
          onboardingStep: 1,
          presetKey,
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
