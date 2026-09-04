"use client";

import { TextLink } from "@/components/site/primitives";
import {
  AuditIcon,
  BrandIcon,
  PrintIcon,
  WebIcon,
} from "@/components/icons/service-icons";
import { Reveal, Stagger, StaggerItem } from "@/components/site/reveal";
import { ClipHeading } from "@/components/site/clip-heading";
import { SceneSection } from "@/components/site/scene-section";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/motion-tokens";
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

const iconMap = {
  brand: BrandIcon,
  web: WebIcon,
  print: PrintIcon,
  graphic: PrintIcon,
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
  const reduce = useReducedMotion();

  return (
    <SceneSection id="services" tone="glass" reveal="wipe-up">
      <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-5 py-16 md:gap-14 md:px-10 md:py-24 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-16 lg:px-[74px] lg:py-28">
        <Reveal variant="left">
          <Badge
            variant="outline"
            className="rounded-none border-gold/50 bg-transparent px-2.5 py-1 font-mono text-caption uppercase tracking-[0.16em] text-gold"
          >
            Offer
          </Badge>
          <ClipHeading className="mt-5 text-balance font-display text-[clamp(1.85rem,4vw,3.5rem)] leading-[1.08] tracking-[-0.02em] text-fg">
            {heading || "Four ways we steady a growing brand."}
          </ClipHeading>
          <p className="mt-6 max-w-[42ch] text-pretty font-sans text-body leading-7 text-fg-muted md:mt-8 md:text-base">
            {intro ||
              "From the system that holds your identity together to the site you maintain and the materials your team ships every week."}
          </p>
        </Reveal>

        <Stagger className="grid gap-4 sm:grid-cols-2" stagger={0.1}>
          {services.map((service, index) => {
            const Icon =
              iconMap[(service.icon as keyof typeof iconMap) || "brand"] ||
              BrandIcon;
            return (
              <StaggerItem key={service._id} variant="scale">
                <motion.div
                  whileHover={
                    reduce
                      ? undefined
                      : {
                          y: -6,
                          transition: {
                            duration: motionTokens.durationFast,
                            ease: motionTokens.easeOut,
                          },
                        }
                  }
                  className="h-full"
                >
                  <Card className="editorial-panel h-full border-line bg-bg-raised/90 py-0 ring-line transition-[ring-color,background-color] duration-300 hover:bg-surface hover:ring-gold/50">
                    <CardHeader className="gap-5 border-b border-line/70 pt-7">
                      <div className="flex items-center justify-between">
                        <Icon className="size-11 text-gold" />
                        <span className="font-mono text-label text-fg-muted">
                          0{index + 1}
                        </span>
                      </div>
                      <CardTitle>{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5">
                      <CardDescription className="max-w-[36ch] text-fg-muted">
                        {service.summary}
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-3 border-line/70 bg-transparent">
                      <TextLink
                        href={
                          getServiceByIcon(service.icon)
                            ? `/services/${getServiceByIcon(service.icon)!.slug}`
                            : quoteHrefForProjectType(
                                projectTypeFromServiceIcon(service.icon),
                              )
                        }
                      >
                        {getServiceByIcon(service.icon)
                          ? `Explore ${getServiceByIcon(service.icon)!.shortTitle.toLowerCase()}`
                          : service.linkLabel || "Request a quote"}
                      </TextLink>
                      <TextLink
                        href={quoteHrefForProjectType(
                          projectTypeFromServiceIcon(service.icon),
                        )}
                        className="text-fg-muted"
                      >
                        {service.linkLabel || "Request a quote"}
                      </TextLink>
                    </CardFooter>
                  </Card>
                </motion.div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </SceneSection>
  );
}
