import Link from "next/link";
import { stegaClean } from "@sanity/client/stega";
import { BrandLogo } from "@/components/icons/brand-logo";

const defaultColumns = [
  {
    heading: "Explore",
    links: [
      { label: "Services", href: "/services/brand-identity" },
      { label: "Concept studies", href: "/work" },
      { label: "About", href: "/about" },
      { label: "Process", href: "/#process" },
    ],
  },
  {
    heading: "Services",
    links: [
      { label: "Brand identity", href: "/services/brand-identity" },
      { label: "Web design", href: "/services/web-design" },
      { label: "Marketing audit", href: "/services/marketing-audit" },
      { label: "Print & digital", href: "/services/print-digital" },
    ],
  },
  {
    heading: "Start",
    links: [
      { label: "Request a quote", href: "/quote" },
      { label: "Browse concept studies", href: "/work" },
    ],
  },
];

type SiteFooterProps = {
  tagline?: string | null;
  columns?:
    | {
        heading?: string | null;
        links?: { label?: string | null; href?: string | null }[] | null;
      }[]
    | null;
};

export function SiteFooter({ tagline, columns }: SiteFooterProps) {
  const cols = columns?.length ? columns : defaultColumns;

  return (
    <footer
      id="contact"
      className="relative z-10 border-t border-line bg-bg-deep/95"
    >
      <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-6 py-16 md:px-10 lg:grid-cols-[1.1fr_2fr] lg:gap-20 lg:px-[74px] lg:py-20">
        <div>
          <BrandLogo className="h-24 w-auto md:h-[112px] lg:h-[128px]" />
          <p className="mt-8 max-w-[40ch] text-pretty font-sans text-body leading-7 text-fg-muted md:mt-10">
            {tagline ||
              "Strategic design for founders and owners ready to move forward."}
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-3">
          {cols.map((column) => (
            <div key={column.heading || "column"}>
              <p className="font-mono text-label uppercase tracking-[0.16em] text-gold">
                {column.heading}
              </p>
              <ul className="mt-5 space-y-3">
                {column.links?.map((link) => {
                  const label = link?.label ? stegaClean(link.label) : "";
                  const href = link?.href ? stegaClean(link.href) : "";
                  if (!label || !href) return null;
                  return (
                    <li key={`${column.heading}-${label}-${href}`}>
                      <Link
                        href={href}
                        className="font-sans text-body text-fg transition-colors hover:text-gold"
                      >
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 border-t border-line px-6 py-6 font-mono text-caption uppercase tracking-[0.12em] text-fg-muted md:flex-row md:items-center md:justify-between md:px-10 lg:px-[74px]">
        <p>© {new Date().getFullYear()} Thrun Design Co.</p>
        <p>Brand systems for growing businesses</p>
      </div>
    </footer>
  );
}
