"use client";
import { useHydratedReducedMotion as useReducedMotion } from "@/lib/use-hydrated-reduced-motion";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { motionTokens, revealViewport } from "@/lib/motion-tokens";

type RevealVariant = "up" | "left" | "blur" | "scale" | "clip";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: RevealVariant;
};

const variants: Record<
  RevealVariant,
  {
    initial: Record<string, number | string>;
    animate: Record<string, number | string>;
  }
> = {
  up: {
    initial: { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0 },
  },
  left: {
    initial: { opacity: 0, x: -40 },
    animate: { opacity: 1, x: 0 },
  },
  blur: {
    initial: { opacity: 0, filter: "blur(8px)", y: 18 },
    animate: { opacity: 1, filter: "blur(0px)", y: 0 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
  },
  clip: {
    initial: { clipPath: "inset(0 0 100% 0)", opacity: 1 },
    animate: { clipPath: "inset(0 0 0% 0)", opacity: 1 },
  },
};

export function Reveal({
  children,
  className,
  delay = 0,
  variant = "up",
}: RevealProps) {
  const reduce = useReducedMotion();
  const motionVariant = variants[variant];

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={motionVariant.initial}
      whileInView={motionVariant.animate}
      viewport={revealViewport}
      transition={{
        duration:
          variant === "blur" || variant === "clip"
            ? motionTokens.durationSlow
            : motionTokens.durationBase,
        ease: motionTokens.easeOut,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
};

export function Stagger({
  children,
  className,
  stagger = motionTokens.stagger,
}: StaggerProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={revealViewport}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: stagger,
            delayChildren: 0.06,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  variant = "up",
}: {
  children: ReactNode;
  className?: string;
  variant?: "up" | "left" | "scale";
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  const item = {
    up: { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0 } },
    left: { hidden: { opacity: 0, x: -28 }, show: { opacity: 1, x: 0 } },
    scale: {
      hidden: { opacity: 0, scale: 0.96 },
      show: { opacity: 1, scale: 1 },
    },
  }[variant];

  return (
    <motion.div
      className={className}
      variants={{
        hidden: item.hidden,
        show: {
          ...item.show,
          transition: {
            duration: motionTokens.durationBase,
            ease: motionTokens.easeOut,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
