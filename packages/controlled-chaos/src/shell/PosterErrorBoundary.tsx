"use client";

import {
  Component,
  type CSSProperties,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { tokens } from "./tokens";

type PosterErrorBoundaryProps = {
  children: ReactNode;
  onError?: (error: Error) => void;
  fallbackLabel?: string;
};

type PosterErrorBoundaryState = {
  error: Error | null;
};

const wrap: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
  gap: "0.75rem",
  width: "100%",
  minHeight: 240,
  padding: "1.5rem",
  boxSizing: "border-box",
  border: `1px solid ${tokens.line}`,
  background: tokens.bgRaised,
  color: tokens.fg,
  fontFamily: tokens.fontSans,
};

const eyebrow: CSSProperties = {
  margin: 0,
  fontFamily: tokens.fontMono,
  fontSize: "0.6875rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: tokens.gold,
};

const retryButton: CSSProperties = {
  appearance: "none",
  border: `1px solid ${tokens.line}`,
  background: tokens.gold,
  color: tokens.ink,
  fontFamily: tokens.fontMono,
  fontSize: "0.6875rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  padding: "0.65rem 1rem",
  cursor: "pointer",
};

/**
 * Isolates renderer failures so a WebGL crash cannot take down the host page.
 */
export class PosterErrorBoundary extends Component<
  PosterErrorBoundaryProps,
  PosterErrorBoundaryState
> {
  state: PosterErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): PosterErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error);
    if (typeof console !== "undefined") {
      console.error("[controlled-chaos] render error", error, info);
    }
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div role="alert" style={wrap}>
          <p style={eyebrow}>
            {this.props.fallbackLabel ?? "Poster Lab error"}
          </p>
          <p style={{ margin: 0, fontSize: "0.9375rem", lineHeight: 1.6 }}>
            The graphics experience stopped unexpectedly. Retry the renderer, or
            return to the case study for the static preview.
          </p>
          <button type="button" onClick={this.handleRetry} style={retryButton}>
            Retry renderer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
