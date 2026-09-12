import { getCliClient } from "sanity/cli";
import { copyAndVerifyQuote } from "../../src/lib/quote/blob-store";

/** Run via sanity exec --with-user-token. Never logs customer data or credentials. */
async function main() {
  const apply = process.argv.includes("--apply");
  const remove = process.argv.includes("--remove-source");
  if (remove && !apply) throw new Error("Removal requires --apply");
  const source = getCliClient({projectId: "fbuy6kak", dataset: "production", apiVersion: "2025-01-01", useCdn: false});
  const docs = await source.fetch('*[_type == "quoteSubmission"]', {}, {perspective: "raw"});
  console.log(JSON.stringify({mode: apply ? "apply" : "dry-run", count: docs.length, removeSource: remove}));
  if (!apply) return;
  // Verify every copy before removing any source; preserve all original fields and IDs.
  for (const doc of docs) await copyAndVerifyQuote(doc, `sanity:${doc._id}`);
  console.log(JSON.stringify({copiedAndVerified: docs.length}));
  if (remove) {
    const transaction = source.transaction();
    for (const doc of docs) {
      transaction.patch(doc._id, patch => patch.ifRevisionId(doc._rev).set({migrationVerified: true})).delete(doc._id);
    }
    if (docs.length) await transaction.commit();
    console.log(JSON.stringify({removedFromSource: docs.length}));
  }
}
main().catch(() => {console.error("Migration stopped; unverified source records retained. No customer data was logged.");process.exitCode=1;});
