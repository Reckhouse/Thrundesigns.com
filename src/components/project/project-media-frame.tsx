import Image from "next/image";
import {
  isScrollableDisplay,
  mediaAspectRatioClass,
  mediaDisplayWidthClass,
  mediaObjectFitClass,
  mediaScrollFrameClass,
  type MediaAspectRatio,
  type MediaDisplayWidth,
  type MediaObjectFit,
} from "@/lib/media";
import { cn } from "@/lib/utils";

type ProjectMediaFrameProps = {
  src: string;
  alt: string;
  displayWidth: MediaDisplayWidth;
  aspectRatio: MediaAspectRatio;
  objectFit: MediaObjectFit;
  objectPosition?: string;
  sizes: string;
  priority?: boolean;
  fullBleed?: boolean;
  /** Layout default when aspect is auto (ignored for scrollable page). */
  aspectFallback?: string;
  className?: string;
  dataSanity?: string;
};

/**
 * CMS media frame. `displayWidth: "scroll"` renders a fixed-height viewport
 * with an in-frame scrollbar for tall webpage / UI screenshots.
 */
export function ProjectMediaFrame({
  src,
  alt,
  displayWidth,
  aspectRatio,
  objectFit,
  objectPosition,
  sizes,
  priority,
  fullBleed,
  aspectFallback,
  className,
  dataSanity,
}: ProjectMediaFrameProps) {
  if (isScrollableDisplay(displayWidth)) {
    return (
      <div
        className={cn(mediaScrollFrameClass({ fullBleed }), className)}
        data-sanity={dataSanity}
        tabIndex={0}
        role="region"
        aria-label={`${alt} (scrollable page screenshot)`}
      >
        {/* Natural-height image so the frame scrolls the full page capture. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="block h-auto w-full"
          style={objectPosition ? { objectPosition } : undefined}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-bg-raised",
        mediaDisplayWidthClass(displayWidth, { fullBleed }),
        mediaAspectRatioClass(aspectRatio, aspectFallback),
        className,
      )}
      data-sanity={dataSanity}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          mediaObjectFitClass(objectFit),
          !objectPosition && "object-center",
        )}
        style={objectPosition ? { objectPosition } : undefined}
        sizes={sizes}
        priority={priority}
      />
    </div>
  );
}
