"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useScrollStory } from "@/components/scroll/scroll-story-root";
import { useReducedScrollStory } from "@/hooks/use-reduced-scroll-story";
import {
  applyExit,
  getTransitionFrames,
  setEnterState,
} from "@/lib/scroll-story/transitions";
import {
  getPinSpan,
  scrollStoryEase,
  type ScrollStoryTransition,
} from "@/lib/scroll-story/tokens";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

type ScrollSceneContextValue = {
  entered: boolean;
  progress: number;
};

const ScrollSceneContext = createContext<ScrollSceneContextValue | null>(null);

export function useScrollScene() {
  return useContext(ScrollSceneContext);
}

type ScrollSceneProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  transition?: ScrollStoryTransition;
  /** Skip pin/scrub; useful for hero / footer. */
  pin?: boolean;
  /** Soft pin uses a shorter scrub span. */
  soft?: boolean;
  /** When false, do not force a full viewport stage (module groups). */
  fillViewport?: boolean;
  ariaLabel?: string;
};

export function ScrollScene({
  children,
  className,
  id,
  transition = "wipe-up",
  pin = true,
  soft = false,
  fillViewport = true,
  ariaLabel,
}: ScrollSceneProps) {
  const reduced = useReducedScrollStory();
  const { enabled, registerScene, refresh } = useScrollStory();
  const rootRef = useRef<HTMLElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const active = enabled && pin && !reduced;
  const [entered, setEntered] = useState(!active);
  const [progress, setProgress] = useState(active ? 0 : 1);

  const contextValue = useMemo(
    () => ({ entered, progress }),
    [entered, progress],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;
    return registerScene(root);
  }, [enabled, registerScene]);

  useGSAP(
    () => {
      const root = rootRef.current;
      const plate = plateRef.current;
      if (!root || !plate || !active) {
        setEntered(true);
        setProgress(1);
        return;
      }

      const frames = getTransitionFrames(transition);
      setEnterState(plate, transition);

      // Approach: wipe/morph in as the section enters the viewport (over previous).
      const enterTween = gsap.fromTo(plate, frames.enterFrom, {
        ...frames.enterTo,
        ease: scrollStoryEase,
        immediateRender: false,
        scrollTrigger: {
          trigger: root,
          start: "top 92%",
          end: "top 28%",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (self.progress > 0.2) setEntered(true);
          },
          onEnter: () => setEntered(true),
          onEnterBack: () => setEntered(true),
          onLeaveBack: () => {
            setEntered(false);
            setProgress(0);
          },
        },
      });

      const pinSpan = getPinSpan({ soft });
      const exitTl = gsap.timeline({
        defaults: { ease: scrollStoryEase },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: `+=${pinSpan}`,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => setProgress(self.progress),
        },
      });

      // Hold through most of the pin, then exit into the next beat.
      exitTl.to({}, { duration: 0.62 });
      applyExit(exitTl, plate, transition, exitTl.duration());

      refresh();

      return () => {
        enterTween.scrollTrigger?.kill();
        enterTween.kill();
        exitTl.scrollTrigger?.kill();
        exitTl.kill();
      };
    },
    {
      dependencies: [active, soft, transition, refresh],
      revertOnUpdate: true,
    },
  );

  return (
    <ScrollSceneContext.Provider value={contextValue}>
      <section
        ref={rootRef}
        id={id}
        aria-label={ariaLabel}
        data-scroll-scene=""
        data-scroll-transition={transition}
        data-scroll-pin={active ? "true" : "false"}
        className={cn(
          "relative isolate",
          fillViewport && "min-h-[100svh]",
          active && "scroll-scene-pinned",
          className,
        )}
      >
        <div
          ref={plateRef}
          data-scroll-plate=""
          className={cn(
            "scroll-scene-plate relative w-full",
            fillViewport && "min-h-[100svh]",
          )}
        >
          {children}
        </div>
      </section>
    </ScrollSceneContext.Provider>
  );
}
