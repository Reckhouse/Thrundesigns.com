import { TextLink } from "@/components/site/primitives";
type ProcessSectionProps = {
  heading?: string | null;
  steps: {
    _id: string;
    number?: string | null;
    title?: string | null;
    copy?: string | null;
  }[];
};
export function ProcessSection({ heading, steps }: ProcessSectionProps) {
  return (
    <section id="process" className="editorial-ivory">
      <div className="editorial-container editorial-section editorial-process">
        <div>
          <h2 className="editorial-heading">
            {heading || "How a project runs, from brief to handoff."}
          </h2>
          <div className="mt-6">
            <TextLink href="/quote">Start with a quote</TextLink>
          </div>
        </div>
        <ol className="editorial-process-steps">
          {steps.map((step, index) => (
            <li key={step._id}>
              <span className="editorial-step-number" aria-hidden>
                {step.number || String(index + 1).padStart(2, "0")}
              </span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
