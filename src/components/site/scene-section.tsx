"use client";

import type { ReactNode } from "react";
import { ScrollScene } from "@/components/scroll/scroll-scene";
import type { ScrollStoryTransition } from "@/lib/scroll-story/tokens";
import { cn } from "@/lib/utils";

type SceneTone = "clear" | "glass" | "plate" | "light" | "deep";

type SceneSectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Visual plate that enters over the mountain */
  tone?: SceneTone;
  /** Scrubbed plate handoff owned by ScrollScene */
  reveal?: ScrollStoryTransition;
  ariaLabel?: string;
  /** When false, section stays in normal flow (no pin). */
  pin?: boolean;
  soft?: boolean;
};

const toneClass: Record<SceneTone, string> = {
  clear: "bg-transparent",
  glass: "scene-glass",
  plate: "scene-plate",
  light: "scene-light",
  deep: "bg-bg-deep/94",
};

/**
 * Section plate for the mountain scroll story. Pin + scrub transitions are
 * owned by GSAP ScrollScene; Framer is not used for plate entrance anymore.
 */
export function SceneSection({
  id,
  children,
  className,
  tone = "glass",
  reveal = "wipe-up",
  ariaLabel,
  pin = true,
  soft = false,
}: SceneSectionProps) {
  return (
    <ScrollScene
      id={id}
      ariaLabel={ariaLabel}
      className={cn("relative border-b border-line", className)}
      transition={reveal}
      pin={pin}
      soft={soft}
    >
      <div
        className={cn(
          "relative z-10",
          tone === "clear" ? undefined : toneClass[tone],
        )}
      >
        {children}
      </div>
    </ScrollScene>
  );
}
