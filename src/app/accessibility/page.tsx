import {
  LegalDocumentPage,
  legalDocumentMetadata,
} from "@/components/legal/legal-document-page";

export const revalidate = 86400;

export const metadata = legalDocumentMetadata({
  title: "Accessibility Policy",
  description:
    "Thrun Design Co. commitment to accessible design, current site standards, known limitations, and how to request accommodations or report barriers.",
  path: "/accessibility",
});

const sections = [
  {
    title: "Our commitment",
    paragraphs: [
      "Thrun Design Co. designs for clarity and usability. We aim for thrundesigns.com to be perceivable, operable, understandable, and robust for people who use assistive technologies or prefer keyboard, screen reader, or reduced-motion experiences.",
      "Accessibility is an ongoing practice—not a one-time checklist. We review new pages and features against WCAG 2.2 Level AA where practical.",
    ],
  },
  {
    title: "Measures we take",
    paragraphs: [
      "Across the marketing site we work to maintain:",
    ],
    list: [
      "Semantic HTML landmarks and heading structure on primary pages",
      "Visible focus states and keyboard-accessible navigation",
      "Text alternatives for meaningful images and icons where needed",
      "Sufficient color contrast for body text and interactive controls",
      "Respect for prefers-reduced-motion in animations and scroll effects",
      "Form labels, error messages, and bot protection that do not block assistive tech",
    ],
  },
  {
    title: "Known limitations",
    paragraphs: [
      "Some areas of the site include experimental or highly visual experiences—such as WebGL showcases, marquee motion, and lab concept pages—that may not be fully accessible to every user or device.",
      "Lab and prototype routes are marked noindex and may omit polish required for production accessibility. We prioritize accessibility on core marketing paths: home, services, work, about, quote, and legal pages.",
      "Third-party embeds (for example, video players or CMS-managed media) inherit the accessibility characteristics of those providers.",
    ],
  },
  {
    title: "Compatibility",
    paragraphs: [
      "The site is designed for current versions of major browsers (Chrome, Firefox, Safari, Edge) on desktop and mobile. We test with keyboard navigation and commonly used screen readers where feasible.",
    ],
  },
  {
    title: "Feedback and accommodations",
    paragraphs: [
      "If you encounter a barrier on thrundesigns.com—or need an accommodation to review our work or submit a quote—please tell us. Include the page URL, what you were trying to do, and the assistive technology or browser you use if relevant.",
      "We respond to accessibility feedback through the same channel as project inquiries and aim to address confirmed issues in a reasonable timeframe.",
    ],
  },
  {
    title: "Third-party content",
    paragraphs: [
      "Project case studies and portfolio media may include client-provided assets. We describe non-text content where we control the presentation, but legacy PDFs or external links may not meet our current standards.",
    ],
  },
  {
    title: "Updates",
    paragraphs: [
      "We update this policy when we make meaningful accessibility improvements or identify new limitations. The date at the top of this page reflects the latest revision.",
    ],
  },
];

export default function AccessibilityPage() {
  return (
    <LegalDocumentPage
      eyebrow="Legal"
      title="Accessibility Policy"
      intro="How we approach inclusive design on thrundesigns.com and where to report issues."
      sections={sections}
    />
  );
}
