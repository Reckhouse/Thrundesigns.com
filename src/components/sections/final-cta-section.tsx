import {
  Eyebrow,
  PrecisionMark,
  PrimaryButtonLink,
  SectionHeading,
  TextLink,
} from "@/components/site/primitives";

type FinalCtaSectionProps = {
  eyebrow?: string | null;
  heading?: string | null;
  copy?: string | null;
  primaryCta?: { label?: string | null; href?: string | null } | null;
  secondaryCta?: { label?: string | null; href?: string | null } | null;
};

export function FinalCtaSection({
  eyebrow,
  heading,
  copy,
  primaryCta,
  secondaryCta,
}: FinalCtaSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-12 md:px-10 md:py-16 lg:px-[74px] lg:py-24">
        <PrecisionMark className="absolute right-8 top-10 hidden size-[80px] md:right-[74px] md:top-14 md:block lg:size-[112px]" />
        <Eyebrow>{eyebrow || "Start a project"}</Eyebrow>
        <SectionHeading className="mt-5 max-w-3xl">
          {heading || "Ready when your next chapter is."}
        </SectionHeading>
        <p className="mt-6 max-w-2xl font-sans text-[15px] leading-7 text-fg-muted md:mt-8 md:text-base">
          {copy ||
            "Tell us about the brand, the audience, and the outcome. We’ll return with a clear scope and next steps."}
        </p>
        <div className="mt-8 flex flex-col items-stretch gap-4 sm:mt-12 sm:flex-row sm:items-center sm:gap-5">
          <PrimaryButtonLink
            href={primaryCta?.href || "/quote"}
            className="w-full justify-center sm:w-auto"
          >
            {primaryCta?.label || "Request a project quote"}
          </PrimaryButtonLink>
          <TextLink
            href={secondaryCta?.href || "/work"}
            className="justify-center sm:justify-start"
          >
            {secondaryCta?.label || "View selected work"}
          </TextLink>
        </div>
      </div>
    </section>
  );
}
