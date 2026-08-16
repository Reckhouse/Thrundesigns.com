"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { useScrollScene } from "@/components/scroll/scroll-scene";
import { cn } from "@/lib/utils";
import { motionTokens } from "@/lib/motion-tokens";

type ClipHeadingProps = {
  as?: "h1" | "h2" | "h3";
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function ClipHeading({
  as = "h2",
  children,
  className,
  delay = 0,
}: ClipHeadingProps) {
  const reduce = useReducedMotion();
  const scene = useScrollScene();
  const Tag = as;
  // Observe the heading box — not the translated child (overflow:hidden trap).
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.2,
    margin: "0px 0px -8% 0px",
  });

  if (reduce) {
    return <Tag className={className}>{children}</Tag>;
  }

  const active = scene ? scene.entered : inView;

  return (
    <Tag ref={ref} className={cn("overflow-hidden", className)}>
      <motion.span
        className="block"
        initial={{ y: "110%", opacity: 0 }}
        animate={active ? { y: "0%", opacity: 1 } : { y: "110%", opacity: 0 }}
        transition={{
          duration: motionTokens.durationSlow,
          ease: motionTokens.easeOut,
          delay: active ? delay : 0,
        }}
      >
        {children}
      </motion.span>
    </Tag>
  );
}
