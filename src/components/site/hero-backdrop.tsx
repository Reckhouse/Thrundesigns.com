"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ContourOverlay } from "@/components/site/contour-overlay";
import { HeroCanvas } from "@/components/site/hero-canvas";

type HeroBackdropProps = {
  imageSrc?: string | null;
};

export function HeroBackdrop({ imageSrc }: HeroBackdropProps) {
  const reduce = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden bg-bg-raised" aria-hidden>
      {imageSrc ? (
        reduce ? (
          <Image
            src={imageSrc}
            alt=""
            fill
            priority
            className="object-cover object-[center_35%] grayscale contrast-125"
            sizes="100vw"
          />
        ) : (
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={imageSrc}
              alt=""
              fill
              priority
              className="object-cover object-[center_35%] grayscale contrast-125"
              sizes="100vw"
            />
          </motion.div>
        )
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#2b3033,transparent_45%),linear-gradient(160deg,#111417,#090b0d)]" />
      )}

      {/* Editorial scrim — keeps type legible without boxing the image */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,11,13,0.72)_0%,rgba(9,11,13,0.45)_42%,rgba(9,11,13,0.88)_100%)] md:bg-[linear-gradient(105deg,rgba(9,11,13,0.94)_0%,rgba(9,11,13,0.78)_38%,rgba(9,11,13,0.28)_68%,rgba(9,11,13,0.55)_100%)]" />

      <ContourOverlay className="absolute inset-0 hidden opacity-80 md:block" />
      <HeroCanvas className="absolute inset-0 hidden opacity-60 lg:block" />

      {/* Cream contrast rule — system’s strongest invert, used as a thin edge */}
      <div className="absolute inset-y-0 left-0 hidden w-px bg-contrast/40 lg:block" />
    </div>
  );
}
