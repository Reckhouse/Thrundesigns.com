import type { Metadata } from "next";
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
  return {
    title: config.seo?.title || "Request a quote",
    description:
      config.seo?.description ||
      config.support ||
      "Tell us what you're building.",
    alternates: { canonical: "/quote" },
  };
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
      <main className="flex-1 pt-[80px] md:pt-[96px]">
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
