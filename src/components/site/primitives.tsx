"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Magnetic } from "@/components/site/magnetic";
import { useReducedMotion } from "framer-motion";

type EyebrowProps = {
  children: React.ReactNode;
  className?: string;
};

export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <p
      className={cn(
        "font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-gold",
        className,
      )}
    >
      {children}
    </p>
  );
}

type SectionHeadingProps = {
  children: React.ReactNode;
  className?: string;
};

export function SectionHeading({ children, className }: SectionHeadingProps) {
  return (
    <h2
      className={cn(
        "text-balance font-display text-[30px] leading-10 tracking-[-0.02em] text-fg md:text-[34px] md:leading-[46px] lg:text-[56px] lg:leading-[70px]",
        className,
      )}
    >
      {children}
    </h2>
  );
}

type TextLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function TextLink({ href, children, className }: TextLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-fg transition-colors hover:text-gold",
        className,
      )}
    >
      {children}
      <ArrowUpRight
        className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden
      />
    </Link>
  );
}

type PrimaryButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function PrimaryButtonLink({
  href,
  children,
  className,
}: PrimaryButtonLinkProps) {
  const reduce = useReducedMotion();

  const link = (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex h-[52px] items-center gap-2 overflow-hidden bg-gold px-[18px] font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-bronze hover:text-fg",
        className,
      )}
    >
      {!reduce ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,rgba(243,241,235,0.28),transparent)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-full"
        />
      ) : null}
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
        <ArrowUpRight className="size-3.5" aria-hidden />
      </span>
    </Link>
  );

  return <Magnetic strength={0.22}>{link}</Magnetic>;
}

export function SectionRule({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-line", className)} aria-hidden />;
}

export function PrecisionMark({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none relative size-[76px]", className)}
      aria-hidden
    >
      <div className="absolute inset-0 rounded-full border border-gold/70" />
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gold/70" />
      <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gold/70" />
    </div>
  );
}
