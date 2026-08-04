import type { Metadata } from "next";
import { LivingEngravingCaptureClient } from "./capture-client";

export const metadata: Metadata = {
  title: "Living Engraving capture",
  robots: { index: false, follow: false },
};

export default function LivingEngravingCapturePage() {
  return <LivingEngravingCaptureClient />;
}
