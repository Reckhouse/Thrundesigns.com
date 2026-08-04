#!/usr/bin/env node
/**
 * validate-experience-compatibility
 *
 * Checks that every registered experience key has a matching manifest,
 * that server-safe modules do not import Three.js, package exports resolve,
 * marketing routes do not import experience loaders, CSP helpers exist,
 * and required docs are present.
 */

import { createRequire } from "node:module";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function fail(message) {
  errors.push(message);
  console.error(`FAIL  ${message}`);
}

function ok(message) {
  console.log(`OK    ${message}`);
}

function walkTsFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === "dist") continue;
      walkTsFiles(full, acc);
    } else if (/\.(ts|tsx|mts|mjs|js)$/.test(name) && !name.endsWith(".d.ts")) {
      acc.push(full);
    }
  }
  return acc;
}

const FORBIDDEN_SERVER_IMPORT =
  /from\s+["'](three|@react-three\/fiber|@react-three\/drei)["']|require\(["'](three|@react-three\/fiber|@react-three\/drei)["']\)/;

const EXPERIENCE_REACT_IMPORT =
  /@thrun-design\/controlled-chaos\/react(?:-preview|-replay)?/;

const serverSafePaths = [
  join(root, "src/experiences/registry.server.ts"),
  join(root, "src/experiences/compatibility.ts"),
  join(root, "src/experiences/types.ts"),
  join(root, "src/experiences/manifest-options.ts"),
  join(root, "src/experiences/mapSanityExperienceConfig.ts"),
  join(root, "src/experiences/controlled-chaos/parseLabSearchParams.ts"),
  join(root, "src/experiences/controlled-chaos/persistenceAdapter.ts"),
  join(root, "src/experiences/controlled-chaos/analyticsAdapter.ts"),
  join(root, "packages/controlled-chaos/src/manifest.ts"),
  join(root, "packages/controlled-chaos/src/schemas.ts"),
  join(root, "studio/lib/experienceManifestOptions.ts"),
  join(root, "studio/lib/experienceValidation.ts"),
  join(root, "studio/schemaTypes/blocks/projectThreeExperience.ts"),
  join(root, "studio/components/ThreeExperiencePreview.tsx"),
  join(root, "src/lib/security-headers.ts"),
  join(root, "src/lib/safe-meta.ts"),
];

for (const file of serverSafePaths) {
  if (!existsSync(file)) {
    fail(`Missing server-safe file: ${relative(root, file)}`);
    continue;
  }
  const source = readFileSync(file, "utf8");
  if (FORBIDDEN_SERVER_IMPORT.test(source)) {
    fail(`Server-safe module imports Three.js/R3F: ${relative(root, file)}`);
  } else {
    ok(`No Three.js import in ${relative(root, file)}`);
  }
}

const pkgName = "@thrun-design/controlled-chaos";
try {
  const pkgJsonPath = require.resolve(`${pkgName}/package.json`);
  const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
  ok(`Resolved ${pkgName}@${pkg.version}`);

  const requiredExports = [
    "./manifest",
    "./schemas",
    "./react-preview",
    "./react",
    "./react-replay",
  ];
  for (const entry of requiredExports) {
    if (!pkg.exports?.[entry]) {
      fail(`Missing package export ${entry}`);
    } else {
      ok(`Export map includes ${entry}`);
    }
  }
} catch (error) {
  fail(`Cannot resolve ${pkgName}: ${error.message}`);
}

const registryUrl = pathToFileURL(
  join(root, "src/experiences/registry.server.ts"),
).href;

try {
  const registrySource = readFileSync(
    join(root, "src/experiences/registry.server.ts"),
    "utf8",
  );
  if (!registrySource.includes('"controlled-chaos-poster-lab"')) {
    fail('Registry does not register "controlled-chaos-poster-lab"');
  } else {
    ok('Registry registers "controlled-chaos-poster-lab"');
  }

  const manifestSource = readFileSync(
    join(root, "packages/controlled-chaos/src/manifest.ts"),
    "utf8",
  );
  if (!manifestSource.includes('experienceKey: "controlled-chaos-poster-lab"')) {
    fail("Stub manifest experienceKey mismatch");
  } else {
    ok("Stub manifest experienceKey matches registry");
  }

  if (!manifestSource.includes("presets:")) {
    fail("Stub manifest missing presets");
  } else {
    ok("Stub manifest defines presets");
  }

  void registryUrl;
} catch (error) {
  fail(`Registry inspection failed: ${error.message}`);
}

const clientRegistry = readFileSync(
  join(root, "src/experiences/registry.client.ts"),
  "utf8",
);
if (!clientRegistry.includes("@thrun-design/controlled-chaos/react")) {
  fail("Client registry missing Controlled Chaos react loader");
} else {
  ok("Client registry defines Controlled Chaos loaders");
}

const experienceDir = join(root, "src/experiences");
for (const file of walkTsFiles(experienceDir)) {
  if (file.endsWith("registry.client.ts")) continue;
  const source = readFileSync(file, "utf8");
  if (EXPERIENCE_REACT_IMPORT.test(source)) {
    fail(
      `Experience dynamic import leaked outside client registry: ${relative(root, file)}`,
    );
  }
}

const marketingBoundaries = [
  join(root, "src/app/page.tsx"),
  join(root, "src/app/work/page.tsx"),
];

for (const file of marketingBoundaries) {
  const source = readFileSync(file, "utf8");
  if (EXPERIENCE_REACT_IMPORT.test(source) || source.includes("registry.client")) {
    fail(
      `Marketing route imports experience loaders: ${relative(root, file)}`,
    );
  } else {
    ok(`Marketing route stays free of experience loaders: ${relative(root, file)}`);
  }
}

const assetDir = join(root, "public/experiences/controlled-chaos");
if (!existsSync(assetDir)) {
  fail("Missing asset base directory public/experiences/controlled-chaos");
} else {
  ok("Asset base directory exists");
}

const cspSource = readFileSync(join(root, "src/lib/security-headers.ts"), "utf8");
if (
  !cspSource.includes("Content-Security-Policy") &&
  !cspSource.includes("buildContentSecurityPolicy")
) {
  fail("CSP helper missing buildContentSecurityPolicy");
} else {
  ok("CSP helper present");
}

const nextConfig = readFileSync(join(root, "next.config.ts"), "utf8");
if (!nextConfig.includes("securityHeaders")) {
  fail("next.config.ts does not apply securityHeaders");
} else {
  ok("next.config.ts applies security headers");
}

const requiredDocs = [
  "docs/three-experience-cms/repository-audit.md",
  "docs/three-experience-cms/architecture.md",
  "docs/three-experience-cms/integration-contract-review.md",
  "docs/three-experience-cms/authoring-guide.md",
  "docs/three-experience-cms/package-upgrade-guide.md",
  "docs/three-experience-cms/performance-report.md",
  "docs/three-experience-cms/accessibility-report.md",
  "docs/three-experience-cms/browser-report.md",
  "docs/three-experience-cms/csp.md",
  "docs/three-experience-cms/launch-checklist.md",
];

for (const doc of requiredDocs) {
  if (!existsSync(join(root, doc))) {
    fail(`Missing doc: ${doc}`);
  } else {
    ok(`Doc present: ${doc}`);
  }
}

if (errors.length) {
  console.error(`\n${errors.length} compatibility check(s) failed.`);
  process.exit(1);
}

console.log("\nAll experience compatibility checks passed.");
