import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  TopicMarketingPage,
  topicPageMetadata,
} from "@/components/marketing/topic-marketing-page";
import {
  COLORADO_SPRINGS_PAGES,
  getColoradoSpringsPage,
} from "@/lib/location-pages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 86400;

export function generateStaticParams() {
  return COLORADO_SPRINGS_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getColoradoSpringsPage(slug);
  if (!page) return {};
  return topicPageMetadata({
    title: page.metadataTitle,
    description: page.metadataDescription,
    path: `/colorado-springs/${page.slug}`,
  });
}

export default async function ColoradoSpringsServicePage({
  params,
}: PageProps) {
  const { slug } = await params;
  const page = getColoradoSpringsPage(slug);
  if (!page) notFound();

  return (
    <TopicMarketingPage
      eyebrow={page.eyebrow}
      title={page.title}
      intro={page.intro}
      sections={page.sections}
      faqs={page.faqs}
      relatedLinks={page.relatedLinks}
      cta={page.cta}
    />
  );
}
