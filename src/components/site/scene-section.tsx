"use client";
import { useHydratedReducedMotion as useReducedMotion } from "@/lib/use-hydrated-reduced-motion";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motionTokens, revealViewport } from "@/lib/motion-tokens";

type SceneTone = "clear" | "glass" | "plate" | "light" | "deep";

type SceneSectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Visual plate that enters over the mountain */
  tone?: SceneTone;
  /** How the plate reveals */
  reveal?: "rise" | "wipe-up" | "wipe-left" | "scale";
  ariaLabel?: string;
};

const toneClass: Record<SceneTone, string> = {
  clear: "bg-transparent",
  glass: "scene-glass",
  plate: "scene-plate",
  light: "scene-light",
  deep: "bg-bg-deep/94",
};

const revealInitial = {
  rise: { y: "8%", opacity: 0.55 },
  "wipe-up": { clipPath: "inset(14% 0 0 0)" },
  "wipe-left": { clipPath: "inset(0 0 0 18%)" },
  scale: { scale: 0.985, opacity: 0.7 },
} as const;

const revealAnimate = {
  rise: { y: "0%", opacity: 1 },
  "wipe-up": { clipPath: "inset(0% 0 0 0)" },
  "wipe-left": { clipPath: "inset(0 0 0 0%)" },
  scale: { scale: 1, opacity: 1 },
} as const;

export function SceneSection({
  id,
  children,
  className,
  tone = "glass",
  reveal = "wipe-up",
  ariaLabel,
}: SceneSectionProps) {
  const reduce = useReducedMotion();

  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn("relative border-b border-line", className)}
    >
      {tone === "clear" ? (
        <div className="relative z-10">{children}</div>
      ) : reduce ? (
        <div className={cn("relative z-10", toneClass[tone])}>{children}</div>
      ) : (
        <motion.div
          className={cn("relative z-10 will-change-transform", toneClass[tone])}
          initial={revealInitial[reveal]}
          whileInView={revealAnimate[reveal]}
          viewport={revealViewport}
          transition={{
            duration: motionTokens.durationSlow,
            ease: motionTokens.easeOut,
          }}
        >
          {children}
        </motion.div>
      )}
    </section>
  );
}
