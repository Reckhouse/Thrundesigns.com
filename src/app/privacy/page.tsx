import {
  LegalDocumentPage,
  legalDocumentMetadata,
} from "@/components/legal/legal-document-page";

export const revalidate = 86400;

export const metadata = legalDocumentMetadata({
  title: "Privacy Policy",
  description:
    "How Thrun Design Co. collects, uses, and protects information when you browse the site or submit a project quote.",
  path: "/privacy",
});

const sections = [
  {
    title: "Who we are",
    paragraphs: [
      "Thrun Design Co. (“we,” “us”) operates thrundesigns.com and related services. This policy explains what information we collect, why we collect it, and the choices you have.",
    ],
  },
  {
    title: "Information we collect",
    paragraphs: [
      "When you browse the site, we may process limited technical data such as your browser type, device, and pages viewed. If you accept optional cookies, we use analytics and advertising measurement tools to understand traffic and campaign performance.",
      "When you submit a project quote, we collect the details you provide—typically your name, email address, company, project type, budget range, timeline, message, and any files you attach. We also store security metadata needed to prevent abuse (for example, rate-limit counters and bot-check results).",
    ],
  },
  {
    title: "How we use information",
    paragraphs: [
      "We use quote submissions to respond to your inquiry, scope work, and keep a record of project requests. Analytics and advertising measurement data, when enabled with your consent, helps us improve the site and measure ad performance.",
      "We do not sell personal information. We do not use quote details for unrelated marketing lists.",
    ],
  },
  {
    title: "Service providers",
    paragraphs: [
      "We rely on trusted providers to run the site. These may process data on our behalf under their own terms and privacy policies:",
    ],
    list: [
      "Vercel — hosting, deployment, and (with consent) analytics",
      "Google — Google tag / Analytics and advertising measurement (with consent)",
      "Sanity — content management and storage of quote submissions",
      "Cloudflare Turnstile — bot protection on the quote form",
      "Resend — transactional email when a quote is received (message content is limited to what is needed to notify us)",
    ],
  },
  {
    id: "cookies",
    title: "Cookies and similar technologies",
    paragraphs: [
      "Essential cookies and local storage keep the site working—for example, remembering your cookie preference and protecting the quote form from abuse.",
      "Optional analytics and advertising cookies load only if you choose “Accept all” on the cookie banner. You can change your choice anytime using Cookie settings in the site footer.",
      "Declining optional cookies does not block access to the site or quote form.",
    ],
    list: [
      "thrun-cookie-consent — stores your cookie preference (essential)",
      "Vercel Analytics — page views and performance metrics (optional, consent required)",
      "Google tag (gtag.js) — Analytics and advertising measurement (optional, consent required)",
      "Cloudflare Turnstile — session tokens for bot verification on the quote form (essential to submit)",
    ],
  },
  {
    title: "Retention",
    paragraphs: [
      "Quote submissions are kept as long as needed to evaluate and respond to your inquiry, maintain business records, and meet legal obligations. Analytics and advertising measurement data is retained according to Vercel’s and Google’s policies for those products.",
      "You may ask us to delete quote information that is no longer required. Contact us using the quote form and note your request.",
    ],
  },
  {
    title: "Security",
    paragraphs: [
      "We use HTTPS, access controls, rate limiting, and bot checks to protect submissions. No method of transmission over the internet is completely secure; we work to reduce risk proportionate to the data we handle.",
    ],
  },
  {
    title: "Your rights",
    paragraphs: [
      "Depending on where you live, you may have rights to access, correct, delete, or restrict certain processing of your personal information. To exercise these rights, contact us through the quote form with enough detail for us to locate your submission.",
    ],
  },
  {
    title: "Changes",
    paragraphs: [
      "We may update this policy when our practices or providers change. The “Last updated” date at the top reflects the most recent revision. Continued use of the site after changes means you accept the updated policy.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocumentPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="This policy describes how we handle information when you visit thrundesigns.com or send us a project inquiry."
      sections={sections}
    />
  );
}
