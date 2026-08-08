import {
  Eyebrow,
  SecondaryButtonLink,
  SectionHeading,
} from "@/components/site/primitives";
import { ModuleShell } from "@/components/project/module-shell";
import type { ProjectCtaModule } from "@/types/project-modules";

export function CtaModule({ module }: { module: ProjectCtaModule }) {
  if (!module.label || !module.href) return null;

  return (
    <ModuleShell className="bg-bg-raised/40">
      <div className="mx-auto flex max-w-2xl flex-col items-start">
        {module.eyebrow ? <Eyebrow>{module.eyebrow}</Eyebrow> : null}
        {module.heading ? (
          <SectionHeading className="mt-4 text-[clamp(1.5rem,3vw,2.25rem)]">
            {module.heading}
          </SectionHeading>
        ) : null}
        <SecondaryButtonLink
          href={module.href}
          className={module.heading || module.eyebrow ? "mt-8" : undefined}
        >
          {module.label}
        </SecondaryButtonLink>
      </div>
    </ModuleShell>
  );
}
