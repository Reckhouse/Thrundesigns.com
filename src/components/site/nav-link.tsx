"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type NavLinkProps = {
  href: string;
  children: string;
  className?: string;
  /** Larger type for desktop header; keep default for mobile sheet. */
  size?: "header" | "sheet";
};

/**
 * Editorial nav link: gold hairline draws in on hover, label lifts and
 * warms to brand gold. Respects reduced motion.
 */
export function NavLink({
  href,
  children,
  className,
  size = "header",
}: NavLinkProps) {
  const reduce = useReducedMotion();

  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex flex-col items-start font-mono font-medium uppercase text-fg",
        size === "header" &&
          "text-[12px] tracking-[0.16em] lg:text-[13px] lg:tracking-[0.17em]",
        size === "sheet" && "text-sm tracking-[0.14em]",
        className,
      )}
    >
      <motion.span
        className="relative transition-colors duration-300 group-hover:text-gold group-focus-visible:text-gold"
        whileHover={reduce ? undefined : { y: -1 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.span>
      <span
        aria-hidden
        className={cn(
          "mt-1.5 h-px w-full origin-left bg-gold",
          "scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "group-hover:scale-x-100 group-focus-visible:scale-x-100",
          reduce && "transition-none group-hover:scale-x-100",
        )}
      />
    </Link>
  );
}
