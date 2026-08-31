import { getSiteUrl } from "@/lib/site-url";
import { DEFAULT_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/lib/seo";

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
          name: SITE_NAME,
          url: base,
          logo: `${base}/brand/logo-mark.png`,
          image: `${base}/brand/logo-mark.png`,
          description: DEFAULT_DESCRIPTION,
          areaServed: "US",
          knowsAbout: [
            "Brand identity",
            "Brand strategy",
            "Web design",
            "Marketing audits",
            "Print and digital assets",
          ],
        },
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": `${base}/#website`,
          name: SITE_NAME,
          url: base,
          description: DEFAULT_DESCRIPTION,
          publisher: { "@id": `${base}/#organization` },
          inLanguage: "en-US",
        },
        {
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          "@id": `${base}/#service`,
          name: SITE_NAME,
          url: base,
          image: `${base}/brand/logo-mark.png`,
          description: DEFAULT_DESCRIPTION,
          serviceType: [
            "Brand identity design",
            "Website design",
            "Marketing audit",
            "Print design",
          ],
          provider: { "@id": `${base}/#organization` },
          areaServed: "US",
        },
      ]}
    />
  );
}

type ProjectJsonLdProps = {
  title: string;
  description: string;
  path: string;
  imageUrl?: string | null;
  dateModified?: string | null;
};

/** CreativeWork + BreadcrumbList for a case study page. */
export function ProjectJsonLd({
  title,
  description,
  path,
  imageUrl,
  dateModified,
}: ProjectJsonLdProps) {
  const base = getSiteUrl();
  const url = absoluteUrl(path);

  return (
    <JsonLd
      data={[
        {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          "@id": `${url}#creativework`,
          name: title,
          description,
          url,
          ...(imageUrl ? { image: imageUrl } : {}),
          ...(dateModified ? { dateModified } : {}),
          author: { "@id": `${base}/#organization` },
          creator: { "@id": `${base}/#organization` },
          publisher: { "@id": `${base}/#organization` },
          inLanguage: "en-US",
          isPartOf: { "@id": `${base}/#website` },
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: `${base}/`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Work",
              item: `${base}/work`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: title,
              item: url,
            },
          ],
        },
      ]}
    />
  );
}