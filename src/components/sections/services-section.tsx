import {
  Eyebrow,
  SectionHeading,
  TextLink,
} from "@/components/site/primitives";
import { BrandIcon, PrintIcon, WebIcon } from "@/components/icons/service-icons";

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
} as const;

type ServicesSectionProps = {
  eyebrow?: string | null;
  heading?: string | null;
  intro?: string | null;
  services: Service[];
};

export function ServicesSection({
  eyebrow,
  heading,
  intro,
  services,
}: ServicesSectionProps) {
  return (
    <section id="services" className="border-b border-line">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 py-12 md:gap-12 md:px-10 md:py-16 lg:grid-cols-[420px_1fr] lg:gap-16 lg:px-[74px] lg:py-20">
        <div>
          <Eyebrow>{eyebrow || "Services"}</Eyebrow>
          <SectionHeading className="mt-4">
            {heading || "Design systems that hold under pressure."}
          </SectionHeading>
          <p className="mt-6 max-w-md font-sans text-[15px] leading-7 text-fg-muted md:mt-8">
            {intro ||
              "Brand, web, and marketing work engineered for clarity across every touchpoint."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon =
              iconMap[(service.icon as keyof typeof iconMap) || "brand"] ||
              BrandIcon;
            return (
              <article
                key={service._id}
                className="flex min-h-[280px] flex-col border border-line bg-surface p-5 md:min-h-[360px] md:p-6 lg:min-h-[520px]"
              >
                <Icon className="size-[54px] text-gold" />
                <h3 className="mt-8 font-display text-[28px] leading-8 text-fg">
                  {service.title}
                </h3>
                <p className="mt-4 font-sans text-[15px] leading-6 text-fg-muted">
                  {service.summary}
                </p>
                <div className="mt-auto border-t border-line pt-6">
                  <TextLink href="/quote">{service.linkLabel || "Learn more"}</TextLink>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
