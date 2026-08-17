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

export function ModelStageSection({ models }: ModelStageSectionProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

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
  }, []);

  const aria = entries.length
    ? `Rotating 3D models: ${entries.map((item) => item.label).join(", ")}`
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
        className="relative h-[58svh] min-h-[320px] w-full md:h-[68svh]"
      >
        {active ? (
          <ModelStageErrorBoundary>
            <ModelStageCanvas models={entries} />
          </ModelStageErrorBoundary>
        ) : null}
      </div>
    </SceneSection>
  );
}
