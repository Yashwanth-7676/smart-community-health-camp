# SmartCare Camp Bug Report

## Audit scope
Static HTML/CSS/JavaScript PWA audited on localhost with browser workflow checks. There is no package manager, TypeScript compiler, backend, or production build in this repository.

## Fixed issues

| Issue | Severity | Cause | Fix | Test result |
|---|---|---|---|---|
| Authenticated tabs behaved as page scrolling instead of app navigation | High | Portal used panel-only click handlers | Added hash client-side routes over existing panels | Login, Queue, Yash AI, Reports routes verified |
| Public landing page remained above authenticated modules | Medium | Portal was embedded in the long landing document | Added `app-route-active` shell mode that hides public sections | Public content hidden on `#/queue` |
| Route state did not update browser title or focus | Medium | No route metadata or focus handling | Added route title, breadcrumb, top scroll, and heading focus | Direct `#/yash-ai` route verified |
| Error panel appeared during normal startup | High | CSS `display:grid` overrode the HTML `hidden` attribute | Added `.app-error-panel[hidden] { display: none; }` | Panel computed as `display:none` with no page errors |
| Optional resource failures looked like fatal app crashes | Medium | Global error handler handled resource error events | Ignore errors whose target is not `window` | Normal startup no longer opens error panel |
| PWA served stale router and AI scripts | High | Service worker cache held older asset versions | Bumped cache and asset query versions | Fresh router script loaded in browser |
| Offline asset fallback could return HTML for CSS/JS | Medium | Service worker used app shell fallback for every request | App shell fallback now applies only to navigation | Missing assets return controlled 503 |
| Light-theme Yash AI controls were unreadable | High | Pale hard-coded chip text on pale surfaces | Added explicit light-theme contrast rules | Computed colors verified in browser |

## Remaining warnings

| Issue | Severity | Status |
|---|---|---|
| Screening, consultation, prescription, referral, and follow-up are represented by the guided demo workflow rather than separate clinical forms | Medium | Documented limitation; no fake clinical behavior added |
| Browser localStorage is not secure healthcare storage | High | Expected prototype limitation |
| Accessibility audit logs warnings for some hidden modal controls and gallery buttons | Low | Existing audit heuristic is broader than visible-route state |
| External gallery and QR library assets are network-dependent | Low | Core portal has local fallback behavior |
| No production build/lint command exists | Informational | Static project limitation |

## Security boundary
No real AI provider or API key is configured. No real patient information should be entered.
