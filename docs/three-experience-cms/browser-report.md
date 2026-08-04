# Browser report — experience platform

## Supported baseline

| Surface | Expectation |
|---------|-------------|
| Modern Chromium / Firefox / Safari | Case study SSR + poster + opt-in load |
| Mobile Safari / Chrome Android | Interaction load default; reduced-motion respected |
| No WebGL / software WebGL | Poster / fallback video / text + lab link |
| JS disabled | Server-rendered case study still readable; experience controls absent |

## Lab & creation routes

- Require JS for the interactive package.
- Invalid query params / missing creation IDs show explanatory server-rendered errors.

## CSP implications

See [`csp.md`](./csp.md). Workers and `blob:` URLs are allowed for future Three.js / recording features. If a browser blocks workers under an enterprise policy, the boundary should surface the existing error/fallback UI.

## Stub vs real package

Current stub renders a non-WebGL placeholder, so GPU/driver variance is not yet exercised. Re-run smoke tests on Safari iOS, Chrome Android, and desktop Safari/Chrome/Firefox when the real Controlled Chaos renderer lands.
