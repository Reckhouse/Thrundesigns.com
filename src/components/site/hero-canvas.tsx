"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";

const Scene = dynamic(
  () => import("@/components/site/hero-scene").then((m) => m.HeroScene),
  { ssr: false },
);

export function HeroCanvas({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div className={className} aria-hidden>
      <Scene />
    </div>
  );
}
