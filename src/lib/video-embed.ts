/** Convert a YouTube/Vimeo watch URL into a privacy-friendly embed URL. */
export function toEmbedUrl(raw: string): string | null {
  try {
    const url = new URL(raw.trim());
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const id =
        url.searchParams.get("v") ||
        (url.pathname.startsWith("/embed/")
          ? url.pathname.split("/")[2]
          : url.pathname.startsWith("/shorts/")
            ? url.pathname.split("/")[2]
            : null);
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }

    if (host === "vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }

    if (host === "player.vimeo.com") {
      return raw;
    }

    return null;
  } catch {
    return null;
  }
}
