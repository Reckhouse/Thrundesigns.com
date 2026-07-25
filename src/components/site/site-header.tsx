import Link from "next/link";
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
import { cn } from "@/lib/utils";

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
  const items = (nav?.length ? nav : defaultNav).filter(
    (item): item is { label: string; href: string } =>
      Boolean(item?.label && item?.href),
  );

  return (
    <header className="absolute inset-x-0 top-0 z-40 border-b border-line">
      <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between px-5 md:h-[84px] md:px-10 lg:px-[74px]">
        <Link href="/" className="shrink-0" aria-label="Thrun Design Co. home">
          <BrandLogo className="w-14 md:w-[84px]" />
        </Link>

        <nav className="hidden items-center gap-10 lg:flex" aria-label="Primary">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-fg transition-colors hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            asChild
            className="inline-flex h-11 rounded-none bg-gold px-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink hover:bg-bronze hover:text-fg sm:h-12 sm:px-4 sm:text-[11px]"
          >
            <Link href="/quote">
              <span className="sm:hidden">Quote</span>
              <span className="hidden sm:inline">Request a quote</span>
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger
              className={cn(
                "inline-flex h-11 items-center justify-center border border-line px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-fg sm:px-4 lg:hidden",
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
                  Navigate
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-5" aria-label="Mobile">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="font-mono text-sm uppercase tracking-[0.14em] text-fg"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/quote"
                  className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 bg-gold px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink"
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
