import Image from "next/image";
import Link from "next/link";
import { ModuleShell } from "@/components/project/module-shell";
import { Eyebrow, SectionHeading } from "@/components/site/primitives";
import {
  loadCreationsByIds,
  type StoredCreation,
} from "@/lib/creations/store";
import { resolveMediaAlt, resolveMediaUrl } from "@/lib/media";
import type { FeaturedCreationValue } from "@/types/three-experience";

type FeaturedCreationsGalleryProps = {
  items?: FeaturedCreationValue[] | null;
  caseStudyPath: string;
};

type GalleryItem = {
  key: string;
  creationId: string;
  title: string;
  description?: string;
  curatorNote?: string;
  imageSrc?: string | null;
  imageAlt: string;
  href: string;
  order: number;
};

function buildGalleryItems(
  featured: FeaturedCreationValue[],
  stored: StoredCreation[],
  caseStudyPath: string,
): GalleryItem[] {
  const byId = new Map(stored.map((item) => [item.meta.id, item]));
  const items: GalleryItem[] = [];

  featured.forEach((item, index) => {
    const creationId = item.creationId?.trim();
    if (!creationId) return;
    const match = byId.get(creationId);
    const overrideSrc = resolveMediaUrl(item.thumbnail, 900);
    const imageSrc = overrideSrc || match?.meta.thumbnailUrl || null;
    items.push({
      key: item._key || creationId,
      creationId,
      title:
        item.displayTitle?.trim() ||
        match?.meta.title?.trim() ||
        "Featured creation",
      description: item.shortDescription?.trim() || undefined,
      curatorNote: item.curatorNote?.trim() || undefined,
      imageSrc,
      imageAlt: resolveMediaAlt(
        item.thumbnail,
        item.displayTitle || match?.meta.title || "Featured creation",
      ),
      href: `/creation/${creationId}?from=${encodeURIComponent(caseStudyPath)}`,
      order: typeof item.order === "number" ? item.order : index,
    });
  });

  return items.sort((a, b) => a.order - b.order);
}

export async function FeaturedCreationsGallery({
  items,
  caseStudyPath,
}: FeaturedCreationsGalleryProps) {
  if (!items?.length) return null;

  const ids = items
    .map((item) => item.creationId?.trim())
    .filter((id): id is string => Boolean(id));
  if (!ids.length) return null;

  const stored = await loadCreationsByIds(ids);
  const gallery = buildGalleryItems(items, stored, caseStudyPath);
  if (!gallery.length) return null;

  return (
    <ModuleShell>
      <div className="max-w-2xl">
        <Eyebrow>Featured creations</Eyebrow>
        <SectionHeading className="mt-4 text-[clamp(1.5rem,3vw,2.25rem)]">
          Selected outcomes
        </SectionHeading>
        <p className="mt-5 font-sans text-[15px] leading-7 text-fg-muted">
          Curated saves from the interactive lab. Full creation data lives in
          the application store — Sanity only references these IDs.
        </p>
      </div>

      <ul className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {gallery.map((item) => (
          <li key={item.key} className="flex flex-col gap-4">
            <Link
              href={item.href}
              className="group relative block aspect-[9/16] overflow-hidden bg-bg-raised"
            >
              {item.imageSrc ? (
                <Image
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  fill
                  className="object-cover transition-opacity duration-500 group-hover:opacity-90"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="flex h-full items-end p-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">
                    No thumbnail
                  </p>
                </div>
              )}
            </Link>
            <div>
              <Link
                href={item.href}
                className="font-display text-[1.25rem] leading-snug tracking-[-0.02em] text-fg transition-colors hover:text-gold"
              >
                {item.title}
              </Link>
              {item.description ? (
                <p className="mt-2 font-sans text-[14px] leading-6 text-fg-muted">
                  {item.description}
                </p>
              ) : null}
              {item.curatorNote ? (
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
                  {item.curatorNote}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </ModuleShell>
  );
}
