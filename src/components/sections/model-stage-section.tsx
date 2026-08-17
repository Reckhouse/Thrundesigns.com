"use client";

import dynamic from "next/dynamic";
import { resolveFileUrl } from "@/lib/file-asset";
import type { SanityFileValue } from "@/types/three-experience";
import { SceneSection } from "@/components/site/scene-section";

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
      <div className="relative h-[58svh] min-h-[320px] w-full md:h-[68svh]">
        <ModelStageCanvas models={entries} />
      </div>
    </SceneSection>
  );
}
