import { getSiteUrl } from "@/lib/site-url";

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Organization + WebSite graph for the marketing site. */
export function SiteJsonLd() {
  const base = getSiteUrl();
  return (
    <JsonLd
      data={[
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": `${base}/#organization`,
          name: "Thrun Design Co.",
          url: base,
          logo: `${base}/brand/logo-mark.svg`,
          description:
            "Strategic brand systems, websites, marketing audits, and print & digital assets for founders and owners.",
        },
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": `${base}/#website`,
          name: "Thrun Design Co.",
          url: base,
          publisher: { "@id": `${base}/#organization` },
        },
      ]}
    />
  );
}
