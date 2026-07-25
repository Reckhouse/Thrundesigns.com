import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
        "font-display text-[30px] leading-10 text-fg md:text-[34px] md:leading-[46px] lg:text-[56px] lg:leading-[70px]",
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
        "inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-fg transition-colors hover:text-gold",
        className,
      )}
    >
      {children}
      <ArrowUpRight className="size-3.5" aria-hidden />
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
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-[52px] items-center gap-2 bg-gold px-[18px] font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-ink transition-colors hover:bg-bronze hover:text-fg",
        className,
      )}
    >
      {children}
      <ArrowUpRight className="size-3.5" aria-hidden />
    </Link>
  );
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
