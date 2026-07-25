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
    <section className="relative border-b border-line overflow-hidden">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-10 lg:px-[74px] lg:py-24">
        <PrecisionMark className="absolute right-[74px] top-14 hidden size-[112px] lg:block" />
        <Eyebrow>{eyebrow || "Start a project"}</Eyebrow>
        <SectionHeading className="mt-5 max-w-3xl">
          {heading || "Ready when your next chapter is."}
        </SectionHeading>
        <p className="mt-8 max-w-2xl font-sans text-[15px] leading-7 text-fg-muted md:text-base">
          {copy ||
            "Tell us about the brand, the audience, and the outcome. We’ll return with a clear scope and next steps."}
        </p>
        <div className="mt-12 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <PrimaryButtonLink href={primaryCta?.href || "/quote"}>
            {primaryCta?.label || "Request a project quote"}
          </PrimaryButtonLink>
          <TextLink href={secondaryCta?.href || "/work"}>
            {secondaryCta?.label || "View selected work"}
          </TextLink>
        </div>
      </div>
    </section>
  );
}
