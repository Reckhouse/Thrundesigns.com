import Image from "next/image";
import { ModuleShell } from "@/components/project/module-shell";
import {
  mediaAspectRatioClass,
  mediaDisplayWidthClass,
  mediaObjectFitClass,
  resolveAspectRatio,
  resolveDisplayWidth,
  resolveMediaAlt,
  resolveMediaObjectPosition,
  resolveMediaUrl,
  resolveObjectFit,
  type MediaAssetValue,
} from "@/lib/media";
import {
  galleryItemMediaPath,
  projectMediaDataAttribute,
} from "@/lib/sanity-data-attribute";
import { cn } from "@/lib/utils";
import type { ProjectGalleryModule } from "@/types/project-modules";

type GalleryModuleProps = {
  module: ProjectGalleryModule;
  documentId?: string | null;
};

type GalleryRenderItem = {
  key: string;
  itemKey?: string;
  media: MediaAssetValue;
  src: string;
  alt: string;
  widthClass: string;
  aspectClass?: string;
  fitClass: string;
  objectPosition?: string;
};

export function GalleryModule({ module, documentId }: GalleryModuleProps) {
  const items = (module.items || [])
    .map((item, index): GalleryRenderItem | null => {
      const aspect = resolveAspectRatio(item);
      const fit = resolveObjectFit(item);
      const width = resolveDisplayWidth(item);
      const src = resolveMediaUrl(item, {
        width: 1600,
        aspectRatio: aspect,
        objectFit: fit,
      });
      if (!src) return null;
      const layoutDefaultAspect =
        module.layout === "fullBleed"
          ? "aspect-[16/9] md:aspect-[21/9]"
          : module.layout === "masonry"
            ? undefined
            : "aspect-[4/3]";
      return {
        key: item?._key || `gallery-${index}`,
        itemKey: item?._key || undefined,
        media: item,
        src,
        alt: resolveMediaAlt(item, "Project image"),
        widthClass: mediaDisplayWidthClass(width, {
          fullBleed: module.layout === "fullBleed",
        }),
        aspectClass: mediaAspectRatioClass(aspect, layoutDefaultAspect),
        fitClass: mediaObjectFitClass(fit),
        objectPosition: resolveMediaObjectPosition(item),
      };
    })
    .filter((item): item is GalleryRenderItem => Boolean(item));

  if (!items.length) return null;

  const layout = module.layout || "grid";

  if (layout === "fullBleed") {
    return (
      <ModuleShell contained={false} className="bg-bg-raised">
        <div className="flex flex-col">
          {items.map((item) => (
            <div
              key={item.key}
              className={cn(
                "relative w-full overflow-hidden",
                item.widthClass,
                item.aspectClass || "aspect-[16/9] md:aspect-[21/9]",
              )}
              data-sanity={
                item.itemKey
                  ? projectMediaDataAttribute({
                      documentId,
                      path: galleryItemMediaPath(module._key, item.itemKey),
                    })
                  : undefined
              }
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className={item.fitClass}
                style={
                  item.objectPosition
                    ? { objectPosition: item.objectPosition }
                    : undefined
                }
                sizes="100vw"
              />
            </div>
          ))}
        </div>
        {module.caption ? (
          <p className="mx-auto max-w-[1440px] px-6 py-4 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted md:px-10 lg:px-[74px]">
            {module.caption}
          </p>
        ) : null}
      </ModuleShell>
    );
  }

  return (
    <ModuleShell>
      <div
        className={cn(
          layout === "masonry" &&
            "columns-1 gap-4 md:columns-2 md:gap-5 lg:columns-3 [&>*]:mb-4 md:[&>*]:mb-5",
          layout === "grid" &&
            "grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:gap-6",
        )}
      >
        {items.map((item) => (
          <div
            key={item.key}
            className={cn(
              "relative overflow-hidden bg-bg-raised",
              item.widthClass,
              layout === "grid" && (item.aspectClass || "aspect-[4/3]"),
              layout === "masonry" && "break-inside-avoid",
              layout === "masonry" && item.aspectClass,
            )}
            data-sanity={
              item.itemKey
                ? projectMediaDataAttribute({
                    documentId,
                    path: galleryItemMediaPath(module._key, item.itemKey),
                  })
                : undefined
            }
          >
            {layout === "masonry" && !item.aspectClass ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.src}
                alt={item.alt}
                className={cn("h-auto w-full", item.fitClass)}
                style={
                  item.objectPosition
                    ? { objectPosition: item.objectPosition }
                    : undefined
                }
                loading="lazy"
              />
            ) : (
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className={item.fitClass}
                style={
                  item.objectPosition
                    ? { objectPosition: item.objectPosition }
                    : undefined
                }
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
          </div>
        ))}
      </div>
      {module.caption ? (
        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">
          {module.caption}
        </p>
      ) : null}
    </ModuleShell>
  );
}
