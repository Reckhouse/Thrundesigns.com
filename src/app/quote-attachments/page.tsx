import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quote attachment download",
  robots: { index: false, follow: false },
};

export default async function QuoteAttachmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ pathname?: string; error?: string }>;
}) {
  const params = await searchParams;
  const pathname = params.pathname?.trim() || "";
  const errored = params.error === "1";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-16">
      <h1 className="font-display text-3xl text-fg">Attachment download</h1>
      <p className="mt-4 text-pretty font-sans text-sm leading-6 text-fg-muted">
        Enter the operator attachment secret to unlock private quote file
        downloads for this browser session (about 1 hour).
      </p>

      {pathname ? (
        <p className="mt-4 break-all font-mono text-label text-fg-muted">
          {pathname}
        </p>
      ) : null}

      {errored ? (
        <p className="mt-4 font-sans text-sm text-red-300" role="alert">
          That secret was not accepted. Try again.
        </p>
      ) : null}

      <form
        method="post"
        action="/api/quote/attachments/download"
        className="mt-8 space-y-4 border border-line bg-bg-raised p-5"
      >
        <input type="hidden" name="pathname" value={pathname} />
        <label className="block space-y-2">
          <span className="font-mono text-label uppercase tracking-[0.14em] text-gold">
            Operator secret
          </span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="flex h-10 w-full rounded-none border border-line bg-bg px-3 text-sm text-fg"
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center bg-gold px-4 font-sans text-sm text-ink hover:bg-bronze hover:text-fg"
        >
          Unlock and download
        </button>
      </form>
    </main>
  );
}
