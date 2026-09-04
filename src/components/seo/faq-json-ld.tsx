import { JsonLd } from "@/components/seo/json-ld";

export type FaqItem = {
  question: string;
  answer: string;
};

/** FAQPage JSON-LD for service and topic pages. */
export function FaqJsonLd({ faqs }: { faqs: FaqItem[] }) {
  if (!faqs.length) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }}
    />
  );
}
