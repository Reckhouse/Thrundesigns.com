import type { CSSProperties, ReactNode } from "react";
import type { ControlledChaosEmbedConfig } from "./schemas";

export type StubShellProps = {
  label: string;
  configuration?: ControlledChaosEmbedConfig;
  creationId?: string;
  children?: ReactNode;
};

const shellStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
  gap: "0.75rem",
  width: "100%",
  height: "100%",
  minHeight: 240,
  padding: "1.5rem",
  boxSizing: "border-box",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  background:
    "linear-gradient(160deg, #1c1e1b 0%, #0c0d0c 55%, #222522 100%)",
  color: "#f4f1e9",
  fontFamily: "IBM Plex Sans, Helvetica Neue, sans-serif",
};

const eyebrowStyle: CSSProperties = {
  margin: 0,
  fontFamily: "IBM Plex Mono, ui-monospace, monospace",
  fontSize: "0.6875rem",
  fontWeight: 500,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#d4af6a",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontFamily: "Libre Baskerville, Georgia, serif",
  fontSize: "1.25rem",
  fontWeight: 400,
  lineHeight: 1.2,
};

const metaStyle: CSSProperties = {
  margin: 0,
  fontSize: "0.875rem",
  lineHeight: 1.5,
  color: "#c7c2b8",
};

/**
 * Non-WebGL placeholder so the portfolio can wire registry/CMS before
 * the real Controlled Chaos renderer exists.
 */
export function StubShell({
  label,
  configuration,
  creationId,
  children,
}: StubShellProps) {
  const height = configuration?.height ?? 720;

  return (
    <div
      role="img"
      aria-label={`${label} (stub experience)`}
      style={{ ...shellStyle, minHeight: Math.min(height, 480) }}
      data-experience-stub="controlled-chaos-poster-lab"
      data-mode={configuration?.mode}
    >
      <p style={eyebrowStyle}>Stub experience</p>
      <p style={titleStyle}>{label}</p>
      <p style={metaStyle}>
        Controlled Chaos is not installed yet. This placeholder confirms the
        portfolio registry, lazy-load boundary, and embed contract.
      </p>
      {configuration ? (
        <p style={metaStyle}>
          Mode: {configuration.mode}
          {configuration.initialPresetKey
            ? ` · Preset: ${configuration.initialPresetKey}`
            : ""}
          {creationId ? ` · Creation: ${creationId}` : ""}
          {configuration.initialCreationId && !creationId
            ? ` · Creation: ${configuration.initialCreationId}`
            : ""}
        </p>
      ) : null}
      {children}
    </div>
  );
}
