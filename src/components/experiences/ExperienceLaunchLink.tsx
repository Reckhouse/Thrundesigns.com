"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { trackExperienceEvent } from "@/experiences/analytics";
import { cn } from "@/lib/utils";

type ExperienceLaunchLinkProps = {
  href: string;
  experienceKey: string;
  children: React.ReactNode;
  className?: string;
  /** `button` = outline secondary CTA; `text` = quiet text link. */
  variant?: "button" | "text" | "primary";
};

/**
 * Client link so fullscreen launches can emit a privacy-safe analytics event.
 * Lab launches use the secondary outline style — gold fill stays reserved for
 * the header quote CTA.
 */
export function ExperienceLaunchLink({
  href,
  experienceKey,
  children,
  className,
  variant = "button",
}: ExperienceLaunchLinkProps) {
  const resolved = variant === "primary" ? "button" : variant;

  return (
    <Link
      href={href}
      onClick={() =>
        trackExperienceEvent("fullscreen_launch_selected", { experienceKey })
      }
      className={cn(
        resolved === "button"
          ? "group inline-flex h-[52px] items-center gap-2 border border-gold/65 bg-transparent px-[18px] font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-fg transition-colors hover:border-gold hover:bg-gold/10 hover:text-gold"
          : "font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted transition-colors hover:text-gold",
        className,
      )}
    >
      {resolved === "button" ? (
        <span className="inline-flex items-center gap-2">
          {children}
          <ArrowUpRight
            className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </span>
      ) : (
        children
      )}
    </Link>
  );
}
