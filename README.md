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
# fill Sanity tokens + BLOB_READ_WRITE_TOKEN
npm install
npm run dev
```

Studio (local package or hosted):

```bash
npm run studio:dev
# hosted: https://thrundesign.sanity.studio
```

## Vercel Blob (quote uploads)

Create a Blob store in the Vercel dashboard (Storage → Blob) and connect it to
project `thrundesigns-com`, or via CLI:

```bash
vercel link --scope reckhouses-projects --project thrundesigns-com
vercel blob create-store thrundesign-media --access public --yes
vercel env pull .env.local
```

Redeploy after `BLOB_READ_WRITE_TOKEN` is set.

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

## Design source

Figma handoff: Thrun Design Co. — Website (Student Plan), Version B Dark Editorial.
Breakpoints: Desktop 1440 · Tablet 768 · Mobile 390.
