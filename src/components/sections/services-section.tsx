"use client";

import {
  SectionHeading,
  TextLink,
} from "@/components/site/primitives";
import {
  AuditIcon,
  BrandIcon,
  PrintIcon,
  WebIcon,
} from "@/components/icons/service-icons";
import { Reveal, Stagger, StaggerItem } from "@/components/site/reveal";

type Service = {
  _id: string;
  title?: string | null;
  icon?: string | null;
  summary?: string | null;
  linkLabel?: string | null;
};

const iconMap = {
  brand: BrandIcon,
  web: WebIcon,
  print: PrintIcon,
  audit: AuditIcon,
} as const;

type ServicesSectionProps = {
  eyebrow?: string | null;
  heading?: string | null;
  intro?: string | null;
  services: Service[];
};

export function ServicesSection({
  heading,
  intro,
  services,
}: ServicesSectionProps) {
  return (
    <section id="services" className="border-b border-line">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 py-12 md:gap-12 md:px-10 md:py-16 lg:grid-cols-[380px_1fr] lg:gap-16 lg:px-[74px] lg:py-20">
        <Reveal variant="left">
          <SectionHeading className="text-balance">
            {heading || "Four ways we steady a growing brand."}
          </SectionHeading>
          <p className="mt-6 max-w-[42ch] text-pretty font-sans text-[15px] leading-7 text-fg-muted md:mt-8">
            {intro ||
              "From the system that holds your identity together to the site you maintain and the materials your team ships every week."}
          </p>
        </Reveal>

        <Stagger className="grid gap-px bg-line sm:grid-cols-2" stagger={0.08}>
          {services.map((service) => {
            const Icon =
              iconMap[(service.icon as keyof typeof iconMap) || "brand"] ||
              BrandIcon;
            return (
              <StaggerItem key={service._id}>
                <article className="group flex h-full flex-col bg-bg p-6 transition-colors duration-300 hover:bg-bg-raised md:p-8">
                  <Icon className="size-12 text-gold transition-transform duration-500 group-hover:-translate-y-1" />
                  <h3 className="mt-6 font-display text-[24px] leading-8 text-fg md:text-[28px]">
                    {service.title}
                  </h3>
                  <p className="mt-3 max-w-[36ch] font-sans text-[15px] leading-6 text-fg-muted">
                    {service.summary}
                  </p>
                  <div className="mt-8 pt-2">
                    <TextLink href="/quote">
                      {service.linkLabel || "Talk about this"}
                    </TextLink>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
