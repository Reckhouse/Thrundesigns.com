"use client";

import {
  useEffect,
  useMemo,
  useRef,
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
import {
  parseParticleConfig,
  particlePresets,
} from "../systems/particle-disintegration/particleDisintegration.schema";
import {
  parseChromeConfig,
  chromePresets,
} from "../systems/chrome-liquid/chromeLiquid.schema";
import {
  parseCrtConfig,
  crtPresets,
} from "../systems/crt-photocopy/crtPhotocopy.schema";
import {
  parseInflatableConfig,
  inflatablePresets,
} from "../systems/inflatable-type/inflatableType.schema";
import {
  parseElasticConfig,
  elasticPresets,
} from "../systems/elastic-type/elasticType.schema";
import {
  parseTornPaperConfig,
  tornPaperPresets,
} from "../systems/torn-paper/tornPaper.schema";
import {
  parseTypeArchitectureConfig,
  typeArchitecturePresets,
} from "../systems/type-architecture/typeArchitecture.schema";
import {
  listRegisteredVisualSystems,
  type ActiveVisualSystemKey,
} from "../systems/registry";
import type { ForceMode } from "../systems/types";
import { isSvgFileName } from "../svg/SvgSanitizer";
import {
  AudioReactiveProvider,
  useAudioReactive,
} from "../audio/AudioReactiveContext";
import {
  CURATED_AUDIO_TRACKS,
  AUDIO_ROUTING_PRESETS,
  type AudioTrackKey,
} from "../audio/audio.schema";
import { captureStill, captureThumbnail, blobToDataUrl, recordPosterLoop, resolveVideoFpsLadder } from "../export/exportPoster";
import { serializePosterCreation } from "../serialization/serializeCreation";
import { deserializePosterCreation } from "../serialization/deserializeCreation";
import { controlledChaosCreationSchema } from "../schemas";
import { PosterErrorBoundary } from "./PosterErrorBoundary";
import {
  PosterFallback,
  detectWebGLSupport,
} from "./PosterFallback";
import { PosterToolbar } from "./PosterToolbar";
import {
  PosterViewport,
  POSTER_CANVAS_DESC_ID,
  dockStyle,
  inspectorPanelStyle,
} from "./PosterViewport";
import { focusVisibleCss, tokens } from "./tokens";

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
  persistence,
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
  const forceMode = usePosterLabStore((state) => state.forceMode);
  const setForceMode = usePosterLabStore((state) => state.setForceMode);
  const setParticleConfig = usePosterLabStore((state) => state.setParticleConfig);
  const applyParticlePreset = usePosterLabStore(
    (state) => state.applyParticlePreset,
  );
  const setVisualSystem = usePosterLabStore((state) => state.setVisualSystem);
  const setChromeConfig = usePosterLabStore((state) => state.setChromeConfig);
  const applyChromePreset = usePosterLabStore((state) => state.applyChromePreset);
  const setCrtConfig = usePosterLabStore((state) => state.setCrtConfig);
  const applyCrtPreset = usePosterLabStore((state) => state.applyCrtPreset);
  const setInflatableConfig = usePosterLabStore(
    (state) => state.setInflatableConfig,
  );
  const applyInflatablePreset = usePosterLabStore(
    (state) => state.applyInflatablePreset,
  );
  const setElasticConfig = usePosterLabStore((state) => state.setElasticConfig);
  const applyElasticPreset = usePosterLabStore(
    (state) => state.applyElasticPreset,
  );
  const setTornPaperConfig = usePosterLabStore(
    (state) => state.setTornPaperConfig,
  );
  const applyTornPaperPreset = usePosterLabStore(
    (state) => state.applyTornPaperPreset,
  );
  const setTypeArchitectureConfig = usePosterLabStore(
    (state) => state.setTypeArchitectureConfig,
  );
  const applyTypeArchitecturePreset = usePosterLabStore(
    (state) => state.applyTypeArchitecturePreset,
  );
  const setAudioConfig = usePosterLabStore((state) => state.setAudioConfig);
  const importSvgMarkup = usePosterLabStore((state) => state.importSvgMarkup);
  const clearSvgAsset = usePosterLabStore((state) => state.clearSvgAsset);
  const svgError = usePosterLabStore((state) => state.svgError);

  const hydrateFromDocument = usePosterLabStore(
    (state) => state.hydrateFromDocument,
  );
  const presetKey = usePosterLabStore((state) => state.presetKey);

  const allowAudio = configuration?.allowAudio !== false && showInspector;
  const allowExport =
    configuration?.allowExport !== false && showFullControls;
  const allowSave = Boolean(persistence) && showFullControls;

  const audio = useAudioReactive();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const hydratedCreationRef = useRef<string | null>(null);

  const systemKey = documentState.visualSystem.key;
  const particleConfig = useMemo(
    () => parseParticleConfig(documentState.visualSystem.config),
    [documentState.visualSystem.config],
  );
  const chromeConfig = useMemo(
    () => parseChromeConfig(documentState.visualSystem.config),
    [documentState.visualSystem.config],
  );
  const crtConfig = useMemo(
    () => parseCrtConfig(documentState.visualSystem.config),
    [documentState.visualSystem.config],
  );
  const inflatableConfig = useMemo(
    () => parseInflatableConfig(documentState.visualSystem.config),
    [documentState.visualSystem.config],
  );
  const elasticConfig = useMemo(
    () => parseElasticConfig(documentState.visualSystem.config),
    [documentState.visualSystem.config],
  );
  const tornPaperConfig = useMemo(
    () => parseTornPaperConfig(documentState.visualSystem.config),
    [documentState.visualSystem.config],
  );
  const typeArchitectureConfig = useMemo(
    () => parseTypeArchitectureConfig(documentState.visualSystem.config),
    [documentState.visualSystem.config],
  );
  const registeredSystems = useMemo(() => listRegisteredVisualSystems(), []);
  const activeSystemTitle =
    registeredSystems.find((system) => system.key === systemKey)?.title ??
    systemKey;

  const paused = userPaused ?? reducedMotion;
  const assetBasePath = resolveAssetBasePath(configuration?.assetBaseUrl);

  useEffect(() => {
    analytics?.track(variant === "replay" ? "replay_loaded" : "initialized");
  }, [analytics, variant]);

  useEffect(() => {
    const id = configuration?.initialCreationId;
    if (!id || !persistence || variant === "replay") return;
    if (hydratedCreationRef.current === id) return;
    hydratedCreationRef.current = id;
    let cancelled = false;
    void persistence
      .load(id)
      .then((record) => {
        if (cancelled) return;
        const parsed = controlledChaosCreationSchema.safeParse(record.payload);
        if (!parsed.success) {
          setLoadError("Saved creation could not be validated.");
          return;
        }
        hydrateFromDocument(deserializePosterCreation(parsed.data.state), {
          presetKey: parsed.data.presetKey,
        });
        setShareUrl(`/creation/${record.id}`);
        setLoadError(null);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError("Could not load the saved creation.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [
    configuration?.initialCreationId,
    hydrateFromDocument,
    persistence,
    variant,
  ]);

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
      : onboardingStep === 2 && showFullControls
        ? "Choose how the type behaves."
        : onboardingStep >= 3 && showFullControls
          ? "Drag across the poster."
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
      <p style={labelStyle}>How to explore</p>
      <p style={{ ...muted, marginBottom: "1.25rem" }}>
        Edit the phrase, pick a visual system, drag to apply force, then export
        PNG/video or save a share link.
      </p>
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
            <p
              role="alert"
              aria-live="assertive"
              style={{ ...muted, color: "#e2b4a2", marginTop: "0.4rem" }}
            >
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
        <label style={labelStyle} htmlFor="cc-visual-system">
          Visual system
        </label>
        <select
          id="cc-visual-system"
          value={systemKey}
          onChange={(event) =>
            setVisualSystem(event.target.value as ActiveVisualSystemKey)
          }
          style={inputStyle}
        >
          {registeredSystems.map((system) => (
            <option key={system.key} value={system.key}>
              {system.title}
            </option>
          ))}
        </select>
        <p style={{ ...muted, marginTop: "0.45rem" }}>{activeSystemTitle}</p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
            marginTop: "0.55rem",
          }}
        >
          {(systemKey === "chrome-liquid"
            ? chromePresets
            : systemKey === "crt-photocopy"
              ? crtPresets
              : systemKey === "inflatable-type"
                ? inflatablePresets
                : systemKey === "elastic-type"
                  ? elasticPresets
                  : systemKey === "torn-paper"
                    ? tornPaperPresets
                    : systemKey === "type-architecture"
                      ? typeArchitecturePresets
                      : particlePresets
          ).map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => {
                if (systemKey === "chrome-liquid") {
                  applyChromePreset(preset.key);
                } else if (systemKey === "crt-photocopy") {
                  applyCrtPreset(preset.key);
                } else if (systemKey === "inflatable-type") {
                  applyInflatablePreset(preset.key);
                } else if (systemKey === "elastic-type") {
                  applyElasticPreset(preset.key);
                } else if (systemKey === "torn-paper") {
                  applyTornPaperPreset(preset.key);
                } else if (systemKey === "type-architecture") {
                  applyTypeArchitecturePreset(preset.key);
                } else {
                  applyParticlePreset(preset.key);
                }
              }}
              style={{
                ...inputStyle,
                cursor: "pointer",
                textAlign: "left",
                fontFamily: tokens.fontMono,
                fontSize: "0.6875rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {systemKey === "particle-disintegration" ? (
      <div style={{ marginTop: "1.25rem" }}>
        <label style={labelStyle} htmlFor="cc-disintegration">
          Disintegration · {particleConfig.disintegration.toFixed(2)}
        </label>
        <input
          id="cc-disintegration"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={particleConfig.disintegration}
          onChange={(event) =>
            setParticleConfig({
              disintegration: Number(event.target.value),
            })
          }
          style={{ width: "100%" }}
        />
        <label style={{ ...labelStyle, marginTop: "0.75rem" }} htmlFor="cc-motion">
          Motion · {particleConfig.motion.toFixed(2)}
        </label>
        <input
          id="cc-motion"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={particleConfig.motion}
          onChange={(event) =>
            setParticleConfig({ motion: Number(event.target.value) })
          }
          style={{ width: "100%" }}
        />
        <label style={{ ...labelStyle, marginTop: "0.75rem" }} htmlFor="cc-density">
          Density · {particleConfig.density.toFixed(2)}
        </label>
        <input
          id="cc-density"
          type="range"
          min={0.15}
          max={1}
          step={0.01}
          value={particleConfig.density}
          onChange={(event) =>
            setParticleConfig({ density: Number(event.target.value) })
          }
          style={{ width: "100%" }}
        />
      </div>
      ) : null}

      {systemKey === "chrome-liquid" ? (
        <div style={{ marginTop: "1.25rem" }}>
          <label style={labelStyle} htmlFor="cc-liquid">
            Liquid · {chromeConfig.liquidAmplitude.toFixed(2)}
          </label>
          <input
            id="cc-liquid"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={chromeConfig.liquidAmplitude}
            onChange={(event) =>
              setChromeConfig({ liquidAmplitude: Number(event.target.value) })
            }
            style={{ width: "100%" }}
          />
          <label
            style={{ ...labelStyle, marginTop: "0.75rem" }}
            htmlFor="cc-fresnel"
          >
            Fresnel · {chromeConfig.fresnel.toFixed(2)}
          </label>
          <input
            id="cc-fresnel"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={chromeConfig.fresnel}
            onChange={(event) =>
              setChromeConfig({ fresnel: Number(event.target.value) })
            }
            style={{ width: "100%" }}
          />
          <label
            style={{ ...labelStyle, marginTop: "0.75rem" }}
            htmlFor="cc-roughness"
          >
            Roughness · {chromeConfig.roughness.toFixed(2)}
          </label>
          <input
            id="cc-roughness"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={chromeConfig.roughness}
            onChange={(event) =>
              setChromeConfig({ roughness: Number(event.target.value) })
            }
            style={{ width: "100%" }}
          />
          <label
            style={{ ...labelStyle, marginTop: "0.75rem" }}
            htmlFor="cc-chrome-light"
          >
            Lighting
          </label>
          <select
            id="cc-chrome-light"
            value={chromeConfig.lightingPreset}
            onChange={(event) =>
              setChromeConfig({
                lightingPreset: event.target
                  .value as typeof chromeConfig.lightingPreset,
              })
            }
            style={inputStyle}
          >
            {(
              [
                "studio-warm",
                "cold-chrome",
                "gallery-spot",
                "rim-heavy",
              ] as const
            ).map((preset) => (
              <option key={preset} value={preset}>
                {preset}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {systemKey === "crt-photocopy" ? (
        <div style={{ marginTop: "1.25rem" }}>
          <label style={labelStyle} htmlFor="cc-scanlines">
            Scanlines · {crtConfig.scanlines.toFixed(2)}
          </label>
          <input
            id="cc-scanlines"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={crtConfig.scanlines}
            onChange={(event) =>
              setCrtConfig({ scanlines: Number(event.target.value) })
            }
            style={{ width: "100%" }}
          />
          <label
            style={{ ...labelStyle, marginTop: "0.75rem" }}
            htmlFor="cc-grain"
          >
            Grain · {crtConfig.grain.toFixed(2)}
          </label>
          <input
            id="cc-grain"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={crtConfig.grain}
            onChange={(event) =>
              setCrtConfig({ grain: Number(event.target.value) })
            }
            style={{ width: "100%" }}
          />
          <label
            style={{ ...labelStyle, marginTop: "0.75rem" }}
            htmlFor="cc-threshold"
          >
            Threshold · {crtConfig.threshold.toFixed(2)}
          </label>
          <input
            id="cc-threshold"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={crtConfig.threshold}
            onChange={(event) =>
              setCrtConfig({ threshold: Number(event.target.value) })
            }
            style={{ width: "100%" }}
          />
          <label
            style={{ ...labelStyle, marginTop: "0.75rem" }}
            htmlFor="cc-chroma"
          >
            Chromatic · {crtConfig.chromaticOffset.toFixed(2)}
          </label>
          <input
            id="cc-chroma"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={crtConfig.chromaticOffset}
            onChange={(event) =>
              setCrtConfig({ chromaticOffset: Number(event.target.value) })
            }
            style={{ width: "100%" }}
          />
        </div>
      ) : null}

      {systemKey === "inflatable-type" ? (
        <div style={{ marginTop: "1.25rem" }}>
          <label style={labelStyle} htmlFor="cc-inflate">
            Inflate · {inflatableConfig.inflatePressure.toFixed(2)}
          </label>
          <input
            id="cc-inflate"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={inflatableConfig.inflatePressure}
            onChange={(event) =>
              setInflatableConfig({
                inflatePressure: Number(event.target.value),
              })
            }
            style={{ width: "100%" }}
          />
          <label
            style={{ ...labelStyle, marginTop: "0.75rem" }}
            htmlFor="cc-bounce"
          >
            Bounce · {inflatableConfig.bounce.toFixed(2)}
          </label>
          <input
            id="cc-bounce"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={inflatableConfig.bounce}
            onChange={(event) =>
              setInflatableConfig({ bounce: Number(event.target.value) })
            }
            style={{ width: "100%" }}
          />
          <label
            style={{ ...labelStyle, marginTop: "0.75rem" }}
            htmlFor="cc-puff"
          >
            Puff · {inflatableConfig.puffScale.toFixed(2)}
          </label>
          <input
            id="cc-puff"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={inflatableConfig.puffScale}
            onChange={(event) =>
              setInflatableConfig({ puffScale: Number(event.target.value) })
            }
            style={{ width: "100%" }}
          />
          <label
            style={{ ...labelStyle, marginTop: "0.75rem" }}
            htmlFor="cc-pulse"
          >
            Pulse · {inflatableConfig.pulseSpeed.toFixed(2)}
          </label>
          <input
            id="cc-pulse"
            type="range"
            min={0.1}
            max={3}
            step={0.05}
            value={inflatableConfig.pulseSpeed}
            onChange={(event) =>
              setInflatableConfig({ pulseSpeed: Number(event.target.value) })
            }
            style={{ width: "100%" }}
          />
        </div>
      ) : null}

      {systemKey === "elastic-type" ? (
        <div style={{ marginTop: "1.25rem" }}>
          <label style={labelStyle} htmlFor="cc-stiffness">
            Stiffness · {elasticConfig.stiffness.toFixed(2)}
          </label>
          <input
            id="cc-stiffness"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={elasticConfig.stiffness}
            onChange={(event) =>
              setElasticConfig({ stiffness: Number(event.target.value) })
            }
            style={{ width: "100%" }}
          />
          <label
            style={{ ...labelStyle, marginTop: "0.75rem" }}
            htmlFor="cc-stretch"
          >
            Stretch · {elasticConfig.stretch.toFixed(2)}
          </label>
          <input
            id="cc-stretch"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={elasticConfig.stretch}
            onChange={(event) =>
              setElasticConfig({ stretch: Number(event.target.value) })
            }
            style={{ width: "100%" }}
          />
          <label
            style={{ ...labelStyle, marginTop: "0.75rem" }}
            htmlFor="cc-elastic-damp"
          >
            Damping · {elasticConfig.damping.toFixed(2)}
          </label>
          <input
            id="cc-elastic-damp"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={elasticConfig.damping}
            onChange={(event) =>
              setElasticConfig({ damping: Number(event.target.value) })
            }
            style={{ width: "100%" }}
          />
          <label
            style={{ ...labelStyle, marginTop: "0.75rem" }}
            htmlFor="cc-pointer-coupling"
          >
            Pointer · {elasticConfig.pointerCoupling.toFixed(2)}
          </label>
          <input
            id="cc-pointer-coupling"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={elasticConfig.pointerCoupling}
            onChange={(event) =>
              setElasticConfig({
                pointerCoupling: Number(event.target.value),
              })
            }
            style={{ width: "100%" }}
          />
        </div>
      ) : null}

      {systemKey === "torn-paper" ? (
        <div style={{ marginTop: "1.25rem" }}>
          <label style={labelStyle} htmlFor="cc-tear">
            Tear · {tornPaperConfig.tearAmount.toFixed(2)}
          </label>
          <input
            id="cc-tear"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={tornPaperConfig.tearAmount}
            onChange={(event) =>
              setTornPaperConfig({ tearAmount: Number(event.target.value) })
            }
            style={{ width: "100%" }}
          />
          <label
            style={{ ...labelStyle, marginTop: "0.75rem" }}
            htmlFor="cc-layers"
          >
            Layers · {Math.round(tornPaperConfig.layerCount)}
          </label>
          <input
            id="cc-layers"
            type="range"
            min={3}
            max={12}
            step={1}
            value={tornPaperConfig.layerCount}
            onChange={(event) =>
              setTornPaperConfig({ layerCount: Number(event.target.value) })
            }
            style={{ width: "100%" }}
          />
          <label
            style={{ ...labelStyle, marginTop: "0.75rem" }}
            htmlFor="cc-curl"
          >
            Curl · {tornPaperConfig.curl.toFixed(2)}
          </label>
          <input
            id="cc-curl"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={tornPaperConfig.curl}
            onChange={(event) =>
              setTornPaperConfig({ curl: Number(event.target.value) })
            }
            style={{ width: "100%" }}
          />
          <label
            style={{ ...labelStyle, marginTop: "0.75rem" }}
            htmlFor="cc-drift"
          >
            Drift · {tornPaperConfig.drift.toFixed(2)}
          </label>
          <input
            id="cc-drift"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={tornPaperConfig.drift}
            onChange={(event) =>
              setTornPaperConfig({ drift: Number(event.target.value) })
            }
            style={{ width: "100%" }}
          />
        </div>
      ) : null}

      {systemKey === "type-architecture" ? (
        <div style={{ marginTop: "1.25rem" }}>
          <label style={labelStyle} htmlFor="cc-massing">
            Massing · {typeArchitectureConfig.massing.toFixed(2)}
          </label>
          <input
            id="cc-massing"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={typeArchitectureConfig.massing}
            onChange={(event) =>
              setTypeArchitectureConfig({
                massing: Number(event.target.value),
              })
            }
            style={{ width: "100%" }}
          />
          <label
            style={{ ...labelStyle, marginTop: "0.75rem" }}
            htmlFor="cc-columns"
          >
            Columns · {typeArchitectureConfig.columnDensity.toFixed(2)}
          </label>
          <input
            id="cc-columns"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={typeArchitectureConfig.columnDensity}
            onChange={(event) =>
              setTypeArchitectureConfig({
                columnDensity: Number(event.target.value),
              })
            }
            style={{ width: "100%" }}
          />
          <label
            style={{ ...labelStyle, marginTop: "0.75rem" }}
            htmlFor="cc-cantilever"
          >
            Cantilever · {typeArchitectureConfig.cantilever.toFixed(2)}
          </label>
          <input
            id="cc-cantilever"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={typeArchitectureConfig.cantilever}
            onChange={(event) =>
              setTypeArchitectureConfig({
                cantilever: Number(event.target.value),
              })
            }
            style={{ width: "100%" }}
          />
          <label
            style={{ ...labelStyle, marginTop: "0.75rem" }}
            htmlFor="cc-facade"
          >
            Facade · {typeArchitectureConfig.facadeDepth.toFixed(2)}
          </label>
          <input
            id="cc-facade"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={typeArchitectureConfig.facadeDepth}
            onChange={(event) =>
              setTypeArchitectureConfig({
                facadeDepth: Number(event.target.value),
              })
            }
            style={{ width: "100%" }}
          />
        </div>
      ) : null}

      {systemKey === "particle-disintegration" ||
      systemKey === "elastic-type" ? (
      <div style={{ marginTop: "1.25rem" }}>
        <label style={labelStyle} htmlFor="cc-force-mode">
          Pointer force
        </label>
        <select
          id="cc-force-mode"
          value={forceMode}
          onChange={(event) => setForceMode(event.target.value as ForceMode)}
          style={inputStyle}
        >
          {(
            [
              "push",
              "pull",
              "explode",
              "attract",
              "tear",
              "repel",
            ] as ForceMode[]
          ).map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>
        <p style={{ ...muted, marginTop: "0.45rem" }}>
          Drag across the poster to apply force.
        </p>
      </div>
      ) : null}

      {systemKey === "particle-disintegration" ? (
      <div style={{ marginTop: "1.25rem" }}>
        <p style={labelStyle}>SVG import</p>
        <input
          type="file"
          accept=".svg,image/svg+xml"
          aria-label="Upload SVG"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            if (!isSvgFileName(file.name) && file.type !== "image/svg+xml") {
              return;
            }
            void file.text().then((text) => {
              importSvgMarkup(text);
            });
          }}
          style={{ ...inputStyle, padding: "0.45rem" }}
        />
        {documentState.asset?.type === "svg" ? (
          <button
            type="button"
            onClick={() => clearSvgAsset()}
            style={{
              ...inputStyle,
              marginTop: "0.5rem",
              width: "auto",
              cursor: "pointer",
            }}
          >
            Clear SVG
          </button>
        ) : null}
        {svgError ? (
          <p
            role="alert"
            aria-live="assertive"
            style={{ ...muted, color: "#e2b4a2", marginTop: "0.4rem" }}
          >
            {svgError}
          </p>
        ) : null}
      </div>
      ) : null}

      {allowAudio ? (
        <div style={{ marginTop: "1.25rem" }}>
          <p style={labelStyle}>Audio reactive</p>
          <p style={{ ...muted, marginBottom: "0.55rem" }}>
            Local files stay in memory. Built-in tracks are procedural loops.
            {reducedMotion ? " Reduced motion disables displacement." : ""}
          </p>
          <label style={labelStyle} htmlFor="cc-audio-mode">
            Mode
          </label>
          <select
            id="cc-audio-mode"
            value={documentState.audio.mode}
            onChange={(event) => {
              const mode = event.target.value as
                | "off"
                | "curated"
                | "local";
              setAudioConfig({ mode });
              if (mode === "off") audio.stop();
            }}
            style={inputStyle}
          >
            <option value="off">Off</option>
            <option value="curated">Curated</option>
            <option value="local">Local file</option>
          </select>

          {documentState.audio.mode === "curated" ? (
            <div style={{ marginTop: "0.65rem" }}>
              <label style={labelStyle} htmlFor="cc-audio-track">
                Track
              </label>
              <select
                id="cc-audio-track"
                value={documentState.audio.trackKey}
                onChange={(event) =>
                  setAudioConfig({
                    trackKey: event.target.value as AudioTrackKey,
                  })
                }
                style={inputStyle}
              >
                {CURATED_AUDIO_TRACKS.map((track) => (
                  <option key={track.key} value={track.key}>
                    {track.title}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {documentState.audio.mode === "local" ? (
            <div style={{ marginTop: "0.65rem" }}>
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.m4a"
                aria-label="Upload audio"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  void audio.loadLocalFile(file);
                }}
                style={{ ...inputStyle, padding: "0.45rem" }}
              />
              {audio.localFileName ? (
                <p style={{ ...muted, marginTop: "0.4rem" }}>
                  Loaded · {audio.localFileName}
                </p>
              ) : null}
            </div>
          ) : null}

          {documentState.audio.mode !== "off" ? (
            <>
              <label
                style={{ ...labelStyle, marginTop: "0.75rem" }}
                htmlFor="cc-audio-gain"
              >
                Gain · {documentState.audio.gain.toFixed(2)}
              </label>
              <input
                id="cc-audio-gain"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={documentState.audio.gain}
                onChange={(event) =>
                  setAudioConfig({ gain: Number(event.target.value) })
                }
                style={{ width: "100%" }}
              />
              <label
                style={{ ...labelStyle, marginTop: "0.75rem" }}
                htmlFor="cc-audio-sensitivity"
              >
                Sensitivity · {documentState.audio.sensitivity.toFixed(2)}
              </label>
              <input
                id="cc-audio-sensitivity"
                type="range"
                min={0}
                max={2}
                step={0.01}
                value={documentState.audio.sensitivity}
                onChange={(event) =>
                  setAudioConfig({ sensitivity: Number(event.target.value) })
                }
                style={{ width: "100%" }}
              />
              <label
                style={{ ...labelStyle, marginTop: "0.75rem" }}
                htmlFor="cc-audio-displace"
              >
                Displacement · {documentState.audio.displacementAmount.toFixed(2)}
              </label>
              <input
                id="cc-audio-displace"
                type="range"
                min={0}
                max={2}
                step={0.01}
                value={documentState.audio.displacementAmount}
                onChange={(event) =>
                  setAudioConfig({
                    displacementAmount: Number(event.target.value),
                  })
                }
                style={{ width: "100%" }}
              />
              <label
                style={{ ...labelStyle, marginTop: "0.75rem" }}
                htmlFor="cc-audio-beat-boost"
              >
                Beat boost · {documentState.audio.beatBoost.toFixed(2)}
              </label>
              <input
                id="cc-audio-beat-boost"
                type="range"
                min={0}
                max={2}
                step={0.01}
                value={documentState.audio.beatBoost}
                onChange={(event) =>
                  setAudioConfig({ beatBoost: Number(event.target.value) })
                }
                style={{ width: "100%" }}
              />

              <p style={{ ...labelStyle, marginTop: "0.9rem" }}>Routing</p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                  marginTop: "0.35rem",
                }}
              >
                {AUDIO_ROUTING_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => setAudioConfig(preset.config)}
                    style={{
                      ...inputStyle,
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: tokens.fontMono,
                      fontSize: "0.6875rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {preset.title}
                  </button>
                ))}
              </div>

              <label
                style={{ ...labelStyle, marginTop: "0.75rem" }}
                htmlFor="cc-bass-weight"
              >
                Bass · {documentState.audio.bassWeight.toFixed(2)}
              </label>
              <input
                id="cc-bass-weight"
                type="range"
                min={0}
                max={2}
                step={0.01}
                value={documentState.audio.bassWeight}
                onChange={(event) =>
                  setAudioConfig({ bassWeight: Number(event.target.value) })
                }
                style={{ width: "100%" }}
              />
              <label
                style={{ ...labelStyle, marginTop: "0.75rem" }}
                htmlFor="cc-mid-weight"
              >
                Mid · {documentState.audio.midWeight.toFixed(2)}
              </label>
              <input
                id="cc-mid-weight"
                type="range"
                min={0}
                max={2}
                step={0.01}
                value={documentState.audio.midWeight}
                onChange={(event) =>
                  setAudioConfig({ midWeight: Number(event.target.value) })
                }
                style={{ width: "100%" }}
              />
              <label
                style={{ ...labelStyle, marginTop: "0.75rem" }}
                htmlFor="cc-treble-weight"
              >
                Treble · {documentState.audio.trebleWeight.toFixed(2)}
              </label>
              <input
                id="cc-treble-weight"
                type="range"
                min={0}
                max={2}
                step={0.01}
                value={documentState.audio.trebleWeight}
                onChange={(event) =>
                  setAudioConfig({ trebleWeight: Number(event.target.value) })
                }
                style={{ width: "100%" }}
              />
              <label
                style={{ ...labelStyle, marginTop: "0.75rem" }}
                htmlFor="cc-energy-weight"
              >
                Energy · {documentState.audio.energyWeight.toFixed(2)}
              </label>
              <input
                id="cc-energy-weight"
                type="range"
                min={0}
                max={2}
                step={0.01}
                value={documentState.audio.energyWeight}
                onChange={(event) =>
                  setAudioConfig({ energyWeight: Number(event.target.value) })
                }
                style={{ width: "100%" }}
              />
              <label
                style={{ ...labelStyle, marginTop: "0.75rem" }}
                htmlFor="cc-beat-weight"
              >
                Beat · {documentState.audio.beatWeight.toFixed(2)}
              </label>
              <input
                id="cc-beat-weight"
                type="range"
                min={0}
                max={2}
                step={0.01}
                value={documentState.audio.beatWeight}
                onChange={(event) =>
                  setAudioConfig({ beatWeight: Number(event.target.value) })
                }
                style={{ width: "100%" }}
              />

              <div
                style={{
                  display: "flex",
                  gap: "0.45rem",
                  marginTop: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={() => void audio.play()}
                  style={{ ...inputStyle, width: "auto", cursor: "pointer" }}
                >
                  Play
                </button>
                <button
                  type="button"
                  onClick={() => audio.pause()}
                  style={{ ...inputStyle, width: "auto", cursor: "pointer" }}
                >
                  Pause
                </button>
                <button
                  type="button"
                  onClick={() => audio.stop()}
                  style={{ ...inputStyle, width: "auto", cursor: "pointer" }}
                >
                  Stop
                </button>
              </div>
              <p style={{ ...muted, marginTop: "0.45rem" }} aria-live="polite">
                Status · {audio.status}
              </p>
              {audio.error ? (
                <p
                  role="alert"
                  aria-live="assertive"
                  style={{ ...muted, color: "#e2b4a2", marginTop: "0.35rem" }}
                >
                  {audio.error}
                </p>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}

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
        forceMode={forceMode}
        canvasRef={canvasRef}
        exporting={exporting}
        canvasDescribedBy={POSTER_CANVAS_DESC_ID}
      />
    </PosterErrorBoundary>
  );

  const handleExportStill = async () => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) {
      setExportMessage("Canvas not ready.");
      return;
    }
    setExporting(true);
    setExportMessage("Exporting still…");
    await new Promise((resolve) => window.requestAnimationFrame(resolve));
    const result = await captureStill({
      canvas: canvasEl,
      fileName: `controlled-chaos-${documentState.seed}.png`,
    });
    setExporting(false);
    setExportMessage(result.ok ? `Saved ${result.fileName}` : result.message);
    if (result.ok) analytics?.track("export_completed");
  };

  const handleExportVideo = async () => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) {
      setExportMessage("Canvas not ready.");
      return;
    }
    setExporting(true);
    setExportMessage("Recording loop…");
    const quality = configuration?.quality ?? "auto";
    const result = await recordPosterLoop({
      canvas: canvasEl,
      durationSeconds: documentState.document.loopDurationSeconds,
      fps: 30,
      fpsLadder: resolveVideoFpsLadder(30, quality),
      fileName: `controlled-chaos-${documentState.seed}.webm`,
      fallbackToStill: true,
      onFallback: (reason) => {
        setExportMessage(`Video unavailable (${reason}). Saving still…`);
      },
      onProgress: (ratio) => {
        setExportMessage(`Recording… ${Math.round(ratio * 100)}%`);
      },
    });
    setExporting(false);
    setExportMessage(
      result.ok
        ? `${result.kind === "still" ? "Fell back to still · " : ""}Saved ${result.fileName}`
        : result.message,
    );
    if (result.ok) analytics?.track("export_completed");
  };

  const handleSaveShare = async () => {
    if (!persistence) {
      setExportMessage("Persistence is not connected.");
      return;
    }
    const canvasEl = canvasRef.current;
    if (!canvasEl) {
      setExportMessage("Canvas not ready.");
      return;
    }

    setExporting(true);
    setExportMessage("Capturing thumbnail…");
    try {
      let thumbnailUrl: string | undefined;
      const thumb = await captureThumbnail({ canvas: canvasEl });
      if (thumb.ok && persistence.uploadThumbnail) {
        const dataUrl = await blobToDataUrl(thumb.blob);
        const uploaded = await persistence.uploadThumbnail(dataUrl);
        thumbnailUrl = uploaded.url;
      }

      setExportMessage("Saving creation…");
      const payload = serializePosterCreation(documentState, {
        presetKey: presetKey ?? configuration?.initialPresetKey,
        title: documentState.title ?? title,
        thumbnailUrl,
      });
      const saved = await persistence.save(payload);
      const absolute =
        typeof window !== "undefined"
          ? new URL(saved.url, window.location.origin).toString()
          : saved.url;
      setShareUrl(saved.url);
      try {
        await navigator.clipboard.writeText(absolute);
        analytics?.track("share_link_copied");
        setExportMessage(`Saved · link copied`);
      } catch {
        setExportMessage(`Saved · ${saved.url}`);
      }
    } catch (error) {
      setExportMessage(
        error instanceof Error ? error.message : "Save failed.",
      );
    } finally {
      setExporting(false);
    }
  };

  const exportActions = (
    <>
      {allowExport ? (
        <>
          <button
            type="button"
            disabled={exporting}
            onClick={() => void handleExportStill()}
            style={{
              appearance: "none",
              border: `1px solid ${tokens.line}`,
              background: tokens.surface,
              color: tokens.fg,
              fontFamily: tokens.fontMono,
              fontSize: "0.6875rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "0.55rem 0.85rem",
              cursor: exporting ? "wait" : "pointer",
              opacity: exporting ? 0.5 : 1,
            }}
          >
            Export PNG
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={() => void handleExportVideo()}
            style={{
              appearance: "none",
              border: `1px solid ${tokens.line}`,
              background: tokens.surface,
              color: tokens.fg,
              fontFamily: tokens.fontMono,
              fontSize: "0.6875rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "0.55rem 0.85rem",
              cursor: exporting ? "wait" : "pointer",
              opacity: exporting ? 0.5 : 1,
            }}
          >
            Export video
          </button>
        </>
      ) : null}
      {allowSave ? (
        <button
          type="button"
          disabled={exporting}
          onClick={() => void handleSaveShare()}
          style={{
            appearance: "none",
            border: "none",
            background: tokens.gold,
            color: tokens.ink,
            fontFamily: tokens.fontMono,
            fontSize: "0.6875rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "0.55rem 0.85rem",
            cursor: exporting ? "wait" : "pointer",
            opacity: exporting ? 0.5 : 1,
          }}
        >
          Save & share
        </button>
      ) : null}
    </>
  );

  return (
    <div
      data-cc-lab=""
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
      <style dangerouslySetInnerHTML={{ __html: focusVisibleCss }} />
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
        actions={exportActions}
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
            <p style={labelStyle}>How to explore</p>
            <p style={muted}>
              Edit the phrase, switch visual systems on the right, drag across
              the poster to apply force, then export or save a share link.
            </p>
            <p style={{ ...labelStyle, marginTop: "1.25rem" }}>Typography</p>
            <p style={muted}>
              Curated typefaces via typeface.json. Extruded geometry rebuilds
              after a short debounce while you edit.
            </p>
            <p style={{ ...labelStyle, marginTop: "1.25rem" }}>Loop</p>
            <p style={muted}>
              {documentState.document.loopDurationSeconds}s · seed-stable accents
            </p>
            {allowSave ? (
              <>
                <p style={{ ...labelStyle, marginTop: "1.25rem" }}>Share</p>
                <p style={muted}>
                  Save & share captures a thumbnail and creates an immutable
                  link.
                </p>
                {shareUrl ? (
                  <a
                    href={shareUrl}
                    style={{
                      ...muted,
                      display: "inline-block",
                      marginTop: "0.45rem",
                      color: tokens.gold,
                    }}
                  >
                    {shareUrl}
                  </a>
                ) : null}
              </>
            ) : null}
            {loadError ? (
              <p
                role="alert"
                aria-live="assertive"
                style={{ ...muted, color: "#e2b4a2", marginTop: "0.75rem" }}
              >
                {loadError}
              </p>
            ) : null}
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
          {loadError ? (
            <p
              role="alert"
              aria-live="assertive"
              style={{ ...muted, color: "#e2b4a2" }}
            >
              {loadError}
            </p>
          ) : null}
          <p style={muted} aria-live="polite" role="status">
            {exportMessage
              ? exportMessage
              : allowSave
                ? "Tip: switch systems on the right · drag the poster · Export PNG/video or Save & share."
                : "Tip: switch systems on the right · drag the poster · Export PNG or one loop as video."}
            {!exportMessage && !allowSave
              ? persistence
                ? " Persistence is connected."
                : " Persistence is not connected in this embed."
              : null}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function PosterLabShellWithAudio({
  configuration,
  ...rest
}: Omit<PosterLabShellProps, "initialDocument">) {
  const audioConfig = usePosterLabStore((state) => state.document.audio);
  const setAudioConfig = usePosterLabStore((state) => state.setAudioConfig);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const allowAudio = configuration?.allowAudio !== false;

  return (
    <AudioReactiveProvider
      config={audioConfig}
      onConfigChange={setAudioConfig}
      enabled={allowAudio}
      reducedMotion={reducedMotion}
    >
      <PosterLabShellInner configuration={configuration} {...rest} />
    </AudioReactiveProvider>
  );
}

/**
 * Phase 6 shell: save/share with thumbnails, hardened export, audio, systems.
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
      <PosterLabShellWithAudio configuration={configuration} {...rest} />
    </PosterLabStoreProvider>
  );
}
