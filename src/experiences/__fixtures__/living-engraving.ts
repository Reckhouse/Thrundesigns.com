import type { ThreeExperienceBlockValue } from "@/types/three-experience";

/** Valid preview configuration for Living Engraving. */
export const validLivingEngravingPreviewFixture: ThreeExperienceBlockValue = {
  _type: "projectThreeExperience",
  _key: "fixture-living-preview",
  experienceKey: "living-engraving-horse",
  embedConfigVersion: 1,
  mode: "preview",
  initialPresetKey: "centered-cameo",
  heading: "Living Engraving",
  description: "Interactive particle cameo from the homepage hero.",
  posterImage: {
    alt: "Horse head engraving poster",
    blobUrl: "/experiences/living-engraving/poster.png",
  },
  quality: "auto",
  controls: "minimal",
  autoplay: false,
  loadBehavior: "interaction",
  height: 640,
  allowTextEditing: false,
  allowSvgUpload: false,
  allowAudio: false,
  allowExport: false,
  showFullscreenAction: true,
  fullscreenLabel: "Open Living Engraving",
};

export const validLivingEngravingInlineFixture: ThreeExperienceBlockValue = {
  ...validLivingEngravingPreviewFixture,
  _key: "fixture-living-inline",
  mode: "inline",
  controls: "full",
  loadBehavior: "viewport",
};
