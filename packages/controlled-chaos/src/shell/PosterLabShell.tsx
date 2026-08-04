"use client";

import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FormEvent,
} from "react";
import type { ControlledChaosEmbedConfig } from "../schemas";
import type {
  ControlledChaosAnalyticsAdapter,
  ControlledChaosPersistenceAdapter,
} from "../adapters.types";
import { controlledChaosManifest } from "../manifest";
import type { PosterCreationV1 } from "../serialization/posterCreation.schema";
import { PosterCanvas } from "../scene/PosterCanvas";
import {
  PosterLabStoreProvider,
  usePosterLabStore,
} from "../state/usePosterLabStore";
import { FONT_MANIFEST, type FontKey } from "../typography/font-manifest";
import { PosterErrorBoundary } from "./PosterErrorBoundary";
import {
  PosterFallback,
  detectWebGLSupport,
} from "./PosterFallback";
import { PosterToolbar } from "./PosterToolbar";
import {
  PosterViewport,
  dockStyle,
  inspectorPanelStyle,
} from "./PosterViewport";
import { tokens } from "./tokens";

/**
 * Prefer same-origin asset paths so local/dev hosts do not fetch typefaces
 * from the production SITE_URL baked into lab search-param config.
 */
export function resolveAssetBasePath(configured?: string): string {
  const fallback = "/experiences/controlled-chaos";
  if (!configured) return fallback;
  try {
    const url = new URL(configured, "https://thrundesign.local");
    const path = url.pathname.replace(/\/$/, "");
    return path || fallback;
  } catch {
    return configured.startsWith("/")
      ? configured.replace(/\/$/, "")
      : fallback;
  }
}

export type PosterLabShellProps = {
  configuration?: ControlledChaosEmbedConfig;
  persistence?: ControlledChaosPersistenceAdapter;
  analytics?: ControlledChaosAnalyticsAdapter;
  creationId?: string;
  creationTitle?: string;
  initialDocument?: PosterCreationV1;
  variant?: "lab" | "preview" | "replay";
};

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function subscribeNarrow(onChange: () => void) {
  const mq = window.matchMedia("(max-width: 900px)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getNarrowSnapshot() {
  return window.matchMedia("(max-width: 900px)").matches;
}

function getNarrowServerSnapshot() {
  return false;
}

const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: "0.35rem",
  fontFamily: tokens.fontMono,
  fontSize: "0.6875rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: tokens.gold,
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${tokens.line}`,
  background: tokens.bgDeep,
  color: tokens.fg,
  fontFamily: tokens.fontSans,
  fontSize: "0.9375rem",
  padding: "0.65rem 0.75rem",
};

const muted: CSSProperties = {
  margin: 0,
  fontFamily: tokens.fontSans,
  fontSize: "0.8125rem",
  lineHeight: 1.55,
  color: tokens.fgMuted,
};

const PALETTE_PRESETS = [
  {
    key: "editorial-gold",
    label: "Editorial Gold",
    palette: {
      background: "#0c0d0c",
      primary: "#ebe7df",
      secondary: "#8a6a38",
      accent: "#d4af6a",
    },
  },
  {
    key: "grid-moss",
    label: "Grid Moss",
    palette: {
      background: "#121410",
      primary: "#f4f1e9",
      secondary: "#5c6b52",
      accent: "#d4af6a",
    },
  },
  {
    key: "cold-steel",
    label: "Cold Steel",
    palette: {
      background: "#0a0c10",
      primary: "#d7dde8",
      secondary: "#6a7385",
      accent: "#9bb0c9",
    },
  },
] as const;

function PosterLabShellInner({
  configuration,
  persistence: _persistence,
  analytics,
  creationId,
  creationTitle,
  variant = "lab",
}: Omit<PosterLabShellProps, "initialDocument">) {
  const height = configuration?.height ?? controlledChaosManifest.defaultHeight;
  const controls = configuration?.controls ?? "minimal";
  const showFullControls =
    variant === "lab" && (controls === "full" || controls === "minimal");
  const showInspector = variant === "lab" && controls === "full";
  const allowTextEditing =
    configuration?.allowTextEditing !== false && showInspector;

  const narrow = useSyncExternalStore(
    subscribeNarrow,
    getNarrowSnapshot,
    getNarrowServerSnapshot,
  );
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const [webglOk] = useState(() =>
    typeof document === "undefined" ? true : detectWebGLSupport(),
  );
  const [phraseError, setPhraseError] = useState<string | null>(null);

  const documentState = usePosterLabStore((state) => state.document);
  const draftPhrase = usePosterLabStore((state) => state.draftPhrase);
  const onboardingStep = usePosterLabStore((state) => state.onboardingStep);
  const userPaused = usePosterLabStore((state) => state.userPaused);
  const pastLength = usePosterLabStore((state) => state.past.length);
  const futureLength = usePosterLabStore((state) => state.future.length);
  const setDraftPhrase = usePosterLabStore((state) => state.setDraftPhrase);
  const commitPhrase = usePosterLabStore((state) => state.commitPhrase);
  const setFontKey = usePosterLabStore((state) => state.setFontKey);
  const setPalette = usePosterLabStore((state) => state.setPalette);
  const randomizeSeed = usePosterLabStore((state) => state.randomizeSeed);
  const setUserPaused = usePosterLabStore((state) => state.setUserPaused);
  const undo = usePosterLabStore((state) => state.undo);
  const redo = usePosterLabStore((state) => state.redo);

  const paused = userPaused ?? reducedMotion;
  const assetBasePath = resolveAssetBasePath(configuration?.assetBaseUrl);

  useEffect(() => {
    analytics?.track(variant === "replay" ? "replay_loaded" : "initialized");
  }, [analytics, variant]);

  const modeLabel = useMemo(() => {
    const mode = configuration?.mode ?? variant;
    const preset = configuration?.initialPresetKey;
    const parts = [
      String(mode),
      preset ? `preset ${preset}` : null,
      creationId ? `id ${creationId}` : null,
      `seed ${documentState.seed}`,
    ].filter(Boolean);
    return parts.join(" · ");
  }, [
    configuration?.mode,
    configuration?.initialPresetKey,
    creationId,
    variant,
    documentState.seed,
  ]);

  const title =
    creationTitle?.trim() ||
    documentState.title ||
    configuration?.initialPresetKey?.replace(/-/g, " ") ||
    controlledChaosManifest.title;

  const description = `Vertical poster composition reading “${documentState.typography.phrase}” with font ${documentState.typography.fontKey}.`;

  if (!webglOk) {
    return (
      <PosterFallback
        reason="webgl"
        title="WebGL unavailable"
        message="This browser cannot run the Poster Lab renderer. Try a current version of Chrome, Edge, Firefox, or Safari."
      />
    );
  }

  const phraseHint =
    onboardingStep === 1 && showFullControls
      ? "Change the phrase to begin."
      : undefined;

  const inspector = showInspector ? (
    <aside
      style={{
        ...inspectorPanelStyle,
        ...(narrow
          ? {
              maxWidth: "none",
              borderLeft: "none",
              borderTop: `1px solid ${tokens.line}`,
            }
          : {}),
      }}
      aria-label="Poster controls"
    >
      {allowTextEditing ? (
        <form
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
            const result = commitPhrase();
            if (!result.ok) {
              setPhraseError(result.message);
              return;
            }
            setPhraseError(null);
          }}
        >
          <label style={labelStyle} htmlFor="cc-phrase">
            Phrase
          </label>
          <textarea
            id="cc-phrase"
            name="phrase"
            value={draftPhrase}
            maxLength={120}
            rows={3}
            onChange={(event) => setDraftPhrase(event.target.value)}
            style={{ ...inputStyle, resize: "vertical", minHeight: 84 }}
            autoComplete="off"
          />
          {phraseError ? (
            <p style={{ ...muted, color: "#e2b4a2", marginTop: "0.4rem" }}>
              {phraseError}
            </p>
          ) : null}
          <button
            type="submit"
            style={{
              ...inputStyle,
              marginTop: "0.65rem",
              width: "auto",
              background: tokens.gold,
              color: tokens.ink,
              border: "none",
              fontFamily: tokens.fontMono,
              fontSize: "0.6875rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: "pointer",
              padding: "0.7rem 1rem",
            }}
          >
            Update phrase
          </button>
        </form>
      ) : null}

      <div style={{ marginTop: allowTextEditing ? "1.25rem" : 0 }}>
        <label style={labelStyle} htmlFor="cc-font">
          Font
        </label>
        <select
          id="cc-font"
          value={documentState.typography.fontKey}
          onChange={(event) => setFontKey(event.target.value as FontKey)}
          style={inputStyle}
        >
          {FONT_MANIFEST.map((font) => (
            <option key={font.key} value={font.key}>
              {font.displayName}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: "1.25rem" }}>
        <p style={labelStyle}>Palette</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
          {PALETTE_PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => setPalette(preset.palette)}
              style={{
                ...inputStyle,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span>{preset.label}</span>
              <span style={{ display: "flex", gap: 4 }}>
                {[
                  preset.palette.background,
                  preset.palette.primary,
                  preset.palette.accent,
                ].map((color) => (
                  <span
                    key={color}
                    style={{
                      width: 12,
                      height: 12,
                      background: color,
                      border: `1px solid ${tokens.line}`,
                    }}
                  />
                ))}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "1.25rem" }}>
        <p style={labelStyle}>Seed</p>
        <p style={muted}>{documentState.seed}</p>
        <button
          type="button"
          onClick={() => randomizeSeed()}
          style={{
            ...inputStyle,
            marginTop: "0.5rem",
            width: "auto",
            cursor: "pointer",
            fontFamily: tokens.fontMono,
            fontSize: "0.6875rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          New seed
        </button>
      </div>

      <div style={{ marginTop: "1.25rem" }}>
        <p style={labelStyle}>Visual system</p>
        <p style={muted}>
          {documentState.visualSystem.key} (systems land in Phase 3+)
        </p>
      </div>

      <div style={{ marginTop: "1.25rem" }}>
        <p style={labelStyle}>Quality</p>
        <p style={muted}>
          Active: {configuration?.quality ?? "auto"}
          {reducedMotion ? " · reduced motion" : ""}
        </p>
      </div>
    </aside>
  ) : null;

  const canvas = (
    <PosterErrorBoundary
      onError={() => analytics?.track("failed", { reason: "render_boundary" })}
    >
      <PosterCanvas
        document={documentState}
        reducedMotion={reducedMotion}
        paused={paused}
        quality={configuration?.quality ?? "auto"}
        assetBasePath={assetBasePath}
      />
    </PosterErrorBoundary>
  );

  return (
    <div
      data-experience={controlledChaosManifest.experienceKey}
      data-mode={configuration?.mode ?? variant}
      data-variant={variant}
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        minHeight: Math.max(height, variant === "lab" ? 520 : 320),
        background: tokens.bgDeep,
        color: tokens.fg,
        fontFamily: tokens.fontSans,
      }}
    >
      <PosterToolbar
        title={title}
        modeLabel={modeLabel}
        showFullControls={showFullControls}
        paused={paused}
        canUndo={pastLength > 0}
        canRedo={futureLength > 0}
        onTogglePause={() => setUserPaused(!paused)}
        onUndo={undo}
        onRedo={redo}
        onRandomize={randomizeSeed}
      />

      <div
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          flexDirection: narrow ? "column" : "row",
        }}
      >
        {!narrow && showInspector ? (
          <aside
            style={{
              width: 260,
              flexShrink: 0,
              borderRight: `1px solid ${tokens.line}`,
              background: tokens.bg,
              padding: "1rem",
              boxSizing: "border-box",
            }}
            aria-label="Content"
          >
            <p style={labelStyle}>Typography</p>
            <p style={muted}>
              Curated typefaces via typeface.json. Extruded geometry rebuilds
              after a short debounce while you edit.
            </p>
            <p style={{ ...labelStyle, marginTop: "1.25rem" }}>Loop</p>
            <p style={muted}>
              {documentState.document.loopDurationSeconds}s · seed-stable accents
            </p>
          </aside>
        ) : null}

        <PosterViewport phraseHint={phraseHint} description={description}>
          {canvas}
        </PosterViewport>

        {!narrow ? inspector : null}
      </div>

      {narrow && showInspector ? inspector : null}

      {showFullControls ? (
        <div style={dockStyle} aria-label="Timeline">
          <p style={{ ...labelStyle, marginBottom: 0 }}>
            Loop · {documentState.document.loopDurationSeconds}s
          </p>
          <p style={muted}>
            Timeline, gesture recording, and export arrive later. Persistence
            adapter
            {_persistence ? " is connected." : " is not connected in this embed."}
          </p>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Phase 2 shell: Zustand document state, curated fonts, palette/seed controls,
 * undo/redo, and extruded typography on the vertical canvas.
 */
export function PosterLabShell({
  initialDocument,
  configuration,
  ...rest
}: PosterLabShellProps) {
  return (
    <PosterLabStoreProvider
      document={initialDocument}
      presetKey={configuration?.initialPresetKey}
    >
      <PosterLabShellInner configuration={configuration} {...rest} />
    </PosterLabStoreProvider>
  );
}
