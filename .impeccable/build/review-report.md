# Editorial Split implementation review

Approved: Charcoal & Ivory palette and Editorial Split layout. Original typography, real CMS content, interactive horse, moving project strip, and 3D model stage retained. Alternate solid ivory services/process/inquiry with dark gallery/audit/proof and closing quote action.

Independent Impeccable reviewer: **ship**, scoped verdict after gallery fix. The cited desktop cropping of Hollowbeam and Living Engraving is resolved on desktop/mobile; narrower portrait assets are accepted. No material visual regressions in that scoped review. Automated pixel-fidelity gates were not completed; no measured reproduction claim.

Validation:
- Production build and TypeScript pass.
- ESLint passes on changed TypeScript files. Broader existing site-directory lint reports pre-existing set-state-in-effect errors in consent-aware-analytics.tsx and cookie-consent-banner.tsx, which this change does not edit.
- 17 security regression tests pass; quote backend untouched.
- Desktop 1440x1000 and mobile 390x844: no browser errors, no horizontal overflow, no broken images.
- Reduced motion has hydration-safe initial rendering and static artwork.
- Normal motion: horse drag, 3D-stage canvas, inquiry accordion, mobile menu, project navigation, and quote navigation pass.

The redesign is prepared on design/editorial-split for preview. Production merge is pending user review.
