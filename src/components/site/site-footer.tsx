import Link from "next/link";
import { BrandLogo } from "@/components/icons/brand-logo";

const defaultColumns = [
  {
    heading: "Explore",
    links: [
      { label: "Services", href: "/#services" },
      { label: "Work", href: "/#work" },
      { label: "Process", href: "/#process" },
      { label: "About", href: "/#about" },
      { label: "Contact", href: "/#contact" },
    ],
  },
  {
    heading: "Services",
    links: [
      { label: "Brand identity", href: "/#services" },
      { label: "Website design", href: "/#services" },
      { label: "Print & marketing", href: "/#services" },
    ],
  },
  {
    heading: "Contact",
    links: [
      { label: "Request a quote", href: "/quote" },
      { label: "View selected work", href: "/work" },
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
    <footer id="contact" className="border-t border-line bg-bg">
      <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-6 py-16 md:px-10 lg:grid-cols-[1.1fr_2fr] lg:gap-20 lg:px-[74px] lg:py-20">
        <div>
          <BrandLogo className="w-[116px]" />
          <p className="mt-10 max-w-sm font-sans text-[15px] leading-7 text-fg-muted">
            {tagline ||
              "Strategic design for businesses ready to move forward."}
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-3">
          {cols.map((column) => (
            <div key={column.heading || "column"}>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-gold">
                {column.heading}
              </p>
              <ul className="mt-5 space-y-3">
                {column.links?.map((link) =>
                  link?.label && link?.href ? (
                    <li key={`${column.heading}-${link.href}`}>
                      <Link
                        href={link.href}
                        className="font-sans text-[15px] text-fg transition-colors hover:text-gold"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ) : null,
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 border-t border-line px-6 py-6 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-muted md:flex-row md:items-center md:justify-between md:px-10 lg:px-[74px]">
        <p>© {new Date().getFullYear()} Thrun Design Co.</p>
        <p>Precision brand systems</p>
      </div>
    </footer>
  );
}
