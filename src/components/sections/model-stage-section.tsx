"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { modelAssetUrl } from "@/lib/model-asset-url";
import {
  MotionToggle,
  useMotionPreference,
} from "@/components/site/motion-controls";
import { resolveFileUrl } from "@/lib/file-asset";
import type { SanityFileValue } from "@/types/three-experience";
import { SceneSection } from "@/components/site/scene-section";
import { ModelStageErrorBoundary } from "@/components/sections/model-stage-error-boundary";
import { MountainBackdrop } from "@/components/site/mountain-backdrop";

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
  const { paused } = useMotionPreference();
  const [visible, setVisible] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [selected, setSelected] = useState(0);
  const [adjustments, setAdjustments] = useState<
    Record<number, { yaw: number; hidden: boolean }>
  >({});
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
    const node = stageRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setActive(true);
        setVisible(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.01 },
    );
    observer.observe(node);
    const visibility = () =>
      setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  function adjust(yaw: number, hidden = false) {
    setAdjustments((current) => ({
      ...current,
      [selected]: { yaw: (current[selected]?.yaw ?? 0) + yaw, hidden },
    }));
  }

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
      {entries.length > 0 && (
        <div
          className="model-controls"
          role="group"
          aria-label="3D model controls"
        >
          <label htmlFor="selected-model">Model</label>
          <select
            id="selected-model"
            className="art-control"
            value={selected}
            onChange={(e) => setSelected(Number(e.target.value))}
          >
            {entries.map((entry, index) => (
              <option value={index} key={entry.url}>
                {entry.label}
              </option>
            ))}
          </select>
          <button
            className="art-control"
            type="button"
            aria-label="Rotate selected model left"
            onClick={() => adjust(-Math.PI / 6)}
          >
            ←
          </button>
          <button
            className="art-control"
            type="button"
            aria-label="Rotate selected model right"
            onClick={() => adjust(Math.PI / 6)}
          >
            →
          </button>
          <button
            className="art-control"
            type="button"
            onClick={() => adjust(0, true)}
          >
            Remove model
          </button>
          <button
            className="art-control"
            type="button"
            onClick={() => {
              setReset((v) => v + 1);
              setAdjustments({});
            }}
          >
            Reset models
          </button>
          <MotionToggle />
          <span className="sr-only" role="status">
            {adjustments[selected]?.hidden
              ? `${entries[selected]?.label} removed. Reset models to restore it.`
              : `${entries[selected]?.label} selected.`}
          </span>
        </div>
      )}
      <div
        ref={stageRef}
        className="model-landscape relative h-[58svh] min-h-[320px] w-full cursor-pointer md:h-[68svh]"
        onContextMenu={(event) => event.preventDefault()}
      >
        <MountainBackdrop />
        {!entries.length ? (
          <p className="p-6 text-center">No models are available yet.</p>
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
            <ModelStageCanvas
              models={entries}
              paused={paused}
              visible={visible && tabVisible}
              adjustments={adjustments}
            />
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
