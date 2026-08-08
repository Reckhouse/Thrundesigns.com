import type { Metadata } from "next";
import Link from "next/link";
import { LabExperienceClient } from "@/app/lab/living-engraving/lab-experience-client";
import { parseLivingEngravingLabConfig } from "@/experiences/living-engraving/parseLabSearchParams";
import { livingEngravingManifest } from "@thrun-design/living-engraving/manifest";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Living Engraving",
  description:
    "Interactive horse-head particle cameo — the Living Engraving Three.js experience from Thrun Design Co.",
  robots: {
    index: true,
    follow: true,
  },
};

export default async function LivingEngravingLabPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const parsed = parseLivingEngravingLabConfig({
    mode: params.mode,
    preset: params.preset,
    quality: params.quality,
    from: params.from,
    controls: params.controls,
  });

  return (
    <div className="flex min-h-full flex-col bg-bg-deep text-fg">
      <header className="sticky top-0 z-20 border-b border-line bg-bg-deep/90 backdrop-blur-sm">
        <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between gap-4 px-6 md:px-10 lg:px-[74px]">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
              Lab
            </p>
            <h1 className="truncate font-display text-[1.15rem] leading-tight tracking-[-0.02em]">
              {livingEngravingManifest.title}
            </h1>
          </div>
          <nav className="flex shrink-0 items-center gap-5">
            <Link
              href={parsed.ok ? parsed.value.returnHref : "/work"}
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted transition-colors hover:text-gold"
            >
              ← Case study
            </Link>
            <Link
              href="/"
              className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted transition-colors hover:text-gold sm:inline"
            >
              Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {parsed.ok ? (
          <LabExperienceClient configuration={parsed.value.configuration} />
        ) : (
          <div
            role="alert"
            className="mx-auto flex min-h-[60vh] w-full max-w-[720px] flex-col items-start justify-center gap-4 px-6 py-16"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
              Invalid lab configuration
            </p>
            <p className="font-sans text-[15px] leading-7 text-fg">
              {parsed.message}
            </p>
            <Link
              href="/work"
              className="inline-flex h-[52px] items-center border border-gold/65 bg-transparent px-[18px] font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-fg transition-colors hover:border-gold hover:bg-gold/10 hover:text-gold"
            >
              Back to work
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
