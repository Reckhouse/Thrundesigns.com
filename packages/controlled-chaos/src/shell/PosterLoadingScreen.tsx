"use client";

import type { CSSProperties } from "react";
import { tokens } from "./tokens";

type PosterLoadingScreenProps = {
  label?: string;
};

const wrap: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
  minHeight: 240,
  background: tokens.bgDeep,
  color: tokens.gold,
  fontFamily: tokens.fontMono,
  fontSize: "0.6875rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

export function PosterLoadingScreen({
  label = "Loading composition…",
}: PosterLoadingScreenProps) {
  return (
    <div style={wrap} aria-live="polite" aria-busy="true">
      {label}
    </div>
  );
}
