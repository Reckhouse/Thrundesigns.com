"use client";

import type { CSSProperties } from "react";
import { tokens } from "./tokens";

type PosterFallbackProps = {
  title?: string;
  message: string;
  reason?: "webgl" | "generic";
};

const wrap: CSSProperties = {
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
  border: `1px solid ${tokens.line}`,
  background: `linear-gradient(160deg, ${tokens.bgRaised} 0%, ${tokens.bgDeep} 55%, ${tokens.surface} 100%)`,
  color: tokens.fg,
  fontFamily: tokens.fontSans,
};

export function PosterFallback({
  title = "Poster Lab unavailable",
  message,
  reason = "generic",
}: PosterFallbackProps) {
  return (
    <div role="alert" style={wrap} data-fallback-reason={reason}>
      <p
        style={{
          margin: 0,
          fontFamily: tokens.fontMono,
          fontSize: "0.6875rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: tokens.gold,
        }}
      >
        {title}
      </p>
      <p style={{ margin: 0, fontSize: "0.9375rem", lineHeight: 1.6 }}>
        {message}
      </p>
    </div>
  );
}

export function detectWebGLSupport(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}
