---
target: homepage
total_score: 20
max_score: 32
na_heuristics: 7,10
p0_count: 2
p1_count: 2
timestamp: 2026-07-25T20-10-22Z
slug: src-app-page-tsx
---
Method: dual-agent (A: 1bb4458a-7565-4123-9393-27f119633753 · B: c492012d-ec61-4a46-b2b0-ad0022a9c024)

#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Quote submitting/done/error OK; long marketing scroll has no progress context |
| 2 | Match System / Real World | 2 | Studio jargon; About/Contact labels; “Selected work” vs concepts |
| 3 | User Control and Freedom | 3 | Quote Back/Continue; Contact destination is weak |
| 4 | Consistency and Standards | 2 | Nav labels ≠ section jobs; offer list ≠ PRODUCT offer; “proof” ≠ proof |
| 5 | Error Prevention | 2 | Mislabeling + concept portfolio can be misread as clients |
| 6 | Recognition Rather Than Recall | 3 | Services meta + numbered process help; still jargon |
| 7 | Flexibility and Efficiency | n/a | Persuade landing — not a power-user tool surface |
| 8 | Aesthetic and Minimalist Design | 2 | Strong craft, but card stack + twin Why panel + 5-step + 5-link nav add chrome |
| 9 | Error Recovery | 3 | Quote field errors + retry; generic “Something went wrong” |
| 10 | Help and Documentation | n/a | Marketing site; help belongs in quote copy, not a docs system |
| **Total** | | **20/32** | **Acceptable** |

#### Design Specificity Verdict

**LLM assessment**: Mostly authored for Thrun — Dark Editorial tokens, Libre + Plex, radius 0, PrecisionMark, contours, and gold/bronze are not generic SaaS. Mid-page agency template rhythm (Services cards → Process → Work → Why → CTA) and insider phrasing (“signal, not noise,” “editorial systems”) still make stretches of the page category-interchangeable. Brand appears as a mono eyebrow while the headline carries visual weight.

**Deterministic scan**: `detect.mjs --json` on homepage sections/site/quote/work returned **0 findings** (exit 0). Static TSX scan cannot exercise browser-only rules (contrast, overflow, content-hidden-at-rest).

**Visual overlays**: No reliable user-visible overlay — browser automation was not available in this session. Production HTML fetch confirmed the live site serves the homepage (HTTP 200).

#### Overall Impression

The craft language is real and distinctive; the persuasion spine is undermined by borrowed trust (concept “Selected work,” hollow “Proof of craft”) and IA labels that don’t match destinations. Biggest opportunity: make honesty the conversion strategy — rename concepts, drop fake-proof framing, align offer/nav to PRODUCT truth, then sharpen the end CTA.

#### What's Working

1. **Tokenized Dark Editorial system** — bg/gold/bronze, zero radius, Libre + Plex feels like the Figma handoff, not a theme preset.
2. **Conversion spine is correct** — hero + header + final CTA push quote → `/quote`; multi-step form with validation and success state.
3. **Why Thrun contrast panel** — cream block against charcoal is the page’s strongest compositional beat; PrecisionMark ties sections without clutter.

#### Priority Issues

**[P0] Concept portfolio presented as “Selected work”**
- **Why it matters**: Undermines trust for founders evaluating a rebrand partner; violates PRODUCT principle on provisional portfolio.
- **Fix**: Rename eyebrow (e.g. “Concept studies”); lead with speculative framing; demote/gate secondary hero CTA until real work ships.
- **Suggested command**: `/impeccable clarify`

**[P0] “Proof of craft” is not proof**
- **Why it matters**: Creates a false peak before the final CTA; founders scanning for evidence hit restated services.
- **Fix**: Retitle to “How we work” / “What you get”; replace numbers with concrete deliverables; never invent metrics.
- **Suggested command**: `/impeccable clarify`

**[P1] Nav About / Contact mismatch**
- **Why it matters**: About → Why Thrun; Contact → footer only. Feels unfinished; Jordan can’t find a person/email path.
- **Fix**: Relabel (Why Thrun / Start) or add a real Contact strip + short About POV; keep `/quote` primary.
- **Suggested command**: `/impeccable layout`

**[P1] Offer incomplete vs PRODUCT truth**
- **Why it matters**: Audits, maintenance, system architecture barely surface; three tall cards feel like a menu, not a systems partnership.
- **Fix**: Align service set/copy to confirmed offer; make systems-across-channels the section thesis.
- **Suggested command**: `/impeccable distill`

**[P2] Final CTA emotional underpower + eyebrow monotony**
- **Why it matters**: Weak end for Persuade; same mono eyebrow pattern flattens section hierarchy.
- **Fix**: End with outcome + next-step promise; vary/drop eyebrows; keep quote as the only hard action.
- **Suggested command**: `/impeccable quieter` + `/impeccable typeset`

#### Persona Red Flags

**Jordan (First-Timer)**: “Design with consequence” / “editorial systems” don’t translate; About doesn’t explain who Thrun is; may bounce before `/quote`.

**Riley (Stress Tester)**: Contact → footer; opens Northline expecting a real client; notices Proof of craft has no evidence; flags nav/IA as unfinished.

**Casey (Mobile)**: Header quote CTA hidden below `md` (Menu only); ContourOverlay/HeroCanvas/PrecisionMark/coords hidden on small screens — mobile loses distinctive craft; five-item sheet + tall service cards = scroll fatigue.

**Alex — SMB founder mid-rebrand**: Needs operational reassurance (“what happens after I submit?”); sees concepts not peers; missing audits/maintenance; final CTA is lyrical not operational.

#### Minor Observations

- Hero brand-as-eyebrow vs large H1 — mark is small on mobile (`w-12`).
- `servicesMeta` duplicates the three services in the next section.
- Process columns wrap densely on tablet.
- Reveal motion only wraps hero copy.
- Footer Services links all go to `/#services`.
- Quote success omits confirmation-email / reply-SLA language.

#### Questions to Consider

1. If every concept project were removed tomorrow, would the homepage still persuade a founder to request a quote?
2. Why does “Contact” exist in the nav if the only contact action you want is `/quote`?
3. Is “Proof of craft” protecting the brand from looking thin, or advertising the absence of proof?
4. Would a rebranding owner rather see one honest paragraph about how you run engagements — or four more gold mono eyebrows?
