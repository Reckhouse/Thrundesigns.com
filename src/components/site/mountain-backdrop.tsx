"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useMotionPreference } from "@/components/site/motion-controls";

/** Decorative landscape shared by the introduction and interactive model stage. */
export function MountainBackdrop({ hero = false }: { hero?: boolean }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const { paused } = useMotionPreference();

  useEffect(() => {
    const layer = layerRef.current;
    const surface = layer?.parentElement;
    if (!layer || !surface || paused) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      if (document.hidden) return;
      const rect = surface.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      // Overscan is 64px; displacement stays within 48px at every viewport size.
      const progress =
        (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const offset = (Math.min(1, Math.max(0, progress)) - 0.5) * 96;
      layer.style.transform = `translate3d(0, ${offset}px, 0)`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [paused]);

  return (
    <div
      className={`mountain-backdrop${hero ? " mountain-backdrop--hero" : ""}`}
      aria-hidden="true"
    >
      <div ref={layerRef} className="mountain-backdrop-image">
        <Image
          src="/images/mountains-hero.jpg"
          alt=""
          fill
          sizes="100vw"
          preload={hero}
        />
      </div>
      <div className="mountain-backdrop-shade" />
    </div>
  );
}
