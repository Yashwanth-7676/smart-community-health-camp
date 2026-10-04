# SmartCare Camp

SmartCare Camp is a fictional community health-camp management demonstration built with `index.html`, `styles.css`, and `script.js`.

## Run locally

```powershell
python app_server.py
```

Open `http://127.0.0.1:8000/index.html`. The project includes a manifest and service worker for local PWA testing.

## Demo credentials

- Administrator: `admin@smartcare.demo` / `Admin@123`
- Organizer: `organizer@smartcare.demo` / `Organizer@123`
- Doctor: `doctor@smartcare.demo` / `Doctor@123`
- Nurse: `nurse@smartcare.demo` / `Nurse@123`
- Pharmacist: `pharmacist@smartcare.demo` / `Pharmacy@123`

## Features

The demo preserves the landing page, poster, camp registration, login, role-aware dashboard, workflow progress, patient registration, queue, QR pass, inventory, reports, settings, themes, translation controls, PWA shell, offline simulation, and Yash AI demo.

### Modern Architecture & Visual Upgrades (2026)
- **Design Tokens (src/tokens/design-tokens.css):** Centralized CSS custom properties for palette, typography, radii, and shadows.
- **Dynamic Component Engine (src/js/init-components.js & src/components/):** 13 reusable HTML templates for cards, buttons, badges, modals, testimonials, pricing, and FAQ.
- **Interactive Theme Customizer (src/js/theme-customizer.js):** Live floating color pickers, border-radius sliders, and font selectors with persistent localStorage.
- **Micro-Interactions & Animations (src/js/animations.js):** Smooth IntersectionObserver scroll reveals, counting stats, and navbar highlight.
- **Full Offline PWA Support (sw.js):** Extended smartcare-shell-v25 pre-caching all new templates and ES modules.
- **Interactive 3D Zero-Gravity Hero (zero-gravity-hero.html & DefyGravityHero.tsx):** Awwwards-caliber WebGL physical simulation with 25 zero-G floating bodies, mouse repulsion, kinetic impulse detonate, Bloom/DoF postprocessing, and custom GLSL nebula background. Accessible via the **3D Zero-G Experience ✦** button on the landing page.

## Yash AI

Yash AI safely falls back to local Demo mode by default. To use real Gemini responses, create a local `.env` file from `.env.example`, add your own restricted `GEMINI_API_KEY`, and restart `python app_server.py`. The key is read only by the loopback server; it is not embedded in browser code or sent to the client. When no key is configured or the provider is unavailable, the app continues with deterministic local responses.

The server sends only five aggregate fictional counts to the provider and rejects clinical, emergency, referral-decision, and obvious identifying-data requests before a provider call. It also applies body limits, a local rate limit, request timeout, same-origin checks, no-store API responses, static-file allowlisting, and browser security headers. This remains a local educational prototype, not a production health system.

## Safety notice

Use fictional data only. This software does not provide medical diagnosis or replace qualified healthcare professionals. Browser localStorage is not secure enough for real patient records. This is not production authentication, a clinical system, or a secure database.

## Quality status

The app has been checked in a browser for startup, English/Kannada/Hindi switching, light/dark theme switching, administrator login, routed dashboard/queue/Yash AI/reports navigation, workflow progress, logout cleanup, and desktop layout overflow. It has no package-based build or lint step because it is intentionally a static HTML/CSS/JS project. See [docs/TEST_REPORT.md](docs/TEST_REPORT.md), [docs/BUG_REPORT.md](docs/BUG_REPORT.md), [docs/FINAL_DEMO_GUIDE.md](docs/FINAL_DEMO_GUIDE.md), [docs/FEATURE_AUDIT.md](docs/FEATURE_AUDIT.md), and [docs/ACCESSIBILITY_REPORT.md](docs/ACCESSIBILITY_REPORT.md).

See [docs/AI_INTEGRATION.md](docs/AI_INTEGRATION.md), [docs/AI_SAFETY.md](docs/AI_SAFETY.md), [docs/SECURITY_AND_PRIVACY.md](docs/SECURITY_AND_PRIVACY.md), [docs/YASH_AI_INTEGRATION.md](docs/YASH_AI_INTEGRATION.md), [docs/YASH_AI_SAFETY.md](docs/YASH_AI_SAFETY.md), and [docs/YASH_AI_TEST_PLAN.md](docs/YASH_AI_TEST_PLAN.md).
