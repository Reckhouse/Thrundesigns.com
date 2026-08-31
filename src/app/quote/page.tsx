import type { Metadata } from "next";
import type { SanityImageSource } from "@sanity/image-url";
import { buildPageMetadata, seoImageUrl } from "@/lib/seo";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { QuoteForm } from "@/components/quote/quote-form";
import {
  defaultQuoteFormConfig,
  resolveQuoteFormConfig,
  type QuoteFormConfig,
} from "@/lib/quote/form-config";
import { parseProjectTypeParam } from "@/lib/quote/project-type";
import { sanityFetch } from "@/sanity/lib/live";
import { quoteFormQuery } from "@/sanity/lib/queries";

async function loadQuoteFormConfig(options?: {
  stega?: boolean;
}): Promise<QuoteFormConfig> {
  try {
    const { data } = await sanityFetch({
      query: quoteFormQuery,
      stega: options?.stega,
    });
    return resolveQuoteFormConfig(data as Partial<QuoteFormConfig> | null);
  } catch {
    return defaultQuoteFormConfig;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const config = await loadQuoteFormConfig({ stega: false });
  const title = config.seo?.title || "Request a quote";
  const description =
    config.seo?.description ||
    config.support ||
    "Tell us what you're building.";
  return buildPageMetadata({
    title,
    description,
    path: "/quote",
    imageUrl: seoImageUrl(config.seo?.ogImage as SanityImageSource | null | undefined),
  });
}

type QuotePageProps = {
  searchParams: Promise<{ type?: string | string[] }>;
};

export default async function QuotePage({ searchParams }: QuotePageProps) {
  const config = await loadQuoteFormConfig();
  const params = await searchParams;
  const initialProjectType = parseProjectTypeParam(params.type);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 pt-[120px] md:pt-[136px] lg:pt-[152px]">
        <section className="border-b border-line">
          <QuoteForm
            config={config}
            initialProjectType={initialProjectType}
          />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
