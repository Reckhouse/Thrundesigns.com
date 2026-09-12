import { createClient } from "@sanity/client";
import { isDeepStrictEqual } from "node:util";

// Defaults to counts only. Never prints customer data or credentials.
const apply = process.argv.includes("--apply");
const removeSource = process.argv.includes("--remove-source");
if (removeSource && !apply) throw new Error("--remove-source requires --apply");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "fbuy6kak";
const sourceDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const destinationDataset = process.env.QUOTE_SANITY_DATASET;
const token = process.env.QUOTE_MIGRATION_TOKEN;
if (!token || !destinationDataset || destinationDataset === sourceDataset) {
  throw new Error(
    "Set QUOTE_MIGRATION_TOKEN and a separate QUOTE_SANITY_DATASET",
  );
}
const source = createClient({
  projectId,
  dataset: sourceDataset,
  token,
  apiVersion: "2025-01-01",
  useCdn: false,
});
const destination = source.withConfig({ dataset: destinationDataset });
async function verifyPrivacy() {
  const datasets = await destination.datasets.list();
  if (
    !datasets.some(
      (d) => d.name === destinationDataset && d.aclMode === "private",
    )
  ) {
    throw new Error(
      "Destination dataset must exist and have a verified private ACL",
    );
  }
}
function stripSystemFields(doc) {
  return Object.fromEntries(
    Object.entries(doc).filter(
      ([key]) => !["_rev", "_createdAt", "_updatedAt"].includes(key),
    ),
  );
}
function convert(doc) {
  const clean = stripSystemFields(doc);
  if (clean.service?._ref) {
    clean.serviceSnapshot = { _type: "object", id: clean.service._ref };
  }
  delete clean.service;
  return clean;
}
try {
  await verifyPrivacy();
  const count = await source.fetch('count(*[_type == "quoteSubmission"])');
  console.log(
    JSON.stringify({
      mode: apply ? "apply" : "dry-run",
      sourceDataset,
      destinationDataset,
      count,
      removeSource,
    }),
  );
  if (apply) {
    let lastId = "",
      copied = 0,
      removed = 0;
    while (true) {
      const documents = await source.fetch(
        '*[_type == "quoteSubmission" && _id > $lastId] | order(_id asc)[0...100]',
        { lastId },
        { perspective: "raw" },
      );
      if (!documents.length) break;
      await verifyPrivacy();
      for (const document of documents) {
        const expected = convert(document);
        await destination.createIfNotExists(expected);
        const stored = await destination.getDocument(document._id);
        if (
          !stored ||
          !isDeepStrictEqual(stripSystemFields(stored), expected)
        ) {
          throw new Error(
            "Destination content differs; source retained. Review the private dataset before retrying.",
          );
        }
        copied++;
        if (removeSource) {
          // Revision check and delete are atomic: concurrent edits prevent removal.
          await source
            .transaction()
            .patch(document._id, (patch) =>
              patch
                .ifRevisionId(document._rev)
                .set({ migrationVerified: true }),
            )
            .delete(document._id)
            .commit();
          removed++;
        }
      }
      lastId = documents.at(-1)._id;
    }
    console.log(
      JSON.stringify({ copiedAndVerified: copied, removedFromSource: removed }),
    );
  }
} catch {
  console.error(
    "Migration stopped. Source records without verified copies were retained. Check dataset ACLs, token access, and conflicting destination documents in Studio before retrying.",
  );
  process.exitCode = 1;
}
