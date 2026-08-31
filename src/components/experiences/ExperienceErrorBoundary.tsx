"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type ExperienceErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
};

type ExperienceErrorBoundaryState = {
  error: Error | null;
};

export class ExperienceErrorBoundary extends Component<
  ExperienceErrorBoundaryProps,
  ExperienceErrorBoundaryState
> {
  state: ExperienceErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ExperienceErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          role="alert"
          className="flex min-h-[50vh] flex-col items-start justify-center gap-4 border border-line bg-bg-raised p-8"
        >
          <p className="font-mono text-label uppercase tracking-[0.14em] text-gold">
            Experience error
          </p>
          <p className="max-w-lg font-sans text-body leading-7 text-fg">
            The interactive lab failed to render. You can return to the case
            study or reload this page.
          </p>
          <button
            type="button"
            className="inline-flex h-[44px] items-center border border-line px-4 font-mono text-label uppercase tracking-[0.12em] text-fg transition-colors hover:border-gold hover:text-gold"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
