import { cn } from "@/lib/utils";

type ModuleShellProps = {
  children: React.ReactNode;
  className?: string;
  /** Constrain inner content to the site max width. Default true. */
  contained?: boolean;
};

export function ModuleShell({
  children,
  className,
  contained = true,
}: ModuleShellProps) {
  return (
    <section className={cn("border-b border-line", className)}>
      {contained ? (
        <div className="mx-auto w-full max-w-[1440px] px-6 py-14 md:px-10 md:py-16 lg:px-[74px] lg:py-20">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
}
