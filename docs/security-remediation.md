# Security remediation rollout

Quote records and attachments use the existing private Vercel Blob store. Sanity remains the public content CMS; no paid private dataset is needed.

## Configuration and operator access

- `QUOTE_READ_WRITE_TOKEN` must belong to the private quote store, never the public media store. All writes and reads explicitly request private access.
- Keep the existing `KV_REST_API_URL` / `KV_REST_API_TOKEN` (or Upstash aliases) for shared production limits.
- `QUOTE_ATTACHMENT_SECRET` must be independently generated, at least 32 characters, and different from the form secret. Changes require a new deployment and invalidate old operator sessions.
- Quote JSON is stored under `quotes/records/` with opaque hashed identifiers. Each submission is an immutable object; attachments remain under `quotes/`.
- Authorized operators can browse and download records through the Vercel private store dashboard. Notification record links use the existing authenticated download route and operator unlock page. No public listing endpoint is provided.
- Quote records are no longer managed in Sanity Studio. No `QUOTE_SANITY_*` settings are required. Do not configure the optional legacy Studio quote dataset.

## Migration from public Sanity

Keep the old intake disabled until the new route is deployed. Run from `studio/` using `sanity exec scripts/migrate-quotes-to-blob.ts --with-user-token`, with the private Blob token loaded from an untracked environment file. This defaults to counts only. Add `-- --apply` to copy and verify; add `-- --apply --remove-source` to re-verify every complete original record and atomically delete the public sources with revision checks. Credentials and customer values are never logged. The user's existing Sanity CLI session supplies migration access; no persistent migration token is created.

Every original field, ID, revision, timestamp, and attachment reference is preserved in the JSON copy. Re-running never overwrites a conflicting destination. Verify anonymous Blob reads return 403 before removing sources; confirm the public quote count is zero afterwards. Provider history and backups are outside this migration's scope.

Production migration: three records copied and verified, all anonymous reads denied (403), then three public source records removed on 2026-09-12 UTC. Redis allowed the first isolated test request and denied the second within its configured test window.

## Application protections

- Next.js and `eslint-config-next` updated together; image processing uses an explicitly patched Sharp dependency. Compatible transitive overrides patch versions pinned by upstream tooling. Both lockfiles must be committed.
- JSON-LD escapes `<` before HTML insertion. Production CSP no longer permits JavaScript `eval`; `wasm-unsafe-eval` remains for graphics, and `unsafe-inline` remains for the existing static hydration architecture. A full nonce CSP migration is separate work because it changes rendering/caching behavior.
- Quote body bytes are counted before multipart decoding, including bodies without Content-Length. An early request limiter protects parsing and validation; CAPTCHA and attachment checks precede the sequential submission quotas. Rejected IP/email checks cannot consume the global quota. Configure the trusted reverse proxy to overwrite forwarded client-IP headers; this application is deployed on Vercel.
- Attachment filenames and MIME types must agree. Images are decoded and re-encoded with pixel limits; PDFs are structurally parsed with a page cap. These checks are not a malware scanner. Authenticated downloads always use `Content-Disposition: attachment`, `nosniff`, `no-store`, and a sandbox CSP. Notification links use the authenticated download endpoint.
- Unlock attempts have shared per-IP and global limits. POST redirects use 303 so browsers do not replay the password body. Only exact configured origins are accepted.

## Validation

Run `npm run test:security`, the existing tests, `npx tsc --noEmit`, and `npm run build`. After deployment, verify quote submission, authenticated downloads, and private Blob access with the configured services.

The migration is not executed by tests or builds. Neither a successful build nor a passing unit suite proves live storage privacy or external configuration.
