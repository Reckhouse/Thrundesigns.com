# SEO Audit: thrundesigns.com

**Date:** September 4, 2026  
**Site:** https://www.thrundesigns.com  
**Goal:** Improve Google ranking for Colorado Springs queries in:

- Graphic design  
- Website design / development  
- Branding / brand identity  
- Startup businesses looking for design help  

**Method:** Live crawl of key URLs, metadata/schema/sitemap review, content keyword analysis, competitor SERP sampling, and codebase review of current SEO implementation.

---

## Executive summary

Thrun Design Co. has a **solid technical base** (HTTPS, www canonicalization, robots/sitemap, service architecture, Organization schema, privacy/accessibility trust pages). It is **not yet competitive for Colorado Springs local intent**.

Local competitors (720MEDIA, Strottner Designs, Born Movement, Ellie Brown Branding, Peak Brand Collective, Due West Design) win those queries because they:

1. Put **city + service** in titles, H1s, and body copy  
2. Claim a **Colorado Springs / Front Range** presence clearly  
3. Maintain **Google Business Profiles**, citations, and reviews  
4. Publish **service + location** pages that match how people search  

On thrundesigns.com today:

| Signal | Status |
| --- | --- |
| Technical crawlability | Strong |
| Service page architecture | Good foundation |
| Colorado Springs as *studio location* | Missing / weak |
| “Graphic design” language | Essentially absent |
| “Startup” language | Essentially absent |
| LocalBusiness / geo schema | Missing |
| Google Business Profile | Not verified on-site (assume needed) |
| Real local case studies | Mostly concept work |

**Bottom line:** Ranking growth in Colorado Springs will come less from more CSS polish and more from **local entity clarity + keyword-aligned pages + proof (reviews, real clients, GBP)**.

---

## Target keyword map

Use these as primary page targets (one primary intent per URL).

### Colorado Springs — core money terms

| Intent | Example queries | Recommended landing URL |
| --- | --- | --- |
| Branding | `branding agency Colorado Springs`, `brand identity designer Colorado Springs` | `/services/brand-identity` + `/colorado-springs/branding` |
| Web design | `web design Colorado Springs`, `website design Colorado Springs` | `/services/web-design` + `/colorado-springs/web-design` |
| Web development | `website development Colorado Springs`, `Next.js web design Colorado Springs` | fold into web-design page; optional `/colorado-springs/website-development` later |
| Graphic design | `graphic design Colorado Springs`, `graphic designer Colorado Springs` | new `/services/graphic-design` or expand print-digital + local page |
| Startups | `startup branding Colorado Springs`, `startup website design Colorado Springs` | `/startups` hub + local variants |

### National / remote founder terms (secondary)

- `brand identity for startups`  
- `website design for founders`  
- `brand system for growing businesses`  

These match current site voice. Keep them, but **do not let them replace local pages**.

---

## What’s working

### Technical SEO

- Apex `thrundesigns.com` **308 →** `www.thrundesigns.com`  
- Canonical tags present on crawled pages  
- `robots.txt` allows marketing routes; blocks `/api/`, `/creation/`, `/capture/`  
- Sitemap includes home, about, quote, privacy, accessibility, 4 services, 8 work URLs  
- Security headers / HSTS present  
- Open Graph image endpoint exists  

### Information architecture

- Distinct service URLs:  
  - `/services/brand-identity`  
  - `/services/web-design`  
  - `/services/marketing-audit`  
  - `/services/print-digital`  
- About, Work, Quote, Privacy, Accessibility  
- Internal links from services → related concept studies  

### Structured data (baseline)

Homepage emits:

- `Organization`  
- `WebSite`  
- `ProfessionalService`  

Work project pages support CreativeWork + BreadcrumbList in code.

### Trust / compliance

- Privacy + Accessibility policies  
- Cookie consent  
- Honest labeling of concept/speculative work (good for EEAT honesty; weak for commercial proof)

---

## Critical gaps (fix blockers)

### 1) Homepage title is too weak in production

**Live title today:** `Thrun Design Co.`  

**Code default:** `Brand & Web Design for Growing Businesses | Thrun Design Co.`  

Sanity homepage SEO title is overriding the stronger default. For local growth, production should prefer something like:

> Brand & Web Design in Colorado Springs | Thrun Design Co.

or keep the national angle **and** add a local subhead/meta that names the city.

**Action:** Update Sanity `home.seo.title` / description, or stop letting a thin CMS title replace the keyword-rich default.

### 2) Colorado Springs is not positioned as your market

Live keyword scan:

- “Colorado Springs” appears mainly as an **industry tag on Juniper & Stone concept cards**  
- About page service area says **United States / primarily remote** — no Colorado Springs claim  
- Schema `areaServed` is `"US"` only  
- No `LocalBusiness`, address, geo, phone, or `areaServed: Colorado Springs`  

Google cannot confidently treat you as a Colorado Springs design studio from the site alone.

**Action:** Explicitly state: based in / serving Colorado Springs & Front Range, also remote nationwide.

### 3) Missing search language people actually use

Across main pages:

| Phrase | Presence |
| --- | --- |
| graphic design | ~0 |
| website development / web development | ~0 |
| startup / startups | ~0 |
| Colorado Springs (as service area claim) | ~0 (only project tags) |
| branding | rare |
| web design | present but not localized |

Competitors put these phrases in titles and first paragraphs.

### 4) No location landing pages

There is no URL that matches:

- `/colorado-springs/web-design`  
- `/colorado-springs/branding`  
- `/colorado-springs/graphic-design`  
- `/startups`  

Without these, you are competing for head terms with thinner on-page relevance than local agencies.

### 5) EEAT / proof gap

- Work index title: **Concept studies**  
- About admits public studies are speculative until real clients replace them  
- No visible reviews, testimonials, or Google rating markup  
- No founder bio with Colorado Springs ties, credentials, or local client names  

Honesty is good. For ranking, you still need **real proof assets** as soon as ethically possible.

### 6) Service FAQs exist but are not marked up

Service pages include FAQ sections in content, but no `FAQPage` JSON-LD was detected. That leaves snippet/AEO upside unused.

### 7) Off-site local SEO not represented on-site

No visible:

- Google Business Profile embed / review CTA  
- Consistent NAP (Name, Address, Phone) in footer  
- Local citation links (Chamber, Clutch, Houzz, DesignRush, etc.)  

For Maps / “near me” / city-modifier queries, **GBP + reviews often outweigh on-page tweaks**.

---

## Page-by-page findings

| URL | Title (live) | Issue vs goal |
| --- | --- | --- |
| `/` | Thrun Design Co. | No city/service in title; H1 is brand-poetic, not search-aligned |
| `/about` | About the studio · … | No Colorado Springs; thin (~300 words); remote-first framing |
| `/services/brand-identity` | Brand identity & system design · … | Good service page; not localized; no “graphic design” bridge; no FAQ schema |
| `/services/web-design` | Strategic web design · … | Missing “Colorado Springs”, “website development”, startups |
| `/services/print-digital` | Print & digital campaign design · … | Closest to graphic design, but never says “graphic design” |
| `/services/marketing-audit` | Brand & marketing audit · … | Useful mid-funnel; secondary for local ranking |
| `/work` | Concept studies · … | Undercuts commercial EEAT; Colorado Springs only via project tags |
| `/quote` | Request a quote · … | Conversion page; fine. Add trust line: Colorado Springs / startups welcome |

---

## Competitor pattern (what you’re up against)

Local sites that rank for city + service typically include:

1. **Title formula:** `{Service} in Colorado Springs | {Brand}`  
2. **H1 formula:** `{Service} for Colorado Springs businesses`  
3. **First 100 words:** city + who you help + what you deliver  
4. **Proof:** local clients, reviews, photos, map  
5. **Internal links:** services ↔ location pages ↔ contact  

Examples of this pattern in-market: 720MEDIA, Strottner Designs, Born Movement, Ellie Brown Branding.

Your craft and site quality can compete. Your **local topical footprint cannot—yet**.

---

## Prioritized action plan

### P0 — Do first (highest ranking leverage)

1. **Claim / optimize Google Business Profile (Colorado Springs)**  
   - Categories: Graphic Designer, Website Designer, Marketing Agency (pick primary carefully)  
   - Services: Branding, Web Design, Graphic Design, Startup Brand Systems  
   - Service area: Colorado Springs, Monument, Fountain, Pueblo, Denver remote as needed  
   - Weekly posts + photo uploads  
   - Ask every happy client for a Google review  

2. **Fix homepage SEO in Sanity**  
   - Title with brand + web design (+ Colorado Springs if accurate)  
   - Meta description naming founders/startups + Colorado Springs / Front Range  
   - Visible homepage line: “Brand & web design studio serving Colorado Springs and remote clients nationwide.”

3. **Rewrite About service-area block**  
   - Lead with Colorado Springs base / local availability  
   - Keep nationwide remote as secondary  
   - Add founder/studio bio, photo, and plain-language expertise  

4. **Upgrade Organization / ProfessionalService schema**  
   - `areaServed`: Colorado Springs, El Paso County, Colorado, United States  
   - Add `address` (even suite/shared studio or city-level if no public street)  
   - Add `telephone` and sameAs (Instagram, LinkedIn, Behance, GBP URL)  
   - Consider `@type`: `ProfessionalService` with `priceRange` optional  

5. **Add NAP to footer**  
   - Thrun Design Co. · Colorado Springs, CO · phone · email/quote link  
   - Exact same string everywhere (site, GBP, citations)

### P1 — Content & architecture (build topical authority)

6. **Create a Colorado Springs hub + 3 service landers**

   Suggested IA:

   - `/colorado-springs` — hub for local brand  
   - `/colorado-springs/branding`  
   - `/colorado-springs/web-design`  
   - `/colorado-springs/graphic-design`  

   Each page needs: unique H1, 800–1,200+ useful words, FAQs, local examples, CTA to `/quote`, links to portfolio.

7. **Create a Startups hub**

   - `/startups` — “Brand & website systems for startups and early-stage founders”  
   - Sections: when to brand, MVP site vs marketing site, audit-first path, quote CTA  
   - Internal links from brand-identity + web-design pages  

8. **Localize existing service pages (without stuffing)**  
   Add a short “Serving Colorado Springs & remote founders” section + FAQ:  
   - “Do you work with Colorado Springs startups?”  
   - “Do you offer graphic design as well as branding systems?”  
   - “Can you develop the website, not only design it?”

9. **Bridge “graphic design” language**  
   Either:  
   - Expand `/services/print-digital` into “Graphic & campaign design”, or  
   - Add `/services/graphic-design` focused on logos, collateral, packaging, launch kits  

10. **Add FAQPage JSON-LD** on service + local pages  

### P2 — Proof, AEO, and growth systems

11. **Replace concept studies with real case studies as they ship**  
    Especially any Colorado Springs / Front Range clients. Keep concept work, but demote it.

12. **Publish 4–6 answer-style articles** (blog or `/guides`) aimed at AI Overviews + long-tail:
    - “What a startup brand identity should include before launch”  
    - “Website design cost guide for Colorado Springs small businesses”  
    - “Brand vs logo: what growing companies actually need”  
    - “How to brief a designer for a rebrand”  
    - “Should a startup hire a branding agency or freelancer?”

13. **Citation / directory build** (consistent NAP):
    - Google Business Profile  
    - Apple Business Connect  
    - Bing Places  
    - Colorado Springs Chamber / local directories  
    - Clutch / DesignRush / Sortlist (selectively)

14. **Measure**
    - Keep GA4 (`G-GY7PYLXGWF`) + Search Console property for `www.thrundesigns.com`  
    - Track queries: brand, web design, graphic design, startup + Colorado Springs  
    - Create a Looker/Sheets board: impressions → clicks → `/quote` starts → submissions  

15. **Optional paid assist while organic ramps**
    - Google Ads for exact local terms (`web design Colorado Springs`, etc.)  
    - Retarget quote abandoners  
    Organic local rankings usually take months; ads cover the gap.

---

## Recommended copy directions (examples)

### Homepage title options

1. `Brand & Web Design in Colorado Springs | Thrun Design Co.`  
2. `Branding, Web Design & Graphic Design for Startups | Thrun Design Co.`  
3. `Colorado Springs Brand & Website Design Studio | Thrun Design Co.`

### Homepage meta description (draft)

> Thrun Design Co. is a Colorado Springs brand and web design studio for startups and growing businesses—identity systems, websites, and campaign assets with clear scope and direct collaboration.

### About opener (draft)

> Thrun Design Co. is based in Colorado Springs and works with founders and owners across the Front Range and nationwide. We build brand systems, websites, and graphic materials when a rebrand, launch, or outdated site can’t wait.

### Local web design H1 (draft)

> Website design for Colorado Springs businesses and startups

---

## Scoring snapshot

| Category | Score (0–10) | Notes |
| --- | --- | --- |
| Technical SEO | 8 | Strong crawl/index foundations |
| On-page service SEO | 6 | Good pages; missing local + graphic/startup language |
| Local SEO | 2 | Weak city entity signals; no visible GBP/NAP |
| Content depth / AEO | 4 | Service FAQs good; no guides hub; no FAQ schema |
| EEAT / proof | 3 | Honest concept labeling; needs real clients + reviews |
| Conversion path | 7 | Clear quote flow |
| **Overall for stated goal** | **4/10** | Ready for a local SEO push; not competitive yet |

---

## 30 / 60 / 90 day plan

### Days 1–30

- Fix homepage CMS title/description  
- Update About + footer NAP + schema areaServed  
- Launch/claim Google Business Profile  
- Request first 5–10 reviews  
- Ship `/colorado-springs` hub + one service lander (web design or branding)

### Days 31–60

- Ship remaining local landers + `/startups`  
- Add FAQ schema  
- Publish 2 guides  
- Begin citation cleanup  

### Days 61–90

- Add first real case study (local if possible)  
- Expand graphic-design positioning  
- Review Search Console queries; double down on pages gaining impressions  
- Consider light local Ads on top converting terms  

---

## What not to do

- Do **not** keyword-stuff “Colorado Springs” into every sentence  
- Do **not** invent local client results  
- Do **not** create thin doorway pages that only swap city names  
- Do **not** rely on concept labs (`/lab/*`) for commercial ranking (keep noindex)

---

## Implementation note for the team

Highest-ROI engineering/content tickets:

1. Sanity homepage SEO fields  
2. About + footer local NAP  
3. JSON-LD areaServed / LocalBusiness enrichment  
4. New routes: `/colorado-springs/*` and `/startups`  
5. FAQPage schema on services  
6. Service copy pass for graphic design + startups language  

This audit is diagnostic. Implementation can be staged as separate PRs against `main`.
