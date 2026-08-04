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
import { PosterCanvas } from "../scene/PosterCanvas";
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
import { defaultPhrase, tokens } from "./tokens";

export type PosterLabShellProps = {
  configuration?: ControlledChaosEmbedConfig;
  persistence?: ControlledChaosPersistenceAdapter;
  analytics?: ControlledChaosAnalyticsAdapter;
  creationId?: string;
  creationTitle?: string;
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

/**
 * Phase 1 application shell: responsive editor chrome + vertical canvas.
 * Visual systems, persistence UI, and export land in later phases.
 */
export function PosterLabShell({
  configuration,
  persistence: _persistence,
  analytics,
  creationId,
  creationTitle,
  variant = "lab",
}: PosterLabShellProps) {
  const height = configuration?.height ?? controlledChaosManifest.defaultHeight;
  const controls = configuration?.controls ?? "minimal";
  const showFullControls =
    variant === "lab" && (controls === "full" || controls === "minimal");
  const showInspector = variant === "lab" && controls === "full";

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
  const [phrase, setPhrase] = useState(defaultPhrase);
  const [draftPhrase, setDraftPhrase] = useState(defaultPhrase);
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const [onboardingStep, setOnboardingStep] = useState(1);

  const paused = userPaused ?? reducedMotion;

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
    ].filter(Boolean);
    return parts.join(" · ");
  }, [configuration?.mode, configuration?.initialPresetKey, creationId, variant]);

  const title =
    creationTitle?.trim() ||
    configuration?.initialPresetKey?.replace(/-/g, " ") ||
    controlledChaosManifest.title;

  const description = `Vertical poster composition reading “${phrase}” in the Controlled Chaos Poster Lab.`;

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
      <form
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          const next = draftPhrase.trim() || defaultPhrase;
          setPhrase(next.slice(0, 120));
          if (onboardingStep === 1) setOnboardingStep(2);
        }}
      >
        <label style={labelStyle} htmlFor="cc-phrase">
          Phrase
        </label>
        <input
          id="cc-phrase"
          name="phrase"
          value={draftPhrase}
          maxLength={120}
          onChange={(event) => setDraftPhrase(event.target.value)}
          style={inputStyle}
          autoComplete="off"
        />
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

      <div style={{ marginTop: "1.25rem" }}>
        <p style={labelStyle}>Visual system</p>
        <p style={muted}>
          Particle disintegration and additional systems arrive in later
          phases. This shell proves canvas framing, loop motion, and editor
          chrome.
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
        phrase={phrase}
        reducedMotion={reducedMotion}
        paused={paused}
        quality={configuration?.quality ?? "auto"}
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
        onTogglePause={() => setUserPaused(!paused)}
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
            <p style={labelStyle}>Content</p>
            <p style={muted}>
              Fonts, SVG import, and system picker land in Phase 2–3. Phrase
              editing is available on the right.
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
          <p style={{ ...labelStyle, marginBottom: 0 }}>Loop · 8s</p>
          <p style={muted}>
            Seamless timeline, gesture recording, and export controls arrive
            with later phases. Persistence adapter
            {_persistence ? " is connected." : " is not connected in this embed."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
