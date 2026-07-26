"use client";

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
import { cn } from "@/lib/utils";
import { motion, useReducedMotion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";

const defaultNav = [
  { label: "Services", href: "/#services" },
  { label: "Work", href: "/#work" },
  { label: "Process", href: "/#process" },
  { label: "Why Thrun", href: "/#about" },
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
    .filter(
      (item): item is { label: string; href: string } =>
        Boolean(item.label && item.href),
    );
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);

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
      <div className="mx-auto flex h-[80px] w-full max-w-[1440px] items-center justify-between px-5 md:h-[96px] md:px-10 lg:px-[74px]">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="/"
            className="inline-flex shrink-0 items-center overflow-visible"
            aria-label="Thrun Design Co. home"
          >
            <BrandLogo className="h-14 w-auto md:h-16 lg:h-[72px]" />
          </Link>
        </motion.div>

        <nav className="hidden items-center gap-10 lg:flex" aria-label="Primary">
          {items.map((item, index) => (
            <motion.div
              key={item.href}
              initial={reduce ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.08 + index * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Link
                href={item.href}
                className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-fg transition-colors hover:text-gold focus-visible:text-gold"
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Magnetic strength={0.2}>
            <Button
              asChild
              className="group relative inline-flex h-11 overflow-hidden rounded-none bg-gold px-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-bronze hover:text-fg focus-visible:ring-2 focus-visible:ring-gold sm:h-12 sm:px-4 sm:text-[11px]"
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
                "inline-flex h-11 items-center justify-center border border-line px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-fg transition-colors hover:border-gold hover:text-gold sm:px-4 lg:hidden",
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
              <nav className="mt-8 flex flex-col gap-5" aria-label="Mobile">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="font-mono text-sm uppercase tracking-[0.14em] text-fg hover:text-gold"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/quote"
                  className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 bg-gold px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink hover:bg-bronze hover:text-fg"
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
