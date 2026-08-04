"use client";

import type { CSSProperties, ReactNode } from "react";
import { tokens } from "./tokens";

type PosterViewportProps = {
  children: ReactNode;
  phraseHint?: string;
  description: string;
};

/**
 * Centers a 9:16 poster frame inside the available workspace.
 * Overlays are editor-only and must never be captured in exports later.
 */
export function PosterViewport({
  children,
  phraseHint,
  description,
}: PosterViewportProps) {
  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 0,
        padding: "1rem",
        background: `radial-gradient(ellipse at 50% 40%, ${tokens.bgRaised} 0%, ${tokens.bgDeep} 70%)`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "min(100%, calc((100dvh - 220px) * 9 / 16))",
          maxWidth: 420,
          aspectRatio: "9 / 16",
          border: `1px solid ${tokens.line}`,
          background: tokens.bgDeep,
          boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
          overflow: "hidden",
        }}
      >
        {children}
        <span
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          {description}
        </span>
      </div>

      {phraseHint ? (
        <p
          style={{
            position: "absolute",
            bottom: "1rem",
            left: "50%",
            transform: "translateX(-50%)",
            margin: 0,
            padding: "0.45rem 0.75rem",
            fontFamily: tokens.fontMono,
            fontSize: "0.6875rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: tokens.gold,
            background: "rgba(12, 13, 12, 0.72)",
            border: `1px solid ${tokens.line}`,
            pointerEvents: "none",
          }}
        >
          {phraseHint}
        </p>
      ) : null}
    </div>
  );
}

export const inspectorPanelStyle: CSSProperties = {
  width: "100%",
  maxWidth: 320,
  borderLeft: `1px solid ${tokens.line}`,
  background: tokens.bg,
  padding: "1rem",
  boxSizing: "border-box",
  overflow: "auto",
};

export const dockStyle: CSSProperties = {
  borderTop: `1px solid ${tokens.line}`,
  background: tokens.bg,
  padding: "0.85rem 1rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.65rem",
};
