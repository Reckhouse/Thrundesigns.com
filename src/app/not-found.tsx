import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you’re looking for doesn’t exist or has moved.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-gold">
        404
      </p>
      <h1 className="mt-4 max-w-[16ch] text-balance font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.08] tracking-[-0.02em] text-fg">
        Page not found
      </h1>
      <p className="mt-5 max-w-[42ch] text-pretty font-sans text-[15px] leading-7 text-fg-muted">
        That route isn’t on this site. Head home or browse the work index.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold transition-colors hover:text-fg"
        >
          Home
        </Link>
        <Link
          href="/work"
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted transition-colors hover:text-gold"
        >
          Work
        </Link>
      </div>
    </main>
  );
}
