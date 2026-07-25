"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

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
  const Tag = as;
  // Observe the heading box itself — not the translated child.
  // A child at y:110% inside overflow:hidden never intersects the viewport,
  // so whileInView on the span would leave headings stuck invisible.
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2, margin: "0px 0px -8% 0px" });

  if (reduce) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Tag ref={ref} className={cn("overflow-hidden", className)}>
      <motion.span
        className="block"
        initial={{ y: "110%", opacity: 0 }}
        animate={inView ? { y: "0%", opacity: 1 } : { y: "110%", opacity: 0 }}
        transition={{
          duration: 0.85,
          ease: [0.22, 1, 0.36, 1],
          delay,
        }}
      >
        {children}
      </motion.span>
    </Tag>
  );
}
