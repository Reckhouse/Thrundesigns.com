"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type RevealVariant = "up" | "left" | "blur" | "scale";

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
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
  },
  left: {
    initial: { opacity: 0, x: -36 },
    animate: { opacity: 1, x: 0 },
  },
  blur: {
    initial: { opacity: 0, filter: "blur(10px)", y: 16 },
    animate: { opacity: 1, filter: "blur(0px)", y: 0 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
  },
};

const viewport = { once: true, amount: 0.15, margin: "0px 0px -6% 0px" } as const;

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
      viewport={viewport}
      transition={{
        duration: variant === "blur" ? 0.85 : 0.7,
        ease: [0.22, 1, 0.36, 1],
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
  stagger = 0.1,
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
      viewport={viewport}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: stagger, delayChildren: 0.08 },
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
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 22 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
