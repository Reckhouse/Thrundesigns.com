import {
  GOOGLE_TAG_ID,
  googleTagBootstrapScript,
} from "@/lib/google-tag";

/**
 * Official Google tag (gtag.js) as raw head scripts on every page.
 * next/script would wrap these in a Next.js loader that Google's
 * "Test connection" crawler does not treat as an installed tag.
 * Consent Mode keeps measurement denied until optional cookies are accepted.
 */
export function GoogleTag() {
  return (
    <>
      {/* Google tag (gtag.js) */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`}
      />
      <script
        id="google-tag-init"
        dangerouslySetInnerHTML={{ __html: googleTagBootstrapScript() }}
      />
    </>
  );
}
