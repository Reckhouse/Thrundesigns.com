# Package upgrade guide — Three.js experiences

How to upgrade `@thrun-design/controlled-chaos` (or add a new experience package) without breaking case studies or saved creations.

## Upgrade sequence

1. Update the package version (`package.json` / lockfile).
2. Inspect **manifest** changes (experience key, presets, capabilities, versions).
3. Inspect **state schema** changes (`stateSchemaVersion`).
4. Inspect **embed config** changes (`embedConfigVersion`).
5. Run `npm run validate:experiences`.
6. Run Sanity schema validation / Studio build (`npm --prefix studio run build`).
7. Run production build (`npm run build` with required env).
8. Spot-check existing project content in Studio (presets, warnings).
9. Spot-check saved creations (`/creation/[id]`) for unsupported state versions.
10. Deploy a preview.
11. Approve production.

## Stub → real Controlled Chaos

Today the app depends on `file:packages/controlled-chaos` (`0.0.0-stub`).

When the real package is ready:

1. Publish or link the real package with the **same export map**:
   - `./manifest`
   - `./schemas`
   - `./react-preview`
   - `./react`
   - `./react-replay`
2. Keep experience key `controlled-chaos-poster-lab` unless you intentionally migrate CMS content.
3. Re-run `docs/three-experience-cms/integration-contract-review.md` against actual exports.
4. Bump `embedConfigVersion` / `stateSchemaVersion` only when shapes change; migrate CMS values and creations accordingly.
5. Point Studio at the same package (manifest/schemas only — never load the renderer in Studio forms).

## Add a future Three.js project

1. Ship a package with the same contract shape (manifest + schemas + loaders).
2. Register it in:
   - `src/experiences/registry.server.ts`
   - `src/experiences/registry.client.ts`
   - `studio/lib/experienceManifestOptions.ts` (`installedExperienceManifests`)
3. Add a lab route if fullscreen is required (`/lab/[experience]`).
4. Extend creations validation if the creation schema differs.
5. Run `npm run validate:experiences` and a production build.

Do not scatter dynamic imports across pages — the client registry is the only loader map.

## Compatibility script

```bash
npm run validate:experiences
```

Checks:

- Server-safe modules do not import Three.js / R3F
- Package export map is complete
- Registry keys match manifests
- Mapper fixtures pass
- Required docs exist
- CSP helper is present
- Homepage / work index do not import experience React loaders
- Asset placeholder directory exists
