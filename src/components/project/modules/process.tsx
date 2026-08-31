import { SectionHeading } from "@/components/site/primitives";
import { ModuleShell } from "@/components/project/module-shell";
import type { ProjectProcessModule } from "@/types/project-modules";

export function ProcessModule({ module }: { module: ProjectProcessModule }) {
  const steps = (module.steps || []).filter((step) => step?.title && step?.body);
  if (!steps.length) return null;

  return (
    <ModuleShell>
      {module.heading ? (
        <SectionHeading className="mb-10 max-w-2xl text-[clamp(1.5rem,3vw,2.25rem)]">
          {module.heading}
        </SectionHeading>
      ) : null}
      <ol className="grid gap-0 border-t border-line">
        {steps.map((step, index) => (
          <li
            key={step._key || `${step.title}-${index}`}
            className="grid gap-4 border-b border-line py-8 md:grid-cols-[120px_1fr] md:gap-10"
          >
            <span className="font-mono text-label uppercase tracking-[0.16em] text-gold">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="font-display text-xl tracking-[-0.01em] text-fg md:text-2xl">
                {step.title}
              </h3>
              <p className="mt-3 max-w-2xl font-sans text-body leading-7 text-fg-muted">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </ModuleShell>
  );
}
