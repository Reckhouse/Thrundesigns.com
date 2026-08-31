"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
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

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ModelStageSection({ models }: ModelStageSectionProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const entries = (models ?? [])
    .map((item, index) => {
      const url = resolveFileUrl(item.file ?? null);
      if (!url) return null;
      return {
        url,
        label: item.label?.trim() || `Model ${index + 1}`,
      };
    })
    .filter((item): item is { url: string; label: string } => Boolean(item));

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

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
          <ModelStageErrorBoundary>
            <ModelStageCanvas models={entries} />
          </ModelStageErrorBoundary>
        ) : null}
      </div>
    </SceneSection>
  );
}
