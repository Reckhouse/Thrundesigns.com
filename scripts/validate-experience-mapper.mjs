/**
 * Lightweight fixture runner for mapSanityExperienceConfig.
 * Invoked by: node --import tsx scripts/validate-experience-mapper.mjs
 * (or via npm run validate:experiences after the source checks).
 */

import { mapSanityExperienceConfig } from "../src/experiences/mapSanityExperienceConfig.ts";
import {
  invalidEmbedVersionFixture,
  invalidReplayMissingCreationFixture,
  invalidUnknownExperienceFixture,
  invalidUnsupportedPresetFixture,
  validControlledChaosInlineFixture,
  validControlledChaosPreviewFixture,
} from "../src/experiences/__fixtures__/controlled-chaos.ts";
import {
  validLivingEngravingInlineFixture,
  validLivingEngravingPreviewFixture,
} from "../src/experiences/__fixtures__/living-engraving.ts";
import {
  validCounterspaceInlineFixture,
  validCounterspacePreviewFixture,
} from "../src/experiences/__fixtures__/counterspace.ts";

const errors = [];

function assert(condition, message) {
  if (!condition) {
    errors.push(message);
    console.error(`FAIL  ${message}`);
  } else {
    console.log(`OK    ${message}`);
  }
}

const validPreview = mapSanityExperienceConfig(validControlledChaosPreviewFixture);
assert(validPreview.ok === true, "valid preview maps successfully");
if (validPreview.ok) {
  assert(
    validPreview.value.experienceKey === "controlled-chaos-poster-lab",
    "preview keeps experience key",
  );
  assert(
    validPreview.value.launchUrl.startsWith("/lab/controlled-chaos"),
    "preview builds launch URL",
  );
  assert(
    validPreview.value.launchUrl.includes("mode=inline"),
    "preview fullscreen launch opens full lab (inline), not embed preview",
  );
  assert(
    !validPreview.value.launchUrl.includes("mode=preview"),
    "preview fullscreen launch does not leak mode=preview",
  );
  assert(
    validPreview.value.presentation.loadBehavior === "interaction",
    "preview keeps load behavior",
  );
  assert(
    !("posterImage" in validPreview.value.configuration),
    "raw posterImage is not passed into package configuration",
  );
}

const validInline = mapSanityExperienceConfig(validControlledChaosInlineFixture);
assert(validInline.ok === true, "valid inline maps successfully");
if (validInline.ok) {
  assert(
    validInline.value.configuration.controls === "full",
    "inline allows full controls",
  );
  assert(
    validInline.value.configuration.allowExport === true,
    "inline capability flags are preserved",
  );
}

const unknown = mapSanityExperienceConfig(invalidUnknownExperienceFixture);
assert(unknown.ok === false, "unknown experience key fails");
assert(
  !unknown.ok && unknown.code === "unknown_experience_key",
  "unknown experience returns unknown_experience_key",
);

const badPreset = mapSanityExperienceConfig(invalidUnsupportedPresetFixture);
assert(badPreset.ok === false, "unsupported preset fails");

const replay = mapSanityExperienceConfig(invalidReplayMissingCreationFixture);
assert(replay.ok === false, "replay without creation ID fails");

const embedVersion = mapSanityExperienceConfig(invalidEmbedVersionFixture);
assert(embedVersion.ok === false, "unsupported embed version fails");

const empty = mapSanityExperienceConfig(null);
assert(empty.ok === false, "null configuration fails");

const livingPreview = mapSanityExperienceConfig(validLivingEngravingPreviewFixture);
assert(livingPreview.ok === true, "living engraving preview maps successfully");
if (livingPreview.ok) {
  assert(
    livingPreview.value.experienceKey === "living-engraving-horse",
    "living engraving keeps experience key",
  );
  assert(
    livingPreview.value.launchUrl.startsWith("/lab/living-engraving"),
    "living engraving builds launch URL",
  );
}

const livingInline = mapSanityExperienceConfig(validLivingEngravingInlineFixture);
assert(livingInline.ok === true, "living engraving inline maps successfully");

const counterspacePreview = mapSanityExperienceConfig(
  validCounterspacePreviewFixture,
);
assert(counterspacePreview.ok === true, "counterspace preview maps successfully");
if (counterspacePreview.ok) {
  assert(
    counterspacePreview.value.experienceKey ===
      "counterspace-field-laboratory",
    "counterspace keeps experience key",
  );
  assert(
    counterspacePreview.value.launchUrl.startsWith("/lab/counterspace"),
    "counterspace builds launch URL",
  );
  assert(
    counterspacePreview.value.launchUrl.includes("mode=inline"),
    "counterspace fullscreen launch opens full lab (inline)",
  );
}

const counterspaceInline = mapSanityExperienceConfig(
  validCounterspaceInlineFixture,
);
assert(counterspaceInline.ok === true, "counterspace inline maps successfully");

if (errors.length) {
  console.error(`\n${errors.length} mapper fixture check(s) failed.`);
  process.exit(1);
}

console.log("\nAll mapper fixture checks passed.");
