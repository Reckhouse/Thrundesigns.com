import { Badge, Box, Card, Flex, Stack, Text } from "@sanity/ui";
import type { PreviewProps } from "sanity";
import { getExperienceManifest } from "../lib/experienceManifestOptions";
import {
  collectExperienceWarnings,
  type ThreeExperienceValue,
} from "../lib/experienceValidation";

type ExperiencePreviewProps = PreviewProps & {
  value?: ThreeExperienceValue & { loadBehavior?: string };
};

/**
 * Static Studio preview for interactive experiences.
 * Does not initialize Three.js / WebGL.
 */
export function ThreeExperiencePreview(props: ExperiencePreviewProps) {
  const value = props.value;
  const warnings = collectExperienceWarnings(value);
  const manifest = getExperienceManifest(value?.experienceKey);
  const title =
    value?.experienceKey && manifest
      ? manifest.title
      : value?.experienceKey || "Interactive 3D experience";
  const mode = value?.mode || "—";
  const preset = value?.initialPresetKey || "—";
  const loadHint = value?.loadBehavior || "interaction";

  return (
    <Card padding={3} radius={0} shadow={0} tone="transparent" border>
      <Flex align="flex-start" gap={3}>
        <Box flex={1}>
          <Stack space={3}>
            <Flex align="center" gap={2} wrap="wrap">
              <Text size={1} weight="semibold">
                {title}
              </Text>
              <Badge tone={warnings.length ? "caution" : "primary"} fontSize={0}>
                {warnings.length ? "Needs attention" : "Ready"}
              </Badge>
            </Flex>
            <Text size={1} muted>
              Mode: {mode} · Preset: {preset} · Load: {loadHint}
            </Text>
            {manifest ? (
              <Text size={0} muted>
                Package {manifest.packageVersion} · embed v
                {manifest.embedConfigVersion} · state v
                {manifest.stateSchemaVersion}
              </Text>
            ) : null}
            {warnings.length ? (
              <Stack space={2}>
                {warnings.map((warning) => (
                  <Text key={warning.code} size={1} style={{ color: "#b36b00" }}>
                    {warning.message}
                  </Text>
                ))}
              </Stack>
            ) : (
              <Text size={1} muted>
                Static preview — the live WebGL renderer is not loaded in Studio.
              </Text>
            )}
          </Stack>
        </Box>
        {props.imageUrl ? (
          <Box style={{ width: 56, height: 56, overflow: "hidden" }}>
            <img
              src={props.imageUrl}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Box>
        ) : null}
      </Flex>
    </Card>
  );
}
