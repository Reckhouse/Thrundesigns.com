import {
  Eyebrow,
  SectionHeading,
} from "@/components/site/primitives";

type Step = {
  _id: string;
  number?: string | null;
  title?: string | null;
  copy?: string | null;
};

type ProcessSectionProps = {
  eyebrow?: string | null;
  heading?: string | null;
  steps: Step[];
};

export function ProcessSection({
  eyebrow,
  heading,
  steps,
}: ProcessSectionProps) {
  return (
    <section id="process" className="border-b border-line">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-12 md:px-10 md:py-16 lg:px-[74px] lg:py-20">
        <div className="max-w-xl">
          <Eyebrow>{eyebrow || "Process"}</Eyebrow>
          <SectionHeading className="mt-4">
            {heading || "A clear path from brief to brand."}
          </SectionHeading>
        </div>

        <div className="relative mt-10 grid gap-8 sm:grid-cols-2 md:mt-14 md:gap-10 md:grid-cols-3 lg:grid-cols-5">
          <div
            className="pointer-events-none absolute left-0 right-0 top-[26px] hidden h-px bg-line lg:block"
            aria-hidden
          />
          {steps.map((step) => (
            <article key={step._id} className="relative">
              <div className="flex size-[52px] items-center justify-center rounded-full border border-gold bg-bg font-mono text-[12px] text-gold">
                {step.number}
              </div>
              <h3 className="mt-5 font-display text-xl text-fg md:mt-6">{step.title}</h3>
              <p className="mt-3 font-sans text-sm leading-6 text-fg-muted">
                {step.copy}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
