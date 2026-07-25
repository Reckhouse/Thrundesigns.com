import { SectionHeading } from "@/components/site/primitives";

type WhySectionProps = {
  heading?: string | null;
  bullets?: string[] | null;
  credibilityHeading?: string | null;
  proofPoints?: { num?: string | null; label?: string | null }[] | null;
};

export function WhySection({
  heading,
  bullets,
  credibilityHeading,
  proofPoints,
}: WhySectionProps) {
  const list =
    bullets?.length
      ? bullets
      : [
          "Systems that stay coherent as you grow",
          "Brand architecture that works across channels",
          "Careful craft without decorative excess",
          "Steady pace from discovery through launch",
        ];

  const deliverables =
    proofPoints?.length
      ? proofPoints
      : [
          {
            num: "01",
            label: "Identity systems and guidelines your team can actually use",
          },
          {
            num: "02",
            label:
              "Websites designed for clarity and conversion — then maintained",
          },
          {
            num: "03",
            label: "Marketing audits that show what’s working and what isn’t",
          },
          {
            num: "04",
            label: "Print and digital assets that speak in one voice",
          },
        ];

  return (
    <section id="about" className="border-b border-line">
      <div className="mx-auto grid w-full max-w-[1440px] gap-4 px-5 py-12 md:gap-6 md:px-10 md:py-16 lg:grid-cols-2 lg:gap-8 lg:px-[74px] lg:py-20">
        <div className="border border-line bg-bg-raised p-6 md:p-8 lg:p-9">
          <SectionHeading className="max-w-md text-balance text-[28px] leading-9 md:text-[34px] md:leading-[42px] lg:text-[42px] lg:leading-[46px]">
            {heading || "A partner when the stakes feel real."}
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
          <h3 className="text-balance font-display text-[28px] leading-9 text-ink md:text-[34px] md:leading-[42px]">
            {credibilityHeading || "What you get when we work together."}
          </h3>
          <ul className="mt-10 space-y-5 md:mt-16 md:space-y-6">
            {deliverables.map((item) => (
              <li key={`${item.num}-${item.label}`} className="flex gap-5">
                <span className="font-mono text-[12px] text-bronze" aria-hidden>
                  {item.num}
                </span>
                <p className="font-sans text-[15px] leading-6 text-ink/85">
                  {item.label}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
