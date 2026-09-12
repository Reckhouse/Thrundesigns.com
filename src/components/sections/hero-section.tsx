"use client";
import { useHydratedReducedMotion as useReducedMotion } from "@/lib/use-hydrated-reduced-motion";
import { useRef } from "react";
import { stegaClean } from "@sanity/client/stega";

import { PrimaryButtonLink, TextLink } from "@/components/site/primitives";
import { HorseParticlesLazy } from "@/components/hero/horse-particles-lazy";
type HeroSectionProps = {
  eyebrow?: string | null;
  headline?: string | null;
  support?: string | null;
  servicesMeta?: string | null;
  primaryCta?: { label?: string | null; href?: string | null } | null;
  secondaryCta?: { label?: string | null; href?: string | null } | null;
};
export function HeroSection({
  eyebrow,
  headline,
  support,
  servicesMeta,
  primaryCta,
  secondaryCta,
}: HeroSectionProps) {
  const quoteCta =
    primaryCta?.href && stegaClean(primaryCta.href).startsWith("/quote")
      ? primaryCta
      : { href: "/quote", label: "Request a quote" };
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  return (
    <section
      ref={sectionRef}
      className="editorial-hero"
      aria-label="Introduction"
    >
      <div className="editorial-container editorial-hero-grid">
        <div className="editorial-hero-copy">
          <p className="editorial-brand">{eyebrow || "Thrun Design Co."}</p>
          <h1>
            {headline ||
              "Strategic design for businesses ready to move forward."}
          </h1>
          <p className="editorial-intro">
            {support ||
              "We help founders and owners build clearer brands, websites, and marketing systems so your next chapter feels confident, not chaotic."}
          </p>
          <div ref={ctaRef} className="editorial-actions">
            <PrimaryButtonLink href={stegaClean(quoteCta.href || "/quote")}>
              {quoteCta.label || "Request a quote"}
            </PrimaryButtonLink>
            <TextLink href={stegaClean(secondaryCta?.href || "/work")}>
              {secondaryCta?.label || "Browse concept studies"}
            </TextLink>
          </div>
          {servicesMeta && <p className="editorial-meta">{servicesMeta}</p>}
        </div>
        <div className="editorial-horse">
          <HorseParticlesLazy
            layout="centered"
            staticMode={Boolean(reduce)}
            ctaRef={ctaRef}
            sectionRef={sectionRef}
          />
          <span className="editorial-art-caption">
            Living Engraving · Drag to explore
          </span>
        </div>
      </div>
    </section>
  );
}
