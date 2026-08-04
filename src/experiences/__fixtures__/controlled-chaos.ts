import type { ThreeExperienceBlockValue } from "@/types/three-experience";

/** Valid preview configuration for Controlled Chaos stub. */
export const validControlledChaosPreviewFixture: ThreeExperienceBlockValue = {
  _type: "projectThreeExperience",
  _key: "fixture-preview",
  experienceKey: "controlled-chaos-poster-lab",
  embedConfigVersion: 1,
  mode: "preview",
  initialPresetKey: "signal-failure",
  heading: "Try the poster lab",
  description: "A lightweight preview of the interactive system.",
  posterImage: {
    alt: "Controlled Chaos poster frame",
    blobUrl: "https://example.public.blob.vercel-storage.com/poster.jpg",
  },
  quality: "auto",
  controls: "minimal",
  autoplay: false,
  loadBehavior: "interaction",
  height: 720,
  allowTextEditing: false,
  allowSvgUpload: false,
  allowAudio: false,
  allowExport: false,
  showFullscreenAction: true,
  fullscreenLabel: "Launch Poster Lab",
};

/** Inline mode with capability flags enabled. */
export const validControlledChaosInlineFixture: ThreeExperienceBlockValue = {
  ...validControlledChaosPreviewFixture,
  _key: "fixture-inline",
  mode: "inline",
  controls: "full",
  allowTextEditing: true,
  allowSvgUpload: true,
  allowAudio: true,
  allowExport: true,
  loadBehavior: "viewport",
};

/** Replay without creation ID — should fail mapping. */
export const invalidReplayMissingCreationFixture: ThreeExperienceBlockValue = {
  ...validControlledChaosPreviewFixture,
  _key: "fixture-replay-bad",
  mode: "replay",
  initialPresetKey: undefined,
  initialCreationId: undefined,
};

/** Unknown experience key — should fail mapping. */
export const invalidUnknownExperienceFixture: ThreeExperienceBlockValue = {
  ...validControlledChaosPreviewFixture,
  _key: "fixture-unknown",
  experienceKey: "not-a-real-experience",
};

/** Unsupported preset for Controlled Chaos — should fail mapping. */
export const invalidUnsupportedPresetFixture: ThreeExperienceBlockValue = {
  ...validControlledChaosPreviewFixture,
  _key: "fixture-bad-preset",
  initialPresetKey: "does-not-exist",
};

/** Embed version mismatch — should fail mapping. */
export const invalidEmbedVersionFixture: ThreeExperienceBlockValue = {
  ...validControlledChaosPreviewFixture,
  _key: "fixture-embed-version",
  embedConfigVersion: 99,
};
