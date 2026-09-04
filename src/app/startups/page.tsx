import {
  TopicMarketingPage,
  topicPageMetadata,
} from "@/components/marketing/topic-marketing-page";
import { STARTUPS_PAGE } from "@/lib/location-pages";

export const revalidate = 86400;

export const metadata = topicPageMetadata({
  title: STARTUPS_PAGE.metadataTitle,
  description: STARTUPS_PAGE.metadataDescription,
  path: "/startups",
});

export default function StartupsPage() {
  return (
    <TopicMarketingPage
      eyebrow={STARTUPS_PAGE.eyebrow}
      title={STARTUPS_PAGE.title}
      intro={STARTUPS_PAGE.intro}
      sections={STARTUPS_PAGE.sections}
      faqs={STARTUPS_PAGE.faqs}
      relatedLinks={STARTUPS_PAGE.relatedLinks}
      cta={STARTUPS_PAGE.cta}
    />
  );
}
