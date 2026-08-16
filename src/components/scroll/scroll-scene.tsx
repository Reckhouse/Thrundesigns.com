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

function findNextScene(root: HTMLElement): HTMLElement | null {
  const matchIn = (node: Element | null): HTMLElement | null => {
    if (!(node instanceof HTMLElement)) return null;
    if (node.hasAttribute("data-scroll-scene")) return node;
    return node.querySelector<HTMLElement>("[data-scroll-scene]");
  };

  let sibling: Element | null = root.nextElementSibling;
  while (sibling) {
    const hit = matchIn(sibling);
    if (hit) return hit;
    sibling = sibling.nextElementSibling;
  }

  // Climb wrappers (e.g. ProjectModules <div>) within the story root.
  let parent = root.parentElement;
  while (parent && !parent.hasAttribute("data-scroll-story")) {
    sibling = parent.nextElementSibling;
    while (sibling) {
      const hit = matchIn(sibling);
      if (hit) return hit;
      sibling = sibling.nextElementSibling;
    }
    parent = parent.parentElement;
  }
  return null;
}

type ScrollSceneProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  transition?: ScrollStoryTransition;
  /** Skip pin/scrub; useful for hero / footer. */
  pin?: boolean;
  /** Soft pin uses a shorter scrub span when there is no next scene. */
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
        // Unpinned scenes still scrub an enter wipe as they approach.
        if (!root || !plate || reduced || !enabled) {
          setEntered(true);
          setProgress(1);
          return;
        }
        if (!pin) {
          const frames = getTransitionFrames(transition);
          setEnterState(plate, transition);
          const enterTween = gsap.fromTo(plate, frames.enterFrom, {
            ...frames.enterTo,
            ease: scrollStoryEase,
            immediateRender: false,
            scrollTrigger: {
              trigger: root,
              start: "top 90%",
              end: "top 35%",
              scrub: true,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                setProgress(self.progress);
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
          refresh();
          return () => {
            enterTween.scrollTrigger?.kill();
            enterTween.kill();
          };
        }
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

      const nextTrigger = findNextScene(root);
      const pinSpan = getPinSpan({ soft: soft || !fillViewport });
      // Full viewport homepage plates morph out into the next beat.
      // Compact module beats stay enter-only so content never ends invisible.
      const morphExit = Boolean(nextTrigger) && fillViewport;

      const exitTl = gsap.timeline({
        defaults: { ease: scrollStoryEase },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          ...(nextTrigger && fillViewport
            ? {
                endTrigger: nextTrigger,
                end: "top top",
                pinSpacing: false,
              }
            : {
                end: `+=${pinSpan}`,
                pinSpacing: true,
              }),
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => setProgress(self.progress),
        },
      });

      if (morphExit) {
        exitTl.to({}, { duration: 0.55 });
        applyExit(exitTl, plate, transition, exitTl.duration());
      } else {
        // Hold visible through the short pin window.
        exitTl.to({}, { duration: 1 });
      }

      refresh();

      return () => {
        enterTween.scrollTrigger?.kill();
        enterTween.kill();
        exitTl.scrollTrigger?.kill();
        exitTl.kill();
      };
    },
    {
      dependencies: [active, soft, transition, refresh, fillViewport, pin, enabled, reduced],
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
