import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import Link from "next/link";
import { LabExperienceClient } from "@/app/lab/counterspace/lab-experience-client";
import { parseCounterspaceLabConfig } from "@/experiences/counterspace/parseLabSearchParams";
import { counterspaceManifest } from "@thrun-design/counterspace/manifest";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = buildPageMetadata({
  title: "Counterspace Field Laboratory",
  description:
    "Interactive speculative geometry sandbox — signed emitters, four vector-field operators, and inspectable equilibrium from Thrun Design Co.",
  path: "/lab/counterspace",
  noIndex: true,
});

export const revalidate = 300;

export default async function CounterspaceLabPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const parsed = parseCounterspaceLabConfig({
    mode: params.mode,
    preset: params.preset,
    quality: params.quality,
    from: params.from,
    controls: params.controls,
  });

  return (
    <div className="flex min-h-full flex-col bg-[#f9f6ef] text-[#1b1a18]">
      <header className="sticky top-0 z-20 border-b border-[#1b1a18]/28 bg-[#f9f6ef]/92 backdrop-blur-sm">
        <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between gap-4 px-6 md:px-10 lg:px-[74px]">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#1146db]">
              Lab
            </p>
            <h1 className="truncate font-display text-[1.15rem] leading-tight tracking-[-0.02em]">
              {counterspaceManifest.title}
            </h1>
          </div>
          <nav className="flex shrink-0 items-center gap-5">
            <Link
              href={parsed.ok ? parsed.value.returnHref : "/work"}
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#68655f] transition-colors hover:text-[#1b1a18]"
            >
              ← Case study
            </Link>
            <Link
              href="/"
              className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-[#68655f] transition-colors hover:text-[#1b1a18] sm:inline"
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
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#1146db]">
              Invalid lab configuration
            </p>
            <p className="font-sans text-[15px] leading-7 text-[#1b1a18]">
              {parsed.message}
            </p>
            <Link
              href="/work"
              className="inline-flex h-[52px] items-center bg-[#1b1a18] px-[18px] font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#f9f6ef] transition-opacity hover:opacity-90"
            >
              Back to work
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
