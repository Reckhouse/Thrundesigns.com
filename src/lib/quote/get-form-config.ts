import { createClient } from "next-sanity";
import {
  defaultQuoteFormConfig,
  resolveQuoteFormConfig,
  type QuoteFormConfig,
} from "@/lib/quote/form-config";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { quoteFormQuery } from "@/sanity/lib/queries";

/**
 * Load Quote form singleton for server validation / notify.
 * Falls back to code defaults when Sanity is unavailable.
 */
export async function getQuoteFormConfig(): Promise<QuoteFormConfig> {
  try {
    const client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      token: process.env.SANITY_API_READ_TOKEN,
    });
    const data = await client.fetch(quoteFormQuery);
    return resolveQuoteFormConfig(data as Partial<QuoteFormConfig> | null);
  } catch {
    return defaultQuoteFormConfig;
  }
}
