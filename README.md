# Thrun Design Co. — thrundesign.com

Dark editorial marketing site for Thrun Design Co.

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

```bash
vercel link --scope reckhouses-projects --project thrundesigns-com
vercel blob create-store thrundesign-media --access public --yes
vercel env pull .env.local
```

## Domain

`thrundesign.com` is available to register on Vercel (~$11.25/yr). After purchase:

```bash
vercel domains add thrundesign.com --scope reckhouses-projects
# then attach to project thrundesigns-com in the dashboard if needed
```

## Routes

- `/` — homepage
- `/work` — work index
- `/work/[slug]` — project detail
- `/quote` — multi-step quote form (optional Blob attachments)

## Design source

Figma handoff: Thrun Design Co. — Website (Student Plan), Version B Dark Editorial.
Breakpoints: Desktop 1440 · Tablet 768 · Mobile 390.
