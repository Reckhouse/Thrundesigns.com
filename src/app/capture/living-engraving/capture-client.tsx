"use client";

import { HorseParticles } from "@thrun-design/living-engraving/horse-particles";

/**
 * Capture-only client surface for high-quality Living Engraving posters.
 * Uses preserveDrawingBuffer so canvas.toDataURL works after paint.
 */
export function LivingEngravingCaptureClient() {
  return (
    <main
      data-capture-root
      style={{
        margin: 0,
        width: "100vw",
        height: "100vh",
        background: "#0c0d0c",
        overflow: "hidden",
      }}
    >
      <HorseParticles
        layout="centered"
        staticMode
        preserveDrawingBuffer
        posterCapture
        assetBaseUrl="/experiences/living-engraving"
      />
    </main>
  );
}
