# Thrun Design Co.

Dark editorial marketing site for Thrun Design Co.

**Production:** https://thrundesigns-com.vercel.app  
**Studio:** https://thrundesign.sanity.studio

## Stack

- Next.js App Router + React
- Tailwind CSS + shadcn/ui
- Sanity CMS (project `fbuy6kak`, dataset `production`)
- Framer Motion + Three.js (R3F) for motion / 3D accents
- Vercel hosting + Vercel Blob for quote attachments

## Local development

```bash
cp .env.example .env.local
# fill Sanity tokens + QUOTE_READ_WRITE_TOKEN (private Blob for attachments)
# for quote security (production): Turnstile, QUOTE_FORM_SECRET, Upstash Redis, Resend
npm install
npm run dev
```

## Quote form security

`POST /api/quote` is server-only and applies:

**P0 — application hardening**

- Strict Zod validation (enums + max lengths)
- Origin / Fetch Metadata checks
- Signed form token (min completion time + expiry)
- Honeypot field
- Cloudflare Turnstile (server Siteverify when keys are set)
- IP + email + global rate limits (Upstash when configured; in-memory fallback)
- Duplicate submission suppression (`sha256(email+projectType+message)`, 1h TTL)
- Attachment MIME + size checks

**P1 — edge + ops**

- Vercel Firewall on `POST /api/quote`: 3 req / 10 min by IP; exceed → **challenge**
- Redacted abuse events (`quote.rate_limited`, `quote.turnstile_failed`, …)
- Soft volume alerts at 40 / 80 / 120 accepted quotes per hour (`quote.volume_alert`)
- Hard global emergency cap: 150 accepted / hour

**P2 — notify + private storage**

- Sanity write first, then Resend notify (`quote.email_sent` / `quote.email_failed`)
- Fixed `To` + server subject; validated submitter email as `Reply-To` only
- No file attachments on the email (pathnames listed; download via private Blob token)
- Quote files go to a **private** Blob store (`QUOTE_READ_WRITE_TOKEN`, `access: "private"`)
- Unused client upload route removed (`/api/quote/upload`)

Required production env vars (see `.env.example`):

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY`
- `QUOTE_FORM_SECRET` (min 16 characters)
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
  (or Marketplace `KV_REST_API_URL` / `KV_REST_API_TOKEN`)
- `QUOTE_READ_WRITE_TOKEN` (private Blob store for quote attachments)
- `RESEND_API_KEY` / `QUOTE_NOTIFY_TO` / optional `QUOTE_NOTIFY_FROM`

### One-shot provision (CLI)

After `npx vercel login` and `npx wrangler login`:

```bash
chmod +x scripts/configure-quote-security.sh
./scripts/configure-quote-security.sh
npx vercel --prod --yes
```

This creates the Turnstile widget, sets env vars, installs Upstash when possible,
and publishes the Firewall rate-limit rule (challenge on exceed).

Studio (local package or hosted):

```bash
npm run studio:dev
# hosted: https://thrundesign.sanity.studio
```

## Vercel Blob

Public media (`thrundesign-media` → `BLOB_READ_WRITE_TOKEN`) for site assets.

Private quote attachments (`thrundesign-quote-private` → `QUOTE_READ_WRITE_TOKEN`):

```bash
vercel link --scope reckhouses-projects --project thrundesigns-com
vercel blob create-store thrundesign-quote-private --access private --yes
# connect store with env prefix QUOTE_ so token is QUOTE_READ_WRITE_TOKEN
vercel env pull .env.local
```

Redeploy after `QUOTE_READ_WRITE_TOKEN` is set. Quote uploads never use the
public media token.

## Resend (quote notify)

Marketplace Resend requires a **domain you own** plus a paid plan (`pro` /
`scale`). There is no free Marketplace SKU. Metadata is required in non-interactive CLI:

```bash
# Example once you own/verify a sending domain (e.g. thrundesign.com):
npx vercel integration add resend/resend-email \
  --name thrundesigns-quote-mail \
  --plan pro \
  -m domain=thrundesign.com \
  -m region=us-east-1 \
  -e production -e preview -e development
```

**Free-tier alternative (recommended until a custom domain is ready):** create an
API key at https://resend.com/api-keys and set it on the project:

```bash
printf '%s' '<your-resend-api-key>' | npx vercel env add RESEND_API_KEY production,preview --force --yes --sensitive
printf '%s' '<your-resend-api-key>' | npx vercel env add RESEND_API_KEY development --force --yes --no-sensitive
```

With the free key, keep `QUOTE_NOTIFY_FROM` as
`Thrun Design Co <onboarding@resend.dev>` (already set). Until a domain is
verified, Resend only delivers to the Resend account owner email — set
`QUOTE_NOTIFY_TO` to that address (not a different inbox).

`QUOTE_NOTIFY_TO` is already set. Notify runs only after Sanity stores the
submission. Missing Resend config logs `quote.email_skipped` and still returns
success to the client.

## Production URL

Using the Vercel production domain for now (no custom domain):

https://thrundesigns-com.vercel.app

Merge the site PR into `main` so that URL serves the full app (not the
scaffold initial commit). Custom domain `thrundesign.com` can be added later.

## Routes

- `/` — homepage
- `/work` — work index
- `/work/[slug]` — project detail
- `/quote` — multi-step quote form (optional Blob attachments)

## Quote form CMS (Studio)

In Sanity Studio under **Forms**:

- **Quote form** — page copy, field labels, and select options (project types,
  budgets, timelines). Option `value` slugs are what the API stores; change
  labels freely. Prefer disabling an option over deleting it so old submissions
  stay meaningful.
- **Quote submissions** — inbound briefs with triage `status`
  (`new` / `read` / `archived`). Newest first.

Code fallbacks in `src/lib/quote/form-config.ts` keep `/quote` working if the
singleton is missing. Linking project-type options to Services documents is
planned for a later pass.

## Design source

Figma handoff: Thrun Design Co. — Website (Student Plan), Version B Dark Editorial.
Breakpoints: Desktop 1440 · Tablet 768 · Mobile 390.
