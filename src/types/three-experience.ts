import type { MediaAssetValue } from "@/lib/media";
import type {
  ExperienceControls,
  ExperienceLoadBehavior,
  ExperienceMode,
  ExperienceQuality,
} from "@/experiences/types";

/**
 * CMS-shaped interactive experience value (module or primaryExperience).
 * Do not pass this object into the renderer — map it first.
 */
export type ThreeExperienceBlockValue = {
  _type?: "projectThreeExperience";
  _key?: string;
  experienceKey?: string | null;
  embedConfigVersion?: number | null;
  mode?: ExperienceMode | string | null;
  initialPresetKey?: string | null;
  initialCreationId?: string | null;
  heading?: string | null;
  description?: string | null;
  posterImage?: MediaAssetValue;
  fallbackVideo?: SanityFileValue | null;
  quality?: ExperienceQuality | string | null;
  controls?: ExperienceControls | string | null;
  autoplay?: boolean | null;
  loadBehavior?: ExperienceLoadBehavior | string | null;
  height?: number | null;
  allowTextEditing?: boolean | null;
  allowSvgUpload?: boolean | null;
  allowAudio?: boolean | null;
  allowExport?: boolean | null;
  showFullscreenAction?: boolean | null;
  fullscreenLabel?: string | null;
};

export type SanityFileValue = {
  asset?: {
    _ref?: string;
    _type?: string;
    url?: string | null;
    originalFilename?: string | null;
    mimeType?: string | null;
    size?: number | null;
  } | null;
} | null;

export type FeaturedCreationValue = {
  _key?: string;
  creationId?: string | null;
  displayTitle?: string | null;
  shortDescription?: string | null;
  curatorNote?: string | null;
  thumbnail?: MediaAssetValue;
  order?: number | null;
};
