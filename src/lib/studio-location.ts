/**
 * Consistent local NAP / service-area signals for on-page SEO and schema.
 * Keep these strings identical across footer, About, location pages, and JSON-LD.
 */
export const STUDIO_NAME = "Thrun Design Co.";

export const STUDIO_LOCALITY = "Colorado Springs";
export const STUDIO_REGION = "CO";
export const STUDIO_COUNTRY = "US";
export const STUDIO_AREA_LABEL = "Colorado Springs, CO";

/** City-level address — update street when a public studio address exists. */
export const STUDIO_POSTAL_ADDRESS = {
  "@type": "PostalAddress" as const,
  addressLocality: STUDIO_LOCALITY,
  addressRegion: STUDIO_REGION,
  addressCountry: STUDIO_COUNTRY,
};

export const STUDIO_SERVICE_AREAS = [
  {
    "@type": "City" as const,
    name: "Colorado Springs",
  },
  {
    "@type": "AdministrativeArea" as const,
    name: "El Paso County",
  },
  {
    "@type": "State" as const,
    name: "Colorado",
  },
  {
    "@type": "Country" as const,
    name: "United States",
  },
];

export const STUDIO_NAP_LINE = `${STUDIO_NAME} · ${STUDIO_AREA_LABEL}`;

export const STUDIO_SERVICE_AREA_SUMMARY =
  "Based in Colorado Springs, serving the Front Range and remote clients nationwide.";

export const STUDIO_KNOWS_ABOUT = [
  "Brand identity",
  "Brand strategy",
  "Graphic design",
  "Web design",
  "Website development",
  "Startup branding",
  "Marketing audits",
  "Print and digital assets",
];
