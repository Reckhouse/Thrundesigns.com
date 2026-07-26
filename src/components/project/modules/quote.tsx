import { ModuleShell } from "@/components/project/module-shell";
import type { ProjectQuoteModule } from "@/types/project-modules";

export function QuoteModule({ module }: { module: ProjectQuoteModule }) {
  if (!module.quote) return null;

  return (
    <ModuleShell>
      <figure className="mx-auto max-w-3xl">
        <blockquote className="font-display text-[clamp(1.5rem,3.2vw,2.5rem)] leading-[1.2] tracking-[-0.02em] text-fg">
          “{module.quote}”
        </blockquote>
        {module.attribution || module.role ? (
          <figcaption className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted">
            {[module.attribution, module.role].filter(Boolean).join(" · ")}
          </figcaption>
        ) : null}
      </figure>
    </ModuleShell>
  );
}
