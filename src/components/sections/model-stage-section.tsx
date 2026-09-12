"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { modelAssetUrl } from "@/lib/model-asset-url";
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";
import { resolveFileUrl } from "@/lib/file-asset";
import type { SanityFileValue } from "@/types/three-experience";
import { SceneSection } from "@/components/site/scene-section";
import { ModelStageErrorBoundary } from "@/components/sections/model-stage-error-boundary";

const ModelStageCanvas = dynamic(
  () =>
    import("@/components/sections/model-stage-canvas").then(
      (mod) => mod.ModelStageCanvas,
    ),
  { ssr: false },
);

export type HomepageModelItem = {
  _key?: string;
  label?: string | null;
  file?: SanityFileValue;
};

type ModelStageSectionProps = {
  models?: HomepageModelItem[] | null;
};

export function ModelStageSection({ models }: ModelStageSectionProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const reducedMotion = useHydratedReducedMotion();
  const [reset, setReset] = useState(0);

  const entries = (models ?? [])
    .map((item, index) => {
      const url = resolveFileUrl(item.file ?? null);
      if (!url) return null;
      return {
        url: modelAssetUrl(url),
        label: item.label?.trim() || `Model ${index + 1}`,
      };
    })
    .filter((item): item is { url: string; label: string } => Boolean(item));

  useEffect(() => {
    if (reducedMotion) return;
    const node = stageRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setActive(true);
      },
      { rootMargin: "200px 0px", threshold: 0.05 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const aria = entries.length
    ? `Rotating 3D models: ${entries.map((item) => item.label).join(", ")}. Click a model to knock it off the stage.`
    : "3D model stage";

  return (
    <SceneSection
      id="models"
      tone="clear"
      reveal="rise"
      ariaLabel={aria}
      className="border-b-0"
    >
      <div
        ref={stageRef}
        className="relative h-[58svh] min-h-[320px] w-full cursor-pointer md:h-[68svh]"
        onContextMenu={(event) => event.preventDefault()}
      >
        {!reducedMotion && (
          <button
            type="button"
            onClick={() => setReset((value) => value + 1)}
            className="absolute right-6 top-6 z-20 border border-line bg-bg px-4 py-3 text-sm text-fg hover:border-gold"
          >
            Reset models
          </button>
        )}
        {reducedMotion ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 border border-line bg-bg-raised px-6 text-center">
            <p className="font-mono text-label uppercase tracking-[0.14em] text-gold">
              3D stage
            </p>
            <p className="max-w-[36ch] text-pretty font-sans text-body text-fg-muted">
              Interactive models are paused because reduced motion is preferred.
              {entries.length
                ? ` Featured pieces: ${entries.map((item) => item.label).join(", ")}.`
                : null}
            </p>
          </div>
        ) : active ? (
          <ModelStageErrorBoundary
            key={reset}
            fallback={
              <div
                role="alert"
                className="flex h-full items-center justify-center p-6 text-center text-fg-muted"
              >
                <div>
                  <p>The models could not load.</p>
                  <button
                    type="button"
                    className="mt-4 underline underline-offset-4"
                    onClick={() => window.location.reload()}
                  >
                    Reload page to retry
                  </button>
                </div>
              </div>
            }
          >
            <ModelStageCanvas models={entries} />
          </ModelStageErrorBoundary>
        ) : (
          <p
            role="status"
            className="absolute inset-0 flex items-center justify-center text-fg-muted"
          >
            Loading models…
          </p>
        )}
      </div>
    </SceneSection>
  );
}
