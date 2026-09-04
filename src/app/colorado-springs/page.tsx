import {
  TopicMarketingPage,
  topicPageMetadata,
} from "@/components/marketing/topic-marketing-page";
import { COLORADO_SPRINGS_HUB } from "@/lib/location-pages";

export const revalidate = 86400;

export const metadata = topicPageMetadata({
  title: COLORADO_SPRINGS_HUB.metadataTitle,
  description: COLORADO_SPRINGS_HUB.metadataDescription,
  path: "/colorado-springs",
});

export default function ColoradoSpringsHubPage() {
  return (
    <TopicMarketingPage
      eyebrow={COLORADO_SPRINGS_HUB.eyebrow}
      title={COLORADO_SPRINGS_HUB.title}
      intro={COLORADO_SPRINGS_HUB.intro}
      sections={COLORADO_SPRINGS_HUB.sections}
      faqs={COLORADO_SPRINGS_HUB.faqs}
      relatedLinks={COLORADO_SPRINGS_HUB.relatedLinks}
      cta={COLORADO_SPRINGS_HUB.cta}
    />
  );
}
