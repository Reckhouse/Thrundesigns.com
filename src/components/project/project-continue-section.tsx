import Image from "next/image";
import Link from "next/link";
import {
  Eyebrow,
  PrimaryButtonLink,
  SectionHeading,
  TextLink,
} from "@/components/site/primitives";
import type { RelatedProjectCard } from "@/lib/related-projects";
import type { ServiceDefinition } from "@/lib/services";
import { quoteHrefForProjectType } from "@/lib/quote/project-type";

type ProjectContinueSectionProps = {
  service: ServiceDefinition;
  related: RelatedProjectCard[];
};

/** Internal links + CTA for case studies (service, related work, next step). */
export function ProjectContinueSection({
  service,
  related,
}: ProjectContinueSectionProps) {
  return (
    <section className="border-t border-line bg-bg-deep">
      <div className="mx-auto grid w-full max-w-[1440px] gap-14 px-6 py-16 md:px-10 md:py-20 lg:gap-16 lg:px-[74px] lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-end lg:gap-16">
          <div>
            <Eyebrow>Continue</Eyebrow>
            <SectionHeading className="mt-4 max-w-[18ch]">
              Related work and next steps.
            </SectionHeading>
            <p className="mt-5 max-w-[42ch] text-pretty font-sans text-body leading-7 text-fg-muted">
              This study sits in our {service.shortTitle.toLowerCase()} practice.
              Browse a related concept, read how the service runs, or start a
              scoped conversation.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 lg:justify-end">
            <PrimaryButtonLink href={quoteHrefForProjectType(service.quoteType)}>
              {service.ctaLabel}
            </PrimaryButtonLink>
            <TextLink href={`/services/${service.slug}`}>
              {service.shortTitle} service
            </TextLink>
          </div>
        </div>

        <div className="grid gap-10 border-t border-line pt-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] lg:gap-16 lg:pt-14">
          <div>
            <p className="font-mono text-label uppercase tracking-[0.16em] text-gold">
              Service
            </p>
            <h3 className="mt-4 font-display text-[clamp(1.5rem,2.4vw,2rem)] leading-tight tracking-[-0.02em] text-fg">
              {service.title}
            </h3>
            <p className="mt-4 max-w-[36ch] text-pretty font-sans text-body leading-7 text-fg-muted">
              {service.description}
            </p>
            <div className="mt-6 flex flex-col items-start gap-4">
              <TextLink href={`/services/${service.slug}`}>
                Explore {service.shortTitle.toLowerCase()}
              </TextLink>
              <TextLink href="/work">All concept studies</TextLink>
            </div>
          </div>

          <div>
            <p className="font-mono text-label uppercase tracking-[0.16em] text-gold">
              Related studies
            </p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {related.map((project) => (
                <li key={project.slug}>
                  <Link
                    href={`/work/${project.slug}`}
                    className="group flex h-full flex-col overflow-hidden border border-line bg-bg-raised/80 transition-[border-color,background-color] hover:border-gold/55 hover:bg-surface"
                  >
                    <div className="relative aspect-[16/10] w-full bg-bg-deep">
                      {project.imageSrc ? (
                        <Image
                          src={project.imageSrc}
                          alt={project.imageAlt || project.title}
                          fill
                          className="object-cover grayscale transition duration-500 group-hover:grayscale-0"
                          sizes="(max-width: 640px) 100vw, 320px"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <p className="font-mono text-caption uppercase tracking-[0.14em] text-gold">
                        {project.industry || "Concept study"}
                      </p>
                      <p className="font-display text-xl leading-tight text-fg">
                        {project.title}
                      </p>
                      <p className="text-sm leading-6 text-fg-muted">
                        {project.summary}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
