import { stegaClean } from "@sanity/client/stega";
import { PrimaryButtonLink, TextLink } from "@/components/site/primitives";
type FinalCtaSectionProps = {
  heading?: string | null;
  copy?: string | null;
  primaryCta?: { label?: string | null; href?: string | null } | null;
  secondaryCta?: { label?: string | null; href?: string | null } | null;
};
export function FinalCtaSection({
  heading,
  copy,
  primaryCta,
  secondaryCta,
}: FinalCtaSectionProps) {
  return (
    <section className="editorial-close">
      <div className="editorial-container editorial-section editorial-close-grid">
        <h2 className="editorial-heading">
          {heading || "Tell us where the brand needs to go next."}
        </h2>
        <div>
          <p className="editorial-intro">
            {copy ||
              "Share a short brief about your business, audience, and goal. We’ll reply within a few business days with scope options and clear next steps. No pressure, no invented promises."}
          </p>
          <div className="editorial-actions">
            <PrimaryButtonLink href={stegaClean(primaryCta?.href || "/quote")}>
              {primaryCta?.label || "Request a project quote"}
            </PrimaryButtonLink>
            <TextLink href={stegaClean(secondaryCta?.href || "/work")}>
              {secondaryCta?.label || "Browse concept studies"}
            </TextLink>
          </div>
        </div>
      </div>
    </section>
  );
}
