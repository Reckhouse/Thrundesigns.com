import { ModuleShell } from "@/components/project/module-shell";
import type { ProjectCreditsModule } from "@/types/project-modules";

export function CreditsModule({ module }: { module: ProjectCreditsModule }) {
  const items = (module.items || []).filter((item) => item?.role && item?.name);
  if (!items.length) return null;

  return (
    <ModuleShell>
      <h2 className="font-mono text-label uppercase tracking-[0.16em] text-gold">
        Credits
      </h2>
      <dl className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <div key={item._key || `${item.role}-${index}`}>
            <dt className="font-mono text-label uppercase tracking-[0.14em] text-fg-muted">
              {item.role}
            </dt>
            <dd className="mt-2 font-sans text-body text-fg">{item.name}</dd>
          </div>
        ))}
      </dl>
    </ModuleShell>
  );
}
