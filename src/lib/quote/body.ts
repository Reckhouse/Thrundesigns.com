export class RequestBodyError extends Error {
  constructor(public status: 400 | 413) {
    super("Invalid request body");
  }
}

/** Count actual bytes even when Content-Length is missing or dishonest. */
export async function readBoundedFormData(
  request: Request,
  maxBytes: number,
): Promise<FormData> {
  const length = request.headers.get("content-length");
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > maxBytes)) {
    throw new RequestBodyError(/^\d+$/.test(length) ? 413 : 400);
  }
  if (!request.body) throw new RequestBodyError(400);
  const reader = request.body.getReader();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new RequestBodyError(413);
      }
      chunks.push(new Uint8Array(value));
    }
    return await new Response(new Blob(chunks), {
      headers: { "content-type": request.headers.get("content-type") || "" },
    }).formData();
  } catch (error) {
    if (error instanceof RequestBodyError) throw error;
    throw new RequestBodyError(400);
  } finally {
    reader.releaseLock();
  }
}
