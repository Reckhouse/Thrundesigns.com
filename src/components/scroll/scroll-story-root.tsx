"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedScrollStory } from "@/hooks/use-reduced-scroll-story";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type ScrollStoryContextValue = {
  enabled: boolean;
  registerScene: (el: HTMLElement) => () => void;
  refresh: () => void;
};

const ScrollStoryContext = createContext<ScrollStoryContextValue | null>(null);

export function useScrollStory(): ScrollStoryContextValue {
  const ctx = useContext(ScrollStoryContext);
  if (!ctx) {
    return {
      enabled: false,
      registerScene: () => () => {},
      refresh: () => {},
    };
  }
  return ctx;
}

type ScrollStoryRootProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Page-level GSAP ScrollTrigger host. Registers scenes, refreshes on resize /
 * fonts / images, and tears down triggers on unmount or route change.
 */
export function ScrollStoryRoot({ children, className }: ScrollStoryRootProps) {
  const reduced = useReducedScrollStory();
  const rootRef = useRef<HTMLDivElement>(null);
  const scenesRef = useRef<HTMLElement[]>([]);

  const refresh = useCallback(() => {
    ScrollTrigger.refresh();
  }, []);

  const registerScene = useCallback((el: HTMLElement) => {
    const list = scenesRef.current;
    if (!list.includes(el)) list.push(el);
    // Keep document order.
    list.sort((a, b) => {
      const pos = a.compareDocumentPosition(b);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
    return () => {
      scenesRef.current = scenesRef.current.filter((item) => item !== el);
    };
  }, []);

  const value = useMemo(
    () => ({
      enabled: !reduced,
      registerScene,
      refresh,
    }),
    [reduced, registerScene, refresh],
  );

  useGSAP(
    () => {
      if (reduced) return;
      const onResize = () => ScrollTrigger.refresh();
      window.addEventListener("resize", onResize);
      // Fonts / late images shift pin positions.
      void document.fonts?.ready?.then(() => ScrollTrigger.refresh());
      const imgs = rootRef.current?.querySelectorAll("img") ?? [];
      imgs.forEach((img) => {
        if (!img.complete) {
          img.addEventListener("load", onResize, { once: true });
        }
      });
      const scrollToHash = () => {
        const id = window.location.hash.replace(/^#/, "");
        if (!id) {
          ScrollTrigger.refresh();
          return;
        }
        ScrollTrigger.refresh();
        requestAnimationFrame(() => {
          const el = document.getElementById(id);
          if (!el) return;
          const trigger = ScrollTrigger.getAll().find((st) => st.trigger === el);
          const y = trigger ? trigger.start : el.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: Math.max(0, y), behavior: "auto" });
        });
      };
      // Hash anchors: refresh then scroll to the scene’s pin start.
      window.addEventListener("hashchange", scrollToHash);
      if (window.location.hash) {
        window.setTimeout(scrollToHash, 160);
      }
      return () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("hashchange", scrollToHash);
      };
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  useEffect(() => {
    if (reduced) return;
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => window.clearTimeout(id);
  }, [reduced]);

  return (
    <ScrollStoryContext.Provider value={value}>
      <div
        ref={rootRef}
        className={className}
        data-scroll-story={reduced ? "static" : "active"}
      >
        {children}
      </div>
    </ScrollStoryContext.Provider>
  );
}
