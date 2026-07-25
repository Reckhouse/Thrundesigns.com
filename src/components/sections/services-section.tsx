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
  const reduce = useReducedMotion();

  return (
    <section id="services" className="editorial-depth border-b border-line">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 py-14 md:gap-12 md:px-10 md:py-20 lg:grid-cols-[380px_1fr] lg:gap-16 lg:px-[74px] lg:py-24">
        <Reveal variant="left">
          <Badge
            variant="outline"
            className="rounded-none border-gold/40 bg-transparent px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-gold"
          >
            Offer
          </Badge>
          <ClipHeading className="mt-5 text-balance font-display text-[30px] leading-10 tracking-[-0.02em] text-fg md:text-[34px] md:leading-[46px] lg:text-[56px] lg:leading-[70px]">
            {heading || "Four ways we steady a growing brand."}
          </ClipHeading>
          <p className="mt-6 max-w-[42ch] text-pretty font-sans text-[15px] leading-7 text-fg-muted md:mt-8">
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
              <StaggerItem key={service._id}>
                <motion.div
                  whileHover={
                    reduce
                      ? undefined
                      : { y: -6, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }
                  }
                  className="h-full"
                >
                  <Card className="editorial-panel h-full bg-bg-raised/90 py-0 ring-line transition-[ring-color,background-color] duration-300 hover:bg-surface hover:ring-gold/45">
                    <CardHeader className="gap-5 border-b border-line/70 pt-7">
                      <div className="flex items-center justify-between">
                        <Icon className="size-11 text-gold" />
                        <span className="font-mono text-[11px] text-fg-muted">
                          0{index + 1}
                        </span>
                      </div>
                      <CardTitle>{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5">
                      <CardDescription className="max-w-[36ch]">
                        {service.summary}
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="border-line/70 bg-transparent">
                      <TextLink href="/quote">
                        {service.linkLabel || "Talk about this"}
                      </TextLink>
                    </CardFooter>
                  </Card>
                </motion.div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
