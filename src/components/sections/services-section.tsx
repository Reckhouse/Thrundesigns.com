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
        <div>
          <SectionHeading className="text-balance">
            {heading || "Four ways we steady a growing brand."}
          </SectionHeading>
          <p className="mt-6 max-w-[42ch] text-pretty font-sans text-[15px] leading-7 text-fg-muted md:mt-8">
            {intro ||
              "From the system that holds your identity together to the site you maintain and the materials your team ships every week."}
          </p>
        </div>

        <div className="grid gap-px bg-line sm:grid-cols-2">
          {services.map((service) => {
            const Icon =
              iconMap[(service.icon as keyof typeof iconMap) || "brand"] ||
              BrandIcon;
            return (
              <article
                key={service._id}
                className="flex flex-col bg-bg p-6 md:p-8"
              >
                <Icon className="size-12 text-gold" />
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
