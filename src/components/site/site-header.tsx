"use client";
import { useHydratedReducedMotion as useReducedMotion } from "@/lib/use-hydrated-reduced-motion";

import Link from "next/link";
import { stegaClean } from "@sanity/client/stega";
import { ArrowUpRight } from "lucide-react";
import { BrandLogo } from "@/components/icons/brand-logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Magnetic } from "@/components/site/magnetic";
import { NavLink } from "@/components/site/nav-link";
import { cn } from "@/lib/utils";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";

const defaultNav = [
  { label: "Services", href: "/services/brand-identity" },
  { label: "Work", href: "/work" },
  { label: "Process", href: "/#process" },
  { label: "About", href: "/about" },
];

type SiteHeaderProps = {
  nav?: { label?: string | null; href?: string | null }[] | null;
};

export function SiteHeader({ nav }: SiteHeaderProps) {
  const items = (nav?.length ? nav : defaultNav)
    .map((item) => ({
      label: item?.label ? stegaClean(item.label) : "",
      href: item?.href ? stegaClean(item.href) : "",
    }))
    .filter((item): item is { label: string; href: string } =>
      Boolean(item.label && item.href),
    );
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useMotionValueEvent(scrollY, "change", (value) => {
    setSolid(value > 48);
  });

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-500",
        solid
          ? "border-line bg-bg-deep/85 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[120px] w-full max-w-[1440px] items-center justify-between px-5 md:h-[136px] md:px-10 lg:h-[152px] lg:px-[74px]">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="/"
            className="inline-flex shrink-0 items-center overflow-hidden"
            aria-label="Thrun Design Co. home"
          >
            <BrandLogo className="h-24 w-auto md:h-[112px] lg:h-[128px]" />
          </Link>
        </motion.div>

        <nav
          className="hidden items-center gap-11 lg:flex xl:gap-14"
          aria-label="Primary"
          onMouseLeave={() => setHovered(null)}
        >
          {items.map((item, index) => {
            const dimmed = hovered !== null && hovered !== item.href && !reduce;
            return (
              <motion.div
                key={item.href}
                initial={reduce ? false : { opacity: 0, y: -8 }}
                animate={{ opacity: dimmed ? 0.35 : 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: hovered === null ? 0.08 + index * 0.05 : 0,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onMouseEnter={() => setHovered(item.href)}
                onFocus={() => setHovered(item.href)}
                onBlur={() => setHovered(null)}
              >
                <NavLink href={item.href}>{item.label}</NavLink>
              </motion.div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Magnetic strength={0.2}>
            <Button
              asChild
              className="group relative inline-flex h-12 overflow-hidden rounded-none bg-gold px-3.5 font-mono text-label font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-bronze hover:text-fg focus-visible:ring-2 focus-visible:ring-gold sm:h-[52px] sm:px-5 sm:text-xs"
            >
              <Link href="/quote">
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,rgba(244,241,233,0.28),transparent)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-full"
                />
                <span className="relative z-10 inline-flex items-center gap-2">
                  <span className="sm:hidden">Quote</span>
                  <span className="hidden sm:inline">Request a quote</span>
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </span>
              </Link>
            </Button>
          </Magnetic>

          <Sheet>
            <SheetTrigger
              className={cn(
                "inline-flex h-12 items-center justify-center border border-line px-3 font-mono text-xs uppercase tracking-[0.14em] text-fg transition-colors hover:border-gold hover:text-gold sm:px-4 lg:hidden",
              )}
            >
              Menu
            </SheetTrigger>
            <SheetContent
              side="right"
              className="border-line bg-bg-raised text-fg sm:max-w-sm"
            >
              <SheetHeader>
                <SheetTitle className="font-display text-left text-fg">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-6" aria-label="Mobile">
                {items.map((item) => (
                  <NavLink key={item.href} href={item.href} size="sheet">
                    {item.label}
                  </NavLink>
                ))}
                <Link
                  href="/quote"
                  className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 bg-gold px-4 py-3 font-mono text-xs uppercase tracking-[0.12em] text-ink hover:bg-bronze hover:text-fg"
                >
                  Request a quote
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
