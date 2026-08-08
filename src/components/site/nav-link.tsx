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
 * Editorial nav link: label warms to brand gold on hover.
 * Respects reduced motion.
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
        "group relative inline-flex items-center font-mono font-medium uppercase text-fg",
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
    </Link>
  );
}
