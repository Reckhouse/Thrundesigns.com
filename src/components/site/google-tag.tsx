"use client";

import Script from "next/script";
import { GOOGLE_TAG_ID } from "@/lib/google-tag";

/**
 * Google tag (gtag.js) for Analytics / Ads measurement.
 * Mount only after optional-cookie consent is accepted.
 */
export function GoogleTag() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-tag-init" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_TAG_ID}');
        `.trim()}
      </Script>
    </>
  );
}
