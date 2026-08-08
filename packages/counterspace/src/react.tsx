"use client";

import { useEffect, useRef } from "react";
import "@fontsource-variable/onest";
import "./styles.css";
import { counterspaceManifest } from "./manifest";
import type { CounterspaceEmbedConfig } from "./schemas";
import {
  createLaboratoryApp,
  type LaboratoryAppHandle,
} from "./ui/app-shell";
import type { ChamberPreset } from "./scene";

export type CounterspaceExperienceProps = {
  configuration?: CounterspaceEmbedConfig;
};

function isChamberPreset(value: string | undefined): value is ChamberPreset {
  return (
    value === "twin-orbit" ||
    value === "pressure-vessel" ||
    value === "axial-rotor"
  );
}

/**
 * Mounts the vanilla Counterspace Field Laboratory into a React host.
 * Dispose tears down WebGL, timers, and window listeners on unmount.
 */
export function CounterspaceExperience({
  configuration,
}: CounterspaceExperienceProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const height = configuration?.height ?? counterspaceManifest.defaultHeight;
  const presetKey = configuration?.initialPresetKey;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let handle: LaboratoryAppHandle | undefined;
    try {
      handle = createLaboratoryApp(host);
    } catch {
      return;
    }

    if (isChamberPreset(presetKey) && presetKey !== "twin-orbit") {
      const select = host.querySelector<HTMLSelectElement>("#preset-select");
      if (select) {
        select.value = presetKey;
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    return () => {
      handle?.dispose();
    };
  }, [presetKey]);

  return (
    <div
      className="counterspace-lab-root"
      ref={hostRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: Math.max(height, 480),
      }}
      data-experience={counterspaceManifest.experienceKey}
      data-mode={configuration?.mode}
    />
  );
}

export default CounterspaceExperience;
