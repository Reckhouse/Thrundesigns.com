import { SectionHeading } from "@/components/site/primitives";
import { ModuleShell } from "@/components/project/module-shell";
import { ProjectPortableText } from "@/components/project/portable-text";
import type { ProjectRichTextModule } from "@/types/project-modules";

export function RichTextModule({ module }: { module: ProjectRichTextModule }) {
  if (!module.body?.length) return null;
  return (
    <ModuleShell>
      <div className="mx-auto max-w-3xl">
        {module.heading ? (
          <SectionHeading className="mb-8 text-[clamp(1.5rem,3vw,2.25rem)]">
            {module.heading}
          </SectionHeading>
        ) : null}
        <ProjectPortableText value={module.body} />
      </div>
    </ModuleShell>
  );
}
