import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { QuoteForm } from "@/components/quote/quote-form";
import {
  defaultQuoteFormConfig,
  resolveQuoteFormConfig,
  type QuoteFormConfig,
} from "@/lib/quote/form-config";
import { sanityFetch } from "@/sanity/lib/live";
import { quoteFormQuery } from "@/sanity/lib/queries";

async function loadQuoteFormConfig(): Promise<QuoteFormConfig> {
  try {
    const { data } = await sanityFetch({ query: quoteFormQuery });
    return resolveQuoteFormConfig(data as Partial<QuoteFormConfig> | null);
  } catch {
    return defaultQuoteFormConfig;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const config = await loadQuoteFormConfig();
  return {
    title: config.seo?.title || "Request a quote | Thrun Design Co.",
    description:
      config.seo?.description ||
      config.support ||
      "Tell us what you're building.",
  };
}

export default async function QuotePage() {
  const config = await loadQuoteFormConfig();

  return (
    <>
      <SiteHeader />
      <main className="flex-1 pt-[80px] md:pt-[96px]">
        <section className="border-b border-line">
          <QuoteForm config={config} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
