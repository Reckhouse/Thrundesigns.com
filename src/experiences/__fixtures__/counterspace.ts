import type { ThreeExperienceBlockValue } from "@/types/three-experience";

/** Valid preview configuration for Counterspace Field Laboratory. */
export const validCounterspacePreviewFixture: ThreeExperienceBlockValue = {
  _type: "projectThreeExperience",
  _key: "fixture-counterspace-preview",
  experienceKey: "counterspace-field-laboratory",
  embedConfigVersion: 1,
  mode: "preview",
  initialPresetKey: "twin-orbit",
  heading: "Counterspace Field Laboratory",
  description:
    "Place signed emitters, blend four field operators, and watch particles settle into persistent geometry.",
  posterImage: {
    alt: "Counterspace Field Laboratory chamber UI",
    blobUrl: "/images/counterspace-cover.jpg",
  },
  quality: "auto",
  controls: "minimal",
  autoplay: false,
  loadBehavior: "immediate",
  height: 720,
  allowTextEditing: false,
  allowSvgUpload: false,
  allowAudio: false,
  allowExport: false,
  showFullscreenAction: true,
  fullscreenLabel: "Open Field Laboratory",
};

export const validCounterspaceInlineFixture: ThreeExperienceBlockValue = {
  ...validCounterspacePreviewFixture,
  _key: "fixture-counterspace-inline",
  mode: "inline",
  controls: "full",
  loadBehavior: "viewport",
};
