import { publicCreationWritesForbidden } from "@/lib/creations/public-writes";

type RouteContext = {
  params: Promise<{ creationId: string }>;
};

/** Visitor duplicates are disabled — use local lab downloads. */
export async function POST(
  _request: Request,
  _context: RouteContext,
) {
  return publicCreationWritesForbidden();
}
