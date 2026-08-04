"use client";

import Link from "next/link";
import { trackExperienceEvent } from "@/experiences/analytics";
import { cn } from "@/lib/utils";

type ExperienceLaunchLinkProps = {
  href: string;
  experienceKey: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "text";
};

/**
 * Client link so fullscreen launches can emit a privacy-safe analytics event.
 */
export function ExperienceLaunchLink({
  href,
  experienceKey,
  children,
  className,
  variant = "primary",
}: ExperienceLaunchLinkProps) {
  return (
    <Link
      href={href}
      onClick={() =>
        trackExperienceEvent("fullscreen_launch_selected", { experienceKey })
      }
      className={cn(
        variant === "primary"
          ? "group relative inline-flex h-[52px] items-center gap-2 overflow-hidden bg-gold px-[18px] font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-bronze hover:text-fg"
          : "font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted transition-colors hover:text-gold",
        className,
      )}
    >
      {children}
    </Link>
  );
}
