import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  projectTypeFromServiceIcon,
  quoteHrefForProjectType,
} from "@/lib/quote/project-type";
import { getServiceByIcon } from "@/lib/services";
type Service = {
  _id: string;
  title?: string | null;
  icon?: string | null;
  summary?: string | null;
  linkLabel?: string | null;
};
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
    <section id="services" className="editorial-ivory">
      <div className="editorial-container editorial-section editorial-services">
        <div>
          <h2 className="editorial-heading">
            {heading || "Four ways we steady a growing brand."}
          </h2>
          <p className="editorial-intro">
            {intro ||
              "From the system that holds your identity together to the site you maintain and the materials your team ships every week."}
          </p>
        </div>
        <div className="editorial-service-list">
          {services.map((service, index) => {
            const detail = getServiceByIcon(service.icon);
            const quoteHref = quoteHrefForProjectType(
              projectTypeFromServiceIcon(service.icon),
            );
            return (
              <article key={service._id} className="editorial-service">
                <span className="editorial-service-number" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.summary}</p>
                  <div className="editorial-service-actions">
                    {detail && (
                      <Link href={`/services/${detail.slug}`}>
                        Explore {detail.shortTitle.toLowerCase()}
                        <ArrowUpRight size={15} aria-hidden />
                      </Link>
                    )}
                    <Link href={quoteHref}>
                      {service.linkLabel || "Request a quote"}
                      <ArrowUpRight size={15} aria-hidden />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
