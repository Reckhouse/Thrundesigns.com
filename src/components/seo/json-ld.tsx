import { getSiteUrl } from "@/lib/site-url";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  absoluteAssetUrl,
  absoluteUrl,
} from "@/lib/seo";
import {
  STUDIO_KNOWS_ABOUT,
  STUDIO_POSTAL_ADDRESS,
  STUDIO_SERVICE_AREAS,
} from "@/lib/studio-location";

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

/** Organization + WebSite + local ProfessionalService graph. */
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
          address: STUDIO_POSTAL_ADDRESS,
          areaServed: STUDIO_SERVICE_AREAS,
          knowsAbout: STUDIO_KNOWS_ABOUT,
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "sales",
            url: `${base}/quote`,
            areaServed: STUDIO_SERVICE_AREAS,
            availableLanguage: ["English"],
          },
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
          address: STUDIO_POSTAL_ADDRESS,
          serviceType: [
            "Brand identity design",
            "Graphic design",
            "Website design",
            "Website development",
            "Startup branding",
            "Marketing audit",
            "Print design",
          ],
          provider: { "@id": `${base}/#organization` },
          areaServed: STUDIO_SERVICE_AREAS,
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Design services",
            itemListElement: [
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Brand identity",
                  url: `${base}/services/brand-identity`,
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Web design",
                  url: `${base}/services/web-design`,
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Graphic design",
                  url: `${base}/services/graphic-design`,
                },
              },
            ],
          },
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
  const absoluteImage = absoluteAssetUrl(imageUrl);

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
          ...(absoluteImage ? { image: absoluteImage } : {}),
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
