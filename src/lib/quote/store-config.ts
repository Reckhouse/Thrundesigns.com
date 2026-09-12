import { createClient } from "@sanity/client";
import { apiVersion, dataset as contentDataset, projectId } from "@/sanity/env";

export function quoteStoreConfig(
  env: Record<string, string | undefined> = process.env,
) {
  const dataset = env.QUOTE_SANITY_DATASET?.trim();
  const token = env.QUOTE_SANITY_WRITE_TOKEN?.trim();
  const publicDataset =
    env.NEXT_PUBLIC_SANITY_DATASET?.trim() || contentDataset;
  if (
    !dataset ||
    !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(dataset) ||
    dataset === publicDataset ||
    !token
  ) {
    throw new Error(
      "A separate private quote dataset and dedicated token are required",
    );
  }
  return {
    projectId,
    dataset,
    token,
    apiVersion,
    useCdn: false as const,
    timeout: 10_000,
    maxRetries: 0,
  };
}

export function assertPrivateQuoteDataset(
  datasets: { name: string; aclMode: string }[],
  name: string,
) {
  if (
    !datasets.some(
      (entry) => entry.name === name && entry.aclMode === "private",
    )
  ) {
    throw new Error("Quote dataset privacy could not be verified");
  }
}

/** Verify the actual ACL before each write; never trust a dataset's name. */
export async function privateQuoteClient() {
  const config = quoteStoreConfig();
  const client = createClient(config);
  assertPrivateQuoteDataset(await client.datasets.list(), config.dataset);
  return client;
}
