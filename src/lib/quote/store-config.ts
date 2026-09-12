/** Never fall back to the public media store. */
export function quoteStoreConfig(env: Record<string, string | undefined> = process.env) {
  const token = env.QUOTE_READ_WRITE_TOKEN?.trim();
  if (!token || token === env.BLOB_READ_WRITE_TOKEN?.trim()) {
    throw new Error("A dedicated private quote Blob token is required");
  }
  return { token, access: "private" as const };
}
