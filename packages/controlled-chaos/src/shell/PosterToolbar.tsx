"use client";

import type { CSSProperties, ReactNode } from "react";
import { tokens } from "./tokens";

type PosterToolbarProps = {
  title: string;
  modeLabel: string;
  showFullControls: boolean;
  paused: boolean;
  onTogglePause: () => void;
  actions?: ReactNode;
};

const bar: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1rem",
  flexWrap: "wrap",
  padding: "0.75rem 1rem",
  borderBottom: `1px solid ${tokens.line}`,
  background: `rgba(12, 13, 12, 0.92)`,
  backdropFilter: "blur(8px)",
};

const mono: CSSProperties = {
  margin: 0,
  fontFamily: tokens.fontMono,
  fontSize: "0.6875rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: tokens.gold,
};

const button: CSSProperties = {
  appearance: "none",
  border: `1px solid ${tokens.line}`,
  background: tokens.surface,
  color: tokens.fg,
  fontFamily: tokens.fontMono,
  fontSize: "0.6875rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  padding: "0.55rem 0.85rem",
  cursor: "pointer",
};

export function PosterToolbar({
  title,
  modeLabel,
  showFullControls,
  paused,
  onTogglePause,
  actions,
}: PosterToolbarProps) {
  return (
    <header style={bar}>
      <div style={{ minWidth: 0 }}>
        <p style={mono}>Controlled Chaos</p>
        <h2
          style={{
            margin: "0.15rem 0 0",
            fontFamily: tokens.fontDisplay,
            fontSize: "1.05rem",
            fontWeight: 400,
            letterSpacing: "-0.02em",
            color: tokens.fg,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            ...mono,
            color: tokens.fgMuted,
            marginTop: "0.25rem",
            textTransform: "none",
            letterSpacing: "0.04em",
          }}
        >
          {modeLabel}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        {showFullControls ? (
          <button
            type="button"
            style={button}
            onClick={onTogglePause}
            aria-pressed={paused}
          >
            {paused ? "Play" : "Pause"}
          </button>
        ) : null}
        {actions}
      </div>
    </header>
  );
}
