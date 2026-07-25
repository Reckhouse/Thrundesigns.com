import {
  Eyebrow,
  PrecisionMark,
  SectionHeading,
} from "@/components/site/primitives";

type WhySectionProps = {
  eyebrow?: string | null;
  heading?: string | null;
  bullets?: string[] | null;
  credibilityEyebrow?: string | null;
  credibilityHeading?: string | null;
  proofPoints?: { num?: string | null; label?: string | null }[] | null;
};

export function WhySection({
  eyebrow,
  heading,
  bullets,
  credibilityEyebrow,
  credibilityHeading,
  proofPoints,
}: WhySectionProps) {
  const list =
    bullets?.length
      ? bullets
      : [
          "Editorial systems with operational clarity",
          "Brand architecture that scales across channels",
          "Precision craft without decorative excess",
          "Partner pace from discovery through launch",
        ];

  const proofs =
    proofPoints?.length
      ? proofPoints
      : [
          { num: "01", label: "Identity systems with durable guidelines" },
          { num: "02", label: "Web experiences built for conversion" },
          { num: "03", label: "Print and marketing with consistent voice" },
          { num: "04", label: "Clear process and accountable delivery" },
        ];

  return (
    <section id="about" className="border-b border-line">
      <div className="mx-auto grid w-full max-w-[1440px] gap-4 px-5 py-12 md:gap-6 md:px-10 md:py-16 lg:grid-cols-2 lg:gap-8 lg:px-[74px] lg:py-20">
        <div className="relative border border-line bg-bg-raised p-6 md:p-8 lg:p-9">
          <PrecisionMark className="absolute right-6 top-6 hidden size-[56px] md:right-8 md:top-8 md:block lg:size-[70px]" />
          <Eyebrow>{eyebrow || "Why Thrun"}</Eyebrow>
          <SectionHeading className="mt-5 max-w-md text-[28px] leading-9 md:text-[34px] md:leading-[42px] lg:text-[42px] lg:leading-[46px]">
            {heading || "Design with consequence."}
          </SectionHeading>
          <ul className="mt-10 space-y-5 md:mt-12 md:space-y-6">
            {list.map((item) => (
              <li key={item} className="flex items-start gap-4">
                <span className="mt-2 size-1.5 shrink-0 bg-gold" aria-hidden />
                <p className="font-sans text-[15px] leading-6 text-fg">{item}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-line bg-contrast p-6 text-ink md:p-8 lg:p-9">
          <Eyebrow className="text-bronze">
            {credibilityEyebrow || "Proof of craft"}
          </Eyebrow>
          <h3 className="mt-5 font-display text-[28px] leading-9 text-ink md:text-[34px] md:leading-[42px]">
            {credibilityHeading || "Built for teams that need signal, not noise."}
          </h3>
          <ul className="mt-10 space-y-5 md:mt-16 md:space-y-6">
            {proofs.map((proof) => (
              <li key={`${proof.num}-${proof.label}`} className="flex gap-5">
                <span className="font-mono text-[12px] text-bronze">
                  {proof.num}
                </span>
                <p className="font-sans text-[15px] leading-6 text-ink/80">
                  {proof.label}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
