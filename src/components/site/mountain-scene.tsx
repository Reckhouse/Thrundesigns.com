"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

type MountainSceneProps = {
  imageSrc?: string | null;
};

/**
 * Persistent mountain canvas — fixed behind the page so sections
 * can animate into / over one continuous visual environment.
 */
export function MountainScene({ imageSrc }: MountainSceneProps) {
  const reduce = useReducedMotion();
  const src = imageSrc || "/images/hero-mountain.jpg";
  const { scrollYProgress } = useScroll();

  const scale = useTransform(
    scrollYProgress,
    [0, 0.35, 0.7, 1],
    [1.06, 1.12, 1.16, 1.2],
  );
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const veil = useTransform(
    scrollYProgress,
    [0, 0.12, 0.35, 0.55, 0.8, 1],
    [0.28, 0.4, 0.55, 0.62, 0.48, 0.42],
  );

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-bg-deep"
      aria-hidden
    >
      {reduce ? (
        <Image
          src={src}
          alt=""
          fill
          priority
          className="object-cover object-[28%_42%] scale-105"
          sizes="100vw"
        />
      ) : (
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{ scale, y }}
        >
          <Image
            src={src}
            alt=""
            fill
            priority
            className="object-cover object-[28%_42%]"
            sizes="100vw"
          />
        </motion.div>
      )}

      {/* Left-biased legibility veil — keeps ridge detail visible */}
      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(12,13,12,0.78)_0%,rgba(12,13,12,0.42)_38%,rgba(12,13,12,0.18)_62%,rgba(12,13,12,0.5)_100%)] md:bg-[linear-gradient(105deg,rgba(12,13,12,0.82)_0%,rgba(12,13,12,0.45)_34%,rgba(12,13,12,0.12)_58%,rgba(12,13,12,0.4)_100%)]" />

      {reduce ? (
        <div className="absolute inset-0 bg-bg-deep/45" />
      ) : (
        <motion.div
          className="absolute inset-0 bg-bg-deep"
          style={{ opacity: veil }}
        />
      )}

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg-deep/80 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-bg-deep/55 to-transparent" />
    </div>
  );
}
