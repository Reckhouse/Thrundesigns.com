import { CubeIcon } from "@sanity/icons/Cube";
import { defineField, defineType } from "sanity";
import { ThreeExperiencePreview } from "../../components/ThreeExperiencePreview";
import {
  controlsOptionsForExperience,
  defaultEmbedConfigVersion,
  defaultExperienceHeight,
  experienceKeyOptions,
  getExperienceManifest,
  installedExperienceManifests,
  modeOptionsForExperience,
  presetOptionsForExperience,
  qualityOptionsForExperience,
} from "../../lib/experienceManifestOptions";
import {
  collectExperienceWarnings,
  type ThreeExperienceValue,
} from "../../lib/experienceValidation";

function parentExperience(
  parent: unknown,
): ThreeExperienceValue | undefined {
  if (parent && typeof parent === "object") {
    return parent as ThreeExperienceValue;
  }
  return undefined;
}

function uniqueOptions(
  options: { title: string; value: string }[],
): { title: string; value: string }[] {
  return Array.from(
    new Map(options.map((option) => [option.value, option])).values(),
  );
}

const allModeOptions = uniqueOptions(
  installedExperienceManifests.flatMap((manifest) =>
    modeOptionsForExperience(manifest.experienceKey),
  ),
);

const allQualityOptions = uniqueOptions(
  installedExperienceManifests.flatMap((manifest) =>
    qualityOptionsForExperience(manifest.experienceKey),
  ),
);

const allControlsOptions = uniqueOptions(
  installedExperienceManifests.flatMap((manifest) =>
    controlsOptionsForExperience(manifest.experienceKey),
  ),
);

const allPresetOptions = uniqueOptions(
  installedExperienceManifests.flatMap((manifest) =>
    presetOptionsForExperience(manifest.experienceKey),
  ),
);

export const projectThreeExperience = defineType({
  name: "projectThreeExperience",
  title: "Interactive 3D experience",
  type: "object",
  icon: CubeIcon,
  components: {
    preview: ThreeExperiencePreview,
  },
  fields: [
    defineField({
      name: "experienceKey",
      title: "Experience",
      type: "string",
      options: {
        list: experienceKeyOptions(),
        layout: "radio",
      },
      validation: (Rule) =>
        Rule.required().custom((value) => {
          if (!value) return true;
          return getExperienceManifest(value)
            ? true
            : `Unknown experience key "${value}"`;
        }),
    }),
    defineField({
      name: "embedConfigVersion",
      title: "Embed configuration version",
      type: "number",
      readOnly: true,
      initialValue: (params) =>
        defaultEmbedConfigVersion(
          (params as { parent?: ThreeExperienceValue }).parent?.experienceKey,
        ),
      description:
        "Pinned from the installed package manifest. Update the package, then refresh this value if prompted.",
      validation: (Rule) =>
        Rule.required().custom((value, context) => {
          const parent = parentExperience(context.parent);
          const manifest = getExperienceManifest(parent?.experienceKey);
          if (!manifest || value == null) return true;
          return value === manifest.embedConfigVersion
            ? true
            : `Embed configuration requires migration (CMS ${value} → package ${manifest.embedConfigVersion})`;
        }),
    }),
    defineField({
      name: "mode",
      title: "Display mode",
      type: "string",
      options: {
        list: allModeOptions,
        layout: "radio",
      },
      initialValue: "preview",
      validation: (Rule) =>
        Rule.required().custom((value, context) => {
          if (!value) return true;
          const parent = parentExperience(context.parent);
          const manifest = getExperienceManifest(parent?.experienceKey);
          if (!manifest) return true;
          return manifest.modes.includes(value)
            ? true
            : `Mode "${value}" is not supported by the installed package`;
        }),
    }),
    defineField({
      name: "initialPresetKey",
      title: "Initial preset",
      type: "string",
      hidden: ({ parent }) => parent?.mode === "replay",
      options: {
        list: allPresetOptions,
      },
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = parentExperience(context.parent);
          if (parent?.mode === "replay") return true;
          if (!value) return true;
          const manifest = getExperienceManifest(parent?.experienceKey);
          if (!manifest) return true;
          return manifest.presets.some((preset) => preset.key === value)
            ? true
            : `Preset "${value}" is not available for this experience`;
        }),
    }),
    defineField({
      name: "initialCreationId",
      title: "Saved creation ID",
      type: "string",
      hidden: ({ parent }) => parent?.mode !== "replay",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = parentExperience(context.parent);
          if (parent?.mode !== "replay") return true;
          return value?.trim()
            ? true
            : "Replay mode requires a creation ID";
        }),
    }),
    defineField({
      name: "heading",
      title: "Section heading",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Section description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "posterImage",
      title: "Loading poster",
      type: "mediaAsset",
      description:
        "Required fallback shown before load and when WebGL is unavailable.",
      validation: (Rule) =>
        Rule.required().custom((value) => {
          const media = value as
            | { image?: unknown; blobUrl?: string }
            | undefined;
          if (media?.image || media?.blobUrl) return true;
          return "Fallback image is missing";
        }),
    }),
    defineField({
      name: "fallbackVideo",
      title: "Fallback video",
      type: "file",
      options: { accept: "video/*" },
      description: "Optional muted looping fallback between poster and canvas.",
    }),
    defineField({
      name: "quality",
      title: "Quality",
      type: "string",
      options: {
        list: allQualityOptions,
      },
      initialValue: "auto",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (!value) return true;
          const parent = parentExperience(context.parent);
          const manifest = getExperienceManifest(parent?.experienceKey);
          if (!manifest) return true;
          return manifest.quality.includes(value)
            ? true
            : `Quality "${value}" is not supported`;
        }),
    }),
    defineField({
      name: "controls",
      title: "Controls",
      type: "string",
      options: {
        list: allControlsOptions,
      },
      initialValue: "minimal",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (!value) return true;
          const parent = parentExperience(context.parent);
          if (parent?.mode === "preview" && value === "full") {
            return "Full controls are not allowed in preview mode";
          }
          const manifest = getExperienceManifest(parent?.experienceKey);
          if (!manifest) return true;
          return manifest.controls.includes(value)
            ? true
            : `Controls setting "${value}" is not supported`;
        }),
    }),
    defineField({
      name: "autoplay",
      title: "Autoplay",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "loadBehavior",
      title: "Loading behavior",
      type: "string",
      options: {
        list: [
          {
            title: "Load after visitor action",
            value: "interaction",
          },
          {
            title: "Load when near viewport",
            value: "viewport",
          },
          {
            title: "Load immediately",
            value: "immediate",
          },
        ],
      },
      initialValue: "interaction",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "height",
      title: "Desktop height",
      type: "number",
      initialValue: (params) =>
        defaultExperienceHeight(
          (params as { parent?: ThreeExperienceValue }).parent?.experienceKey,
        ),
      validation: (Rule) => Rule.min(400).max(1400),
    }),
    defineField({
      name: "allowTextEditing",
      title: "Allow text editing",
      type: "boolean",
      initialValue: false,
      hidden: ({ parent }) => parent?.mode !== "inline",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (!value) return true;
          const parent = parentExperience(context.parent);
          const manifest = getExperienceManifest(parent?.experienceKey);
          if (!manifest) return true;
          return manifest.capabilities.textEditing
            ? true
            : "Selected experience does not support text editing";
        }),
    }),
    defineField({
      name: "allowSvgUpload",
      title: "Allow SVG upload",
      type: "boolean",
      initialValue: false,
      hidden: ({ parent }) => parent?.mode !== "inline",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (!value) return true;
          const parent = parentExperience(context.parent);
          const manifest = getExperienceManifest(parent?.experienceKey);
          if (!manifest) return true;
          return manifest.capabilities.svgUpload
            ? true
            : "Selected experience does not support SVG upload";
        }),
    }),
    defineField({
      name: "allowAudio",
      title: "Allow audio",
      type: "boolean",
      initialValue: false,
      hidden: ({ parent }) => parent?.mode !== "inline",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (!value) return true;
          const parent = parentExperience(context.parent);
          const manifest = getExperienceManifest(parent?.experienceKey);
          if (!manifest) return true;
          return manifest.capabilities.audio
            ? true
            : "Selected experience does not support audio";
        }),
    }),
    defineField({
      name: "allowExport",
      title: "Allow export",
      type: "boolean",
      initialValue: false,
      hidden: ({ parent }) => parent?.mode !== "inline",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (!value) return true;
          const parent = parentExperience(context.parent);
          const manifest = getExperienceManifest(parent?.experienceKey);
          if (!manifest) return true;
          return manifest.capabilities.export
            ? true
            : "Selected experience does not support export";
        }),
    }),
    defineField({
      name: "showFullscreenAction",
      title: "Show full experience button",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "fullscreenLabel",
      title: "Full experience button label",
      type: "string",
      initialValue: "Launch Poster Lab",
      hidden: ({ parent }) => parent?.showFullscreenAction === false,
    }),
  ],
  validation: (Rule) =>
    Rule.custom((value) => {
      const warnings = collectExperienceWarnings(
        value as ThreeExperienceValue | undefined,
      );
      const blocking = warnings.filter((warning) =>
        [
          "unknown_experience_key",
          "missing_experience_key",
          "missing_poster",
          "replay_requires_creation",
          "full_controls_in_preview",
          "unsupported_preset",
          "unsupported_mode",
          "audio_unsupported",
          "svg_unsupported",
          "text_editing_unsupported",
          "export_unsupported",
          "height_out_of_range",
          "embed_config_migration",
        ].includes(warning.code),
      );
      if (!blocking.length) return true;
      return blocking.map((warning) => warning.message).join(" · ");
    }),
  preview: {
    select: {
      experienceKey: "experienceKey",
      mode: "mode",
      preset: "initialPresetKey",
      loadBehavior: "loadBehavior",
      media: "posterImage.image",
      heading: "heading",
    },
    prepare({ experienceKey, mode, preset, loadBehavior, media, heading }) {
      const manifest = getExperienceManifest(experienceKey);
      const warnings = collectExperienceWarnings({
        experienceKey,
        mode,
        initialPresetKey: preset,
        posterImage: media ? { image: media } : undefined,
      });
      const warningLabel = warnings.length
        ? ` · ${warnings.length} warning${warnings.length === 1 ? "" : "s"}`
        : "";
      return {
        title: heading || manifest?.title || experienceKey || "3D experience",
        subtitle: `${mode || "mode?"} · ${preset || "no preset"} · ${loadBehavior || "interaction"}${warningLabel}`,
        media: media ?? CubeIcon,
      };
    },
  },
});
