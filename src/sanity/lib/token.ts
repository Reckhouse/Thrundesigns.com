/** Viewer/read token for draft mode + Live Content. Server-only. */
export function getSanityReadToken(): string {
  const token = process.env.SANITY_API_READ_TOKEN?.trim();
  if (!token) {
    throw new Error("Missing SANITY_API_READ_TOKEN");
  }
  return token;
}
