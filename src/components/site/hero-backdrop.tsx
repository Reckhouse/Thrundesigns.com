"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";

type HeroBackdropProps = {
  imageSrc?: string | null;
};

export function HeroBackdrop({ imageSrc }: HeroBackdropProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden bg-bg" aria-hidden>
      {imageSrc ? (
        reduce ? (
          <Image
            src={imageSrc}
            alt=""
            fill
            priority
            className="object-cover object-[28%_42%]"
            sizes="100vw"
          />
        ) : (
          <motion.div className="absolute inset-0" style={{ y, scale }}>
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.12 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={imageSrc}
                alt=""
                fill
                priority
                className="object-cover object-[28%_42%]"
                sizes="100vw"
              />
            </motion.div>
          </motion.div>
        )
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#2b3033,transparent_45%),linear-gradient(160deg,#111417,#090b0d)]" />
      )}

      {/* Lighter scrim — let the ridge read; keep type legible on the left */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,11,13,0.55)_0%,rgba(9,11,13,0.22)_38%,rgba(9,11,13,0.78)_100%)] md:bg-[linear-gradient(105deg,rgba(9,11,13,0.88)_0%,rgba(9,11,13,0.55)_34%,rgba(9,11,13,0.12)_62%,rgba(9,11,13,0.45)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg to-transparent" />
    </div>
  );
}
