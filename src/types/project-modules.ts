import type { PortableTextBlock } from "@portabletext/types";
import type { MediaAssetValue } from "@/lib/media";
import type { ThreeExperienceBlockValue } from "@/types/three-experience";

type ModuleBase = {
  _key: string;
};

export type ProjectRichTextModule = ModuleBase & {
  _type: "projectRichText";
  heading?: string | null;
  body?: PortableTextBlock[] | null;
};

export type ProjectGalleryModule = ModuleBase & {
  _type: "projectGallery";
  layout?: "grid" | "fullBleed" | "masonry" | null;
  items?: MediaAssetValue[] | null;
  caption?: string | null;
};

export type ProjectSplitModule = ModuleBase & {
  _type: "projectSplit";
  mediaPosition?: "left" | "right" | null;
  media?: MediaAssetValue;
  body?: PortableTextBlock[] | null;
};

export type ProjectMetricsModule = ModuleBase & {
  _type: "projectMetrics";
  items?:
    | {
        _key?: string;
        value?: string | null;
        label?: string | null;
        detail?: string | null;
      }[]
    | null;
};

export type ProjectProcessModule = ModuleBase & {
  _type: "projectProcess";
  heading?: string | null;
  steps?:
    | {
        _key?: string;
        title?: string | null;
        body?: string | null;
      }[]
    | null;
};

export type ProjectQuoteModule = ModuleBase & {
  _type: "projectQuote";
  quote?: string | null;
  attribution?: string | null;
  role?: string | null;
};

export type ProjectVideoModule = ModuleBase & {
  _type: "projectVideo";
  url?: string | null;
  poster?: MediaAssetValue;
  caption?: string | null;
};

export type ProjectCtaModule = ModuleBase & {
  _type: "projectCta";
  eyebrow?: string | null;
  heading?: string | null;
  label?: string | null;
  href?: string | null;
};

export type ProjectCreditsModule = ModuleBase & {
  _type: "projectCredits";
  items?:
    | {
        _key?: string;
        role?: string | null;
        name?: string | null;
      }[]
    | null;
};

export type ProjectThreeExperienceModule = ModuleBase &
  Omit<ThreeExperienceBlockValue, "_type" | "_key"> & {
    _type: "projectThreeExperience";
  };

export type ProjectModule =
  | ProjectRichTextModule
  | ProjectGalleryModule
  | ProjectSplitModule
  | ProjectMetricsModule
  | ProjectProcessModule
  | ProjectQuoteModule
  | ProjectVideoModule
  | ProjectThreeExperienceModule
  | ProjectCtaModule
  | ProjectCreditsModule;
