import { dataset, projectId } from "@/sanity/env";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  if (!/^[a-f0-9]{40}\.glb$/.test(filename))
    return new Response("Not found", { status: 404 });
  try {
    const upstream = await fetch(
      `https://cdn.sanity.io/files/${projectId}/${dataset}/${filename}`,
      {
        redirect: "error",
        signal: AbortSignal.timeout(20000),
        cache: "force-cache",
      },
    );
    if (!upstream.ok)
      return new Response("Model unavailable", {
        status: upstream.status === 404 ? 404 : 502,
      });
    return new Response(upstream.body, {
      headers: {
        "Content-Type": "model/gltf-binary",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Model unavailable", { status: 502 });
  }
}
