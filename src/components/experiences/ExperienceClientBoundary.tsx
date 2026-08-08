"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { useReducedMotion } from "framer-motion";
import { getExperienceClientPlugin } from "@/experiences/registry.client";
import { trackExperienceEvent } from "@/experiences/analytics";
import type {
  ExperienceEmbedConfiguration,
  ExperienceLoadBehavior,
  ExperienceMode,
} from "@/experiences/types";
import { cn } from "@/lib/utils";

type ExperienceClientBoundaryProps = {
  experienceKey: string;
  mode: ExperienceMode;
  configuration: ExperienceEmbedConfiguration;
  loadBehavior: ExperienceLoadBehavior;
  height: number;
  poster: ReactNode;
  fallbackVideo?: ReactNode;
  className?: string;
};

type LoadState = "idle" | "loading" | "ready" | "error";

function pickLoader(
  experienceKey: string,
  mode: ExperienceMode,
): (() => Promise<{ default: ComponentType<Record<string, unknown>> }>) | null {
  const plugin = getExperienceClientPlugin(experienceKey);
  if (!plugin) return null;
  if (mode === "preview") return plugin.loadPreview;
  if (mode === "replay") return plugin.loadReplay ?? plugin.loadExperience;
  return plugin.loadExperience;
}

export function ExperienceClientBoundary({
  experienceKey,
  mode,
  configuration,
  loadBehavior,
  height,
  poster,
  fallbackVideo,
  className,
}: ExperienceClientBoundaryProps) {
  const reduceMotion = useReducedMotion();
  const [state, setState] = useState<LoadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ExperienceComponent, setExperienceComponent] = useState<ComponentType<
    Record<string, unknown>
  > | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const posterTrackedRef = useRef(false);

  const effectiveBehavior: ExperienceLoadBehavior =
    reduceMotion && loadBehavior !== "interaction" ? "interaction" : loadBehavior;

  const onPosterViewed = useEffectEvent(() => {
    if (posterTrackedRef.current) return;
    posterTrackedRef.current = true;
    trackExperienceEvent("poster_viewed", {
      experienceKey,
      mode,
      loadBehavior: effectiveBehavior,
    });
  });

  useEffect(() => {
    onPosterViewed();
  }, [onPosterViewed]);

  const startLoad = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setState("loading");
    setErrorMessage(null);

    trackExperienceEvent("load_action_selected", {
      experienceKey,
      mode,
      loadBehavior: effectiveBehavior,
    });

    const loader = pickLoader(experienceKey, mode);
    if (!loader) {
      startedRef.current = false;
      setState("error");
      setErrorMessage("This interactive experience is not available.");
      trackExperienceEvent("experience_failed", {
        experienceKey,
        mode,
        reason: "missing_plugin",
      });
      return;
    }

    try {
      const mod = await loader();
      setExperienceComponent(() => mod.default);
      setState("ready");
      trackExperienceEvent(
        mode === "replay" ? "replay_loaded" : "experience_initialized",
        { experienceKey, mode },
      );
    } catch (error) {
      startedRef.current = false;
      setState("error");
      setErrorMessage(
        error instanceof Error
          ? "The interactive experience failed to load."
          : "The interactive experience failed to load.",
      );
      trackExperienceEvent("experience_failed", {
        experienceKey,
        mode,
        reason: "dynamic_import",
      });
    }
  }, [effectiveBehavior, experienceKey, mode]);

  useEffect(() => {
    if (effectiveBehavior === "immediate") {
      void startLoad();
    }
  }, [effectiveBehavior, startLoad]);

  useEffect(() => {
    if (effectiveBehavior !== "viewport") return;
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void startLoad();
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [effectiveBehavior, startLoad]);

  useEffect(() => {
    return () => {
      // Ensure loaders can re-run if the section remounts after navigation.
      startedRef.current = false;
    };
  }, []);

  const minHeight = Math.min(Math.max(height, 320), 900);

  return (
    <div
      ref={rootRef}
      className={cn("relative w-full overflow-hidden bg-bg-raised", className)}
      style={{ minHeight }}
    >
      {state === "ready" && ExperienceComponent ? (
        <div className="relative z-[1] h-full min-h-[inherit] w-full">
          <ExperienceComponent configuration={configuration} />
        </div>
      ) : (
        <>
          {/* Poster only for opt-in loads / errors — immediate/viewport go straight to WebGL. */}
          {effectiveBehavior === "interaction" || state === "error" ? (
            <div className="absolute inset-0">
              {state === "error" && fallbackVideo ? fallbackVideo : poster}
            </div>
          ) : (
            <div className="absolute inset-0 bg-bg-raised" aria-hidden />
          )}

          <div className="absolute inset-0 z-[1] flex flex-col items-start justify-end gap-4 bg-gradient-to-t from-bg-deep/90 via-bg-deep/20 to-transparent p-6 md:p-8">
            {state === "error" ? (
              <p
                role="alert"
                className="max-w-md font-sans text-[14px] leading-6 text-fg"
              >
                {errorMessage || "Interactive experience unavailable."} You can
                still review the case study above or open the full experience
                when available.
              </p>
            ) : null}

            {state === "loading" ||
            (state === "idle" &&
              (effectiveBehavior === "viewport" ||
                effectiveBehavior === "immediate")) ? (
              <p
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold"
                aria-live="polite"
              >
                {reduceMotion && effectiveBehavior !== "interaction"
                  ? "Interactive load available on demand"
                  : "Loading interactive experience…"}
              </p>
            ) : null}

            {state === "idle" && effectiveBehavior === "interaction" ? (
              <button
                type="button"
                onClick={() => void startLoad()}
                className="inline-flex h-[52px] items-center border border-gold/65 bg-transparent px-[18px] font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-fg transition-colors hover:border-gold hover:bg-gold/10 hover:text-gold"
              >
                {reduceMotion
                  ? "Load interactive version"
                  : "Try the interactive version"}
              </button>
            ) : null}

            {state === "error" ? (
              <button
                type="button"
                onClick={() => {
                  startedRef.current = false;
                  void startLoad();
                }}
                className="inline-flex h-[44px] items-center border border-line px-4 font-mono text-[11px] uppercase tracking-[0.12em] text-fg transition-colors hover:border-gold hover:text-gold"
              >
                Try again
              </button>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
