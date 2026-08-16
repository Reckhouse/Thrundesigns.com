import { ModuleShell } from "@/components/project/module-shell";
import { ProjectMediaFrame } from "@/components/project/project-media-frame";
import {
  isScrollableDisplay,
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
  displayWidth: ReturnType<typeof resolveDisplayWidth>;
  aspectRatio: ReturnType<typeof resolveAspectRatio>;
  objectFit: ReturnType<typeof resolveObjectFit>;
  objectPosition?: string;
  aspectFallback?: string;
};

export function GalleryModule({ module, documentId }: GalleryModuleProps) {
  const items = (module.items || [])
    .map((item, index): GalleryRenderItem | null => {
      const displayWidth = resolveDisplayWidth(item);
      const scrollable = isScrollableDisplay(displayWidth);
      const aspect = scrollable ? "auto" : resolveAspectRatio(item);
      const fit = resolveObjectFit(item);
      const src = resolveMediaUrl(item, {
        width: scrollable ? 1400 : 1600,
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
        displayWidth,
        aspectRatio: aspect,
        objectFit: fit,
        objectPosition: resolveMediaObjectPosition(item),
        aspectFallback: layoutDefaultAspect,
      };
    })
    .filter((item): item is GalleryRenderItem => Boolean(item));

  if (!items.length) return null;

  const layout = module.layout || "grid";
  const fullBleed = layout === "fullBleed";

  if (layout === "fullBleed") {
    return (
      <ModuleShell contained={false} className="bg-bg-raised">
        <div className="flex flex-col gap-0">
          {items.map((item) => (
            <ProjectMediaFrame
              key={item.key}
              src={item.src}
              alt={item.alt}
              displayWidth={item.displayWidth}
              aspectRatio={item.aspectRatio}
              objectFit={item.objectFit}
              objectPosition={item.objectPosition}
              aspectFallback={item.aspectFallback}
              fullBleed
              sizes="100vw"
              className={
                isScrollableDisplay(item.displayWidth)
                  ? "bg-bg-deep"
                  : undefined
              }
              dataSanity={
                item.itemKey
                  ? projectMediaDataAttribute({
                      documentId,
                      path: galleryItemMediaPath(module._key, item.itemKey),
                    })
                  : undefined
              }
            />
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
        {items.map((item) => {
          const scrollable = isScrollableDisplay(item.displayWidth);
          const dataSanity = item.itemKey
            ? projectMediaDataAttribute({
                documentId,
                path: galleryItemMediaPath(module._key, item.itemKey),
              })
            : undefined;

          // Masonry + auto aspect keeps natural-height img (non-scroll).
          if (layout === "masonry" && !item.aspectFallback && !scrollable) {
            return (
              <div
                key={item.key}
                className="relative break-inside-avoid overflow-hidden bg-bg-raised"
                data-sanity={dataSanity}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.alt}
                  className="h-auto w-full object-cover"
                  style={
                    item.objectPosition
                      ? { objectPosition: item.objectPosition }
                      : undefined
                  }
                  loading="lazy"
                />
              </div>
            );
          }

          return (
            <ProjectMediaFrame
              key={item.key}
              src={item.src}
              alt={item.alt}
              displayWidth={item.displayWidth}
              aspectRatio={item.aspectRatio}
              objectFit={item.objectFit}
              objectPosition={item.objectPosition}
              aspectFallback={item.aspectFallback}
              fullBleed={fullBleed}
              sizes={
                scrollable
                  ? "(max-width: 1024px) 100vw, 1024px"
                  : "(max-width: 768px) 100vw, 50vw"
              }
              className={cn(
                layout === "masonry" && "break-inside-avoid",
                scrollable && layout === "grid" && "md:col-span-2",
              )}
              dataSanity={dataSanity}
            />
          );
        })}
      </div>
      {module.caption ? (
        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">
          {module.caption}
        </p>
      ) : null}
    </ModuleShell>
  );
}
