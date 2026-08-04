/**
 * Persistence adapter for Controlled Chaos.
 * Calls the portfolio creations API — storage logic stays server-side.
 */

export type ControlledChaosCreationRecord = {
  id: string;
  payload: unknown;
};

export type ControlledChaosPersistenceAdapter = {
  save(creation: unknown): Promise<{ id: string; url: string }>;
  load(creationId: string): Promise<ControlledChaosCreationRecord>;
  duplicate(creationId: string): Promise<{ id: string; url: string }>;
  uploadThumbnail?(imageBase64: string): Promise<{ url: string }>;
};

async function readJson(response: Response): Promise<Record<string, unknown>> {
  return (await response.json().catch(() => ({}))) as Record<string, unknown>;
}

export const controlledChaosPersistenceAdapter: ControlledChaosPersistenceAdapter =
  {
    async save(creation) {
      const response = await fetch("/api/creations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creation),
      });
      const data = await readJson(response);
      if (!response.ok || typeof data.id !== "string") {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Failed to save creation",
        );
      }
      return {
        id: data.id,
        url: typeof data.url === "string" ? data.url : `/creation/${data.id}`,
      };
    },

    async load(creationId) {
      const response = await fetch(`/api/creations/${creationId}`, {
        method: "GET",
        cache: "no-store",
      });
      const data = await readJson(response);
      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Failed to load creation",
        );
      }
      return {
        id: creationId,
        payload: data.creation,
      };
    },

    async duplicate(creationId) {
      const response = await fetch(`/api/creations/${creationId}/duplicate`, {
        method: "POST",
      });
      const data = await readJson(response);
      if (!response.ok || typeof data.id !== "string") {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Failed to duplicate creation",
        );
      }
      return {
        id: data.id,
        url: typeof data.url === "string" ? data.url : `/creation/${data.id}`,
      };
    },

    async uploadThumbnail(imageBase64) {
      const response = await fetch("/api/creations/thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });
      const data = await readJson(response);
      if (!response.ok || typeof data.url !== "string") {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Failed to upload thumbnail",
        );
      }
      return { url: data.url };
    },
  };
