import { ModuleShell } from "@/components/project/module-shell";
import type { ProjectMetricsModule } from "@/types/project-modules";

export function MetricsModule({ module }: { module: ProjectMetricsModule }) {
  const items = (module.items || []).filter(
    (item) => item?.value && item?.label,
  );
  if (!items.length) return null;

  return (
    <ModuleShell>
      <dl className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
        {items.map((item, index) => (
          <div key={item._key || `${item.label}-${index}`}>
            <dt className="font-mono text-label uppercase tracking-[0.16em] text-gold">
              {item.label}
            </dt>
            <dd className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] leading-none tracking-[-0.02em] text-fg">
              {item.value}
            </dd>
            {item.detail ? (
              <p className="mt-3 max-w-xs font-sans text-sm leading-6 text-fg-muted">
                {item.detail}
              </p>
            ) : null}
          </div>
        ))}
      </dl>
    </ModuleShell>
  );
}
