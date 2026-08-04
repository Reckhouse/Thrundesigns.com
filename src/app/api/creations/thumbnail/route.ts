import { publicCreationWritesForbidden } from "@/lib/creations/public-writes";

/** Visitor thumbnail uploads are disabled — use local lab downloads. */
export async function POST() {
  return publicCreationWritesForbidden();
}
