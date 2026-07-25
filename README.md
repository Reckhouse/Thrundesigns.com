# Thrun Design Co. — thrundesign.com

Dark editorial marketing site for Thrun Design Co.

## Stack

- Next.js App Router + React
- Tailwind CSS + shadcn/ui
- Sanity CMS (project `fbuy6kak`, dataset `production`)
- Framer Motion + Three.js (R3F) for motion / 3D accents
- Vercel hosting + Vercel Blob for media/uploads

## Local development

```bash
cp .env.example .env.local
# fill Sanity + Blob tokens
npm install
npm run dev
```

Studio (separate package):

```bash
cd studio
npm install
npm run dev
```

## Routes

- `/` — homepage
- `/work` — work index
- `/work/[slug]` — project detail
- `/quote` — multi-step quote form

## Design source

Figma handoff: Thrun Design Co. — Website (Student Plan), Version B Dark Editorial.
