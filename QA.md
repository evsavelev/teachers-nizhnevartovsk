# Teacher’s — QA / redteam

## Scope and baseline

New static site, 11 September 2026. No previous source page existed in the specified folder/repository. `checkpoint-input` / `8582505` preserves the user briefs, source ledger and design lock. Implementation developed on `visual-v1`; main is updated only after this QA.

## Local verification: PASS

Chrome + Playwright 1.58.2, axe-core 4.11.0. Viewports: **360×800, 390×844, 430×932, 768×1024, 1024×900, 1440×1000**.

- 176 automated checks: HTTP 200, local assets, unique H1, font load, canonical/OG, four languages, complete vertical scroll without horizontal overflow, working menu/open/close/Escape/focus, real enrollment targets, exact telephone, every fragment link.
- Zero console, page or resource errors. No unexpected third-party requests. Production JavaScript is 1,878 bytes; HTML + CSS + JS + fonts total approximately 123 KB uncompressed. No framework, video, analytics, embedded map, image generator or runtime CDN.
- axe WCAG 2 A/AA and WCAG 2.1 AA: **0 violations at all six sizes**. This is automated coverage, not a certification. Keyboard menu close/focus, visible focus outlines, real links and ≥44px interactive targets also reviewed.
- Reduced motion: no hidden reveal elements and no smooth scrolling. Enrollment CTA reaches #contacts. No-JS navigation and all main content remain available.
- Open Graph image 1200×630, local PNG; favicon loads. There are no stock school photos or invented portraits.
- Actual unknown route returns 404 and a useful home link.

Reproduce: `npm ci --ignore-scripts`, `npm start`, then `npm run qa` in another terminal. Chrome must be installed. Optional `QA_URL` selects production. Raw local report: `verification/local-qa.json`; screenshots: ignored `qa/local/`.

## Visual review and fixes

Reviewed hero, languages, formats, trust, progress, camp, reviews, process and contacts against DESIGN.md. Strong pink opening / neutral editorial middle / black evidence / yellow summer product. Four-language graphic has semantic meaning; no random flags, mascot, noisy gradients or unverified photography.

Fixed the merged mobile line break in the children's panel, removed low-contrast decorative abc on mobile, and clipped the offscreen skip link correctly. Moved mobile rating directly below CTA and before the large illustration. Final passes have no open P0/P1/P2 visual issues. Physical iOS/Android device testing is not claimed; mobile QA uses Chrome viewport/touch emulation.

## SEO: PASS within code/rendered scope

Static title, description, one descriptive H1, ordered H2/H3 structure, canonical/og:url and sitemap all use `https://evsavelev.github.io/teachers-nizhnevartovsk/`. No noindex on home. robots.txt references that sitemap. School JSON-LD parses, type exists in Schema.org; exact address and phone match the visible page; no invented hours, coordinates, pricing or review rich-result promises. Social links in sameAs agree with SOURCES.md. IDs unique; all anchors resolve; no build workflow.

Official documentation checked 11.09.2026: [School](https://schema.org/School), [canonicalization](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [local business data](https://developers.google.com/search/docs/appearance/structured-data/local-business). `scripts/qa-seo.cjs` verifies local structured data and essential invariants. This does not establish indexing, chosen canonical, search ranking or field Core Web Vitals. No Search Console, indexing submission or host-wide robots changes performed.

Lab observations: mobile CLS 0; tablet/desktop <0.001. LCP values in the scroll suite are diagnostic only (programmatic scrolling can change candidates), not Lighthouse or field measurements. Lightweight static delivery, local fonts with swap, reserved graphic geometry and zero third-party runtime requests satisfy the intended performance constraints.

## Official external links

Read-only HTTP check in `verification/external-links.json`: Telegram **200**, VK **200** (mobile redirect), 2ГИС card and reviews **200**. MAX **403** to automated requests; exact href independently verified in 2ГИС. No messages sent, no telephone calls placed, and no claim that the MAX app was tested.

## Release / rollback

After passing local QA, create `checkpoint-visual-v1`, merge visual-v1 into main and publish the root via GitHub Pages source main /. No custom .github/workflows YAML. After publish rerun `QA_URL=https://evsavelev.github.io/teachers-nizhnevartovsk/ npm run qa`, check remote Pages configuration and static resources. Record production evidence separately. To undo the visual release, revert the merge commit; the source checkpoint remains available (it contains briefs, not an old live website).

## Remaining client materials

Optional real school photos with publication permission and final logo; current lesson prices/schedule; camp dates, detailed program and cost. The current site intentionally asks users to discuss these with the school. These omissions do not block the demo.

## Production verification — PASS, 11 September 2026

Published URL: https://evsavelev.github.io/teachers-nizhnevartovsk/ . GitHub Pages reports `built`, `build_type: legacy`, source `main` / `/`. Reviewed release `739f32045c6d9cb8eac3df573d11a303025810f1`; subsequent report commit changes documentation/evidence only.

The same six-viewport suite passed **176 checks**, with zero console/page/resource errors and zero axe violations. All site resources and SEO files return 200, a missing route returns 404, menu/CTA/phone/anchor checks pass. Published HTML/CSS/JS/robots/sitemap match local source (normalizing line endings). School JSON-LD verified on the public HTML. Mobile CLS = 0. Production hero and camp screenshots visually reviewed.

Evidence: `verification/production-qa.json`, `verification/production-assets.json`; screenshots in ignored `qa/production/`. MAX retains the documented external 403 limitation; all other official links returned 200. No phone call or message was sent. Checkpoints and visual-v1 are pushed to GitHub.
