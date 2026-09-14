"use client";

import { useSyncExternalStore } from "react";
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";

const key = "thrun-animations-paused";
let memoryPaused = false;
function snapshot() {
  try {
    return sessionStorage.getItem(key) === "true" || memoryPaused;
  } catch {
    return memoryPaused;
  }
}
function subscribe(listener: () => void) {
  window.addEventListener("thrun-motion", listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener("thrun-motion", listener);
    window.removeEventListener("storage", listener);
  };
}
export function useMotionPreference() {
  const userPaused = useSyncExternalStore(subscribe, snapshot, () => false);
  const reduced = useHydratedReducedMotion();
  return { paused: userPaused || reduced, userPaused, reduced };
}
export function MotionToggle() {
  const { userPaused, reduced } = useMotionPreference();
  return (
    <button
      type="button"
      className="art-control"
      aria-pressed={userPaused || reduced}
      disabled={reduced}
      onClick={() => {
        memoryPaused = !userPaused;
        try {
          sessionStorage.setItem(key, String(memoryPaused));
        } catch {
          /* Session-only fallback. */
        }
        window.dispatchEvent(new Event("thrun-motion"));
      }}
    >
      {reduced
        ? "Reduced motion enabled"
        : userPaused
          ? "Resume animations"
          : "Pause animations"}
    </button>
  );
}
