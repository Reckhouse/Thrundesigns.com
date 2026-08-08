"use client";

import { Reveal, Stagger, StaggerItem } from "@/components/site/reveal";
import { ClipHeading } from "@/components/site/clip-heading";
import { SceneSection } from "@/components/site/scene-section";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/motion-tokens";

type WhySectionProps = {
  heading?: string | null;
  bullets?: string[] | null;
  credibilityHeading?: string | null;
  proofPoints?: { num?: string | null; label?: string | null }[] | null;
};

export function WhySection({
  heading,
  bullets,
  credibilityHeading,
  proofPoints,
}: WhySectionProps) {
  const reduce = useReducedMotion();
  const list =
    bullets?.length
      ? bullets
      : [
          "Systems that stay coherent as you grow",
          "Brand architecture that works across channels",
          "Careful craft without decorative excess",
          "Steady pace from discovery through launch",
        ];

  const deliverables =
    proofPoints?.length
      ? proofPoints
      : [
          {
            num: "01",
            label: "Identity systems and guidelines your team can actually use",
          },
          {
            num: "02",
            label:
              "Websites designed for clarity and conversion, then maintained",
          },
          {
            num: "03",
            label: "Marketing audits that show what’s working and what isn’t",
          },
          {
            num: "04",
            label: "Print and digital assets that speak in one voice",
          },
        ];

  return (
    <SceneSection id="about" tone="clear" reveal="scale">
      <Stagger
        className="mx-auto grid w-full max-w-[1440px] gap-4 px-5 py-16 md:gap-6 md:px-10 md:py-24 lg:grid-cols-2 lg:gap-8 lg:px-[74px] lg:py-28"
        stagger={0.16}
      >
        <StaggerItem variant="left">
          <motion.div
            className="editorial-panel h-full border-line bg-surface-glass p-6 md:p-8 lg:p-9"
            whileHover={
              reduce
                ? undefined
                : {
                    y: -4,
                    transition: {
                      duration: motionTokens.durationFast,
                      ease: motionTokens.easeOut,
                    },
                  }
            }
          >
            <ClipHeading className="max-w-md text-balance font-display text-[clamp(1.75rem,3.2vw,2.65rem)] leading-[1.1] tracking-[-0.02em] text-fg">
              {heading || "A partner when the stakes feel real."}
            </ClipHeading>
            <ul className="mt-10 space-y-5 md:mt-12 md:space-y-6">
              {list.map((item, index) => (
                <motion.li
                  key={item}
                  className="flex items-start gap-4"
                  initial={reduce ? false : { opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.1 + index * 0.08,
                    duration: motionTokens.durationFast,
                    ease: motionTokens.easeOut,
                  }}
                >
                  <span className="mt-2 size-1.5 shrink-0 bg-gold" aria-hidden />
                  <p className="font-sans text-[15px] leading-6 text-fg">
                    {item}
                  </p>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </StaggerItem>

        <StaggerItem variant="scale" className="h-full">
          <Reveal variant="scale" className="h-full">
            <motion.div
              className="editorial-panel relative h-full border-line bg-surface-glass p-6 md:p-8 lg:p-9"
              whileHover={
                reduce
                  ? undefined
                  : {
                      y: -4,
                      transition: {
                        duration: motionTokens.durationFast,
                        ease: motionTokens.easeOut,
                      },
                    }
              }
            >
              <h3 className="text-balance font-display text-[clamp(1.75rem,3vw,2.15rem)] leading-[1.15] text-fg">
                {credibilityHeading || "What you get when we work together."}
              </h3>
              <ul className="mt-10 space-y-5 md:mt-16 md:space-y-6">
                {deliverables.map((item, index) => (
                  <motion.li
                    key={`${item.num}-${item.label}`}
                    className="flex gap-5"
                    initial={reduce ? false : { opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.15 + index * 0.08,
                      duration: motionTokens.durationFast,
                      ease: motionTokens.easeOut,
                    }}
                  >
                    <span
                      className="font-mono text-[12px] text-gold"
                      aria-hidden
                    >
                      {item.num}
                    </span>
                    <p className="font-sans text-[15px] leading-6 text-fg-muted">
                      {item.label}
                    </p>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </Reveal>
        </StaggerItem>
      </Stagger>
    </SceneSection>
  );
}
