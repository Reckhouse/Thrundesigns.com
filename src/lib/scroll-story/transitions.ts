import gsap from "gsap";
import type { ScrollStoryTransition } from "@/lib/scroll-story/tokens";
import { scrollStoryTokens } from "@/lib/scroll-story/tokens";

type Vars = gsap.TweenVars;

export type TransitionFrames = {
  enterFrom: Vars;
  enterTo: Vars;
  exitTo: Vars;
};

/** Clip / transform frames for scrubbed plate handoffs. */
export function getTransitionFrames(
  transition: ScrollStoryTransition,
): TransitionFrames {
  switch (transition) {
    case "wipe-left":
      return {
        enterFrom: { clipPath: "inset(0% 0% 0% 100%)", opacity: 1 },
        enterTo: { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 },
        exitTo: { clipPath: "inset(0% 100% 0% 0%)", opacity: 1 },
      };
    case "scale":
      return {
        enterFrom: { scale: 0.94, opacity: 0.35 },
        enterTo: { scale: 1, opacity: 1 },
        exitTo: { scale: 1.04, opacity: 0 },
      };
    case "clip-morph":
      return {
        enterFrom: { clipPath: "inset(18% 12% 18% 12%)", opacity: 0.55 },
        enterTo: { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 },
        exitTo: { clipPath: "inset(22% 16% 22% 16%)", opacity: 0 },
      };
    case "rise":
      return {
        enterFrom: { yPercent: 14, opacity: 0.4 },
        enterTo: { yPercent: 0, opacity: 1 },
        exitTo: { yPercent: -10, opacity: 0 },
      };
    case "wipe-up":
    default:
      return {
        enterFrom: { clipPath: "inset(100% 0% 0% 0%)", opacity: 1 },
        enterTo: { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 },
        exitTo: { clipPath: "inset(0% 0% 100% 0%)", opacity: 1 },
      };
  }
}

export function setEnterState(
  target: gsap.TweenTarget,
  transition: ScrollStoryTransition,
) {
  const { enterFrom } = getTransitionFrames(transition);
  gsap.set(target, { ...enterFrom, force3D: true });
}

/** Append enter tween; duration is relative timeline units (scrub maps progress). */
export function applyEnter(
  tl: gsap.core.Timeline,
  target: gsap.TweenTarget,
  transition: ScrollStoryTransition,
  position: number | string = 0,
) {
  const { enterTo } = getTransitionFrames(transition);
  const duration = scrollStoryTokens.enterEnd;
  tl.to(target, { ...enterTo, duration, force3D: true }, position);
}

export function applyExit(
  tl: gsap.core.Timeline,
  target: gsap.TweenTarget,
  transition: ScrollStoryTransition,
  position: number | string,
) {
  const { exitTo } = getTransitionFrames(transition);
  const duration = 1 - scrollStoryTokens.exitStart;
  tl.to(target, { ...exitTo, duration, force3D: true }, position);
}
