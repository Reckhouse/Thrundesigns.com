# Security remediation rollout

This patch prevents new quotes from entering the public content dataset. Existing records remain exposed until an operator completes the migration below. Do not treat merging this patch as completion of the data remediation.

## Prepare the private quote store

1. In the Sanity project, create a separate dataset named `quotes` with **private** visibility. Do not change the public site's content dataset to private without preparing its read paths.
2. Grant a dedicated server-only token access to the private dataset for writes and dataset metadata reads. Set `QUOTE_SANITY_DATASET=quotes` and `QUOTE_SANITY_WRITE_TOKEN` in each Vercel environment accepting submissions. The write route checks Sanity's actual `aclMode` before writes; lack of metadata access fails closed.
3. Ensure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (or the KV aliases) are configured. Production requests return 503 if shared limits are unavailable, including Upstash timeouts.
4. Set a separately generated `QUOTE_ATTACHMENT_SECRET` of at least 32 characters, different from `QUOTE_FORM_SECRET`. Do not reuse the form secret. Existing operator sessions will require signing in again after rotation. Retain `QUOTE_READ_WRITE_TOKEN` for the private Blob store.
5. Set `SANITY_STUDIO_QUOTE_DATASET=quotes` for the Studio build. Its private-quotes workspace uses authenticated Sanity access. The public content workspace no longer includes quote submissions. Viewer credentials are no longer forwarded to preview browsers; Studio Presentation remains the supported live draft-preview flow. Standalone shared preview links will not receive live draft updates. Restrict content and quote tokens to their respective datasets wherever supported.

The submitter-facing form already handles service errors. Until the required private storage and Redis configuration exists, intake will return 503 rather than fall back to insecure storage. Make the configuration changes before deploying if continuous intake is required.

## Migrate existing submissions

Temporarily stop public quote intake at the edge while migrating, so the old deployment cannot create more exposed records. Supply a temporary migration token with access to both datasets via `QUOTE_MIGRATION_TOKEN` in an untracked environment file. Never put tokens in command arguments, source control, or Studio public variables.

From the repository root, with the variables above loaded:

```sh
node --env-file=.env.local scripts/migrate-private-quotes.mjs
node --env-file=.env.local scripts/migrate-private-quotes.mjs --apply
```

The first command displays counts only. The second copies records into the verified private dataset, preserves their IDs, verifies document contents, and retains the source records. It never prints customer data. Verify operator access in the private Studio workspace. Once the copies are verified, remove the public copies:

```sh
node --env-file=.env.local scripts/migrate-private-quotes.mjs --apply --remove-source
```

The removal mode re-verifies each destination and uses an atomic source revision check before deleting. Changed or mismatched documents stop the migration instead of being overwritten or removed. It is safe to rerun after a partial success once any conflicts have been resolved. The deletion flag is deliberately separate because it changes production data.

Deploy the application and Studio, re-enable intake, verify a test submission reaches only the private dataset, and confirm unauthenticated queries cannot read quote records. Review Sanity history/retention and access logs for the prior public copies; the script handles current documents, not provider backups or historical retention. Revoke the migration token afterwards.

## Application protections

- Next.js and `eslint-config-next` updated together; image processing uses an explicitly patched Sharp dependency. Compatible transitive overrides patch versions pinned by upstream tooling. Both lockfiles must be committed.
- JSON-LD escapes `<` before HTML insertion. Production CSP no longer permits JavaScript `eval`; `wasm-unsafe-eval` remains for graphics, and `unsafe-inline` remains for the existing static hydration architecture. A full nonce CSP migration is separate work because it changes rendering/caching behavior.
- Quote body bytes are counted before multipart decoding, including bodies without Content-Length. An early request limiter protects parsing and validation; CAPTCHA and attachment checks precede the sequential submission quotas. Rejected IP/email checks cannot consume the global quota. Configure the trusted reverse proxy to overwrite forwarded client-IP headers; this application is deployed on Vercel.
- Attachment filenames and MIME types must agree. Images are decoded and re-encoded with pixel limits; PDFs are structurally parsed with a page cap. These checks are not a malware scanner. Authenticated downloads always use `Content-Disposition: attachment`, `nosniff`, `no-store`, and a sandbox CSP. Notification links use the authenticated download endpoint.
- Unlock attempts have shared per-IP and global limits. POST redirects use 303 so browsers do not replay the password body. Only exact configured origins are accepted.

## Validation

Run `npm run test:security`, the existing tests, `npx tsc --noEmit`, and `npm run build`. Build the Studio separately with its private dataset variable. After deployment, verify quote submission, attachment download, draft previews, and image-heavy project pages with the configured services.

The migration is not executed by tests or builds. Neither a successful build nor a passing unit suite proves live dataset privacy or external configuration.
