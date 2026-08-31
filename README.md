# Thrun Design Co.

Dark editorial marketing site for Thrun Design Co.

**Production:** https://www.thrundesigns.com  
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

https://www.thrundesigns.com

Merge the site PR into `main` so that URL serves the full app (not the
scaffold initial commit). Custom domain `thrundesign.com` can be added later.

## Hero horse particles (Living Engraving)

Desktop hero includes a restrained WebGL particle horse head (React Three
Fiber + custom shaders + GSAP) staged across the full hero:

- Edge-weighted “engraving” bake (~9k); stone / bronze / gold accent mix
- Micro tilt + surface tension near the silhouette only (no explode)
- Haze entrance, scroll recession, CTA-linked gold rim highlight
- Adaptive particle tiers; pauses offscreen / hidden tab
- Hidden below `lg`; static engraved pose when `prefers-reduced-motion` is set

Source art: `public/images/horse-head.png`  
Particle bake: `node scripts/bake-horse-particles.mjs` → `public/data/horse-particles*`

## Routes

- `/` — homepage
- `/work` — work index
- `/work/[slug]` — project detail
- `/quote` — multi-step quote form (optional Blob attachments)
- `/quote?type=brand|website|audit|print|mixed` — prefills project type
- `/sitemap.xml` / `/robots.txt` — SEO discovery

Service CTAs on the homepage deep-link into `/quote?type=…` so the project
step starts with the matching offer selected.

## Quote form CMS (Studio)

In Sanity Studio under **Forms**:

- **Quote form** — page copy, field labels, and select options (project types,
  budgets, timelines). Option `value` slugs are what the API stores; change
  labels freely. Prefer disabling an option over deleting it so old submissions
  stay meaningful.
- **Quote submissions** — inbound briefs with triage `status`
  (`new` / `read` / `archived`). Newest first.

Code fallbacks in `src/lib/quote/form-config.ts` keep `/quote` working if the
singleton is missing.

Project-type options may optionally reference a **Service** document. The option
`value` slug is still what the form submits; the Service link adds summary copy
on `/quote`, a `service` reference on new submissions, and a Service line in the
notify email. Options like Mixed can stay unlinked.

### Private attachment downloads

Quote files stay in the private Blob store. Operators get short-lived signed URLs:

- Notify email includes signed download links (~1 hour) when files are attached
- Studio **Quote submissions → Attachments → Download** opens
  `/quote-attachments` on the site; enter `QUOTE_ATTACHMENT_SECRET` once to unlock
  a 1-hour browser session (httpOnly cookie), then redirect to a signed Blob URL

Studio env (public site URL only — never put the secret in Studio):

```bash
SANITY_STUDIO_SITE_URL=https://www.thrundesigns.com
```

`QUOTE_ATTACHMENT_SECRET` (min 16 chars) defaults to `QUOTE_FORM_SECRET` when unset.

## Visual Editing (Presentation)

Sanity Presentation Tool embeds the production (or local) site with Draft Mode so
editors can click content and jump to the matching field.

**Site (Next.js)**

- `SANITY_API_READ_TOKEN` — Viewer token (server-only)
- Routes: `/api/draft-mode/enable`, `/api/draft-mode/disable`
- When Draft Mode is on, the root layout mounts `<VisualEditing />` and an
  “Exit draft mode” control (hidden inside Presentation)

**Studio**

- `presentationTool` in `studio/sanity.config.ts`
- Preview origin: `SANITY_STUDIO_PREVIEW_ORIGIN` or `SANITY_STUDIO_SITE_URL`
  (defaults to the Vercel production URL)
- Locations resolve for Home, Site settings, Projects, Services, Process steps,
  and Quote form

**CORS** (Sanity Manage → API → CORS origins): allow the site origin and
`http://localhost:3000` with **Allow credentials** enabled so Presentation can
fetch drafts.

Redeploy Studio after changing Presentation config:

```bash
# Use a human Sanity login token for deploy (not a robot CI token)
cd studio && npx sanity deploy
```

## Design source

Figma handoff: Thrun Design Co. — Website (Student Plan), Version B Dark Editorial.
Breakpoints: Desktop 1440 · Tablet 768 · Mobile 390.
