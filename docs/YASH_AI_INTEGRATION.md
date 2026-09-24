# Yash AI Integration

## Architecture
SmartCare Camp has a local `app_server.py` server for the classroom demo. The browser calls the same-origin `/api/yash-ai` route; that server alone can read `GEMINI_API_KEY` from local environment configuration and call Gemini. If no key exists or the provider fails, the browser uses deterministic Demo AI rules and clearly displays the fallback state.

## Branding
- Name: YASH AI
- Subtitle: Your Smart Community Health Camp Assistant
- Status: Yash AI - Demo Mode

## Access points
- Authenticated portal tab
- Dashboard Yash AI summary card
- Floating Ask Yash AI button
- Independent floating chat panel with minimize, close, prompt chips, language selector, loading state, and clear chat
- Ctrl+K or Cmd+K command palette
- Existing AI preview modal before response generation

Static deep-link equivalents are hash-based through the single-page portal rather than server routes. A production `/yash-ai` route would require a backend or client router.

## Demo capabilities
- Operational summaries
- Queue summaries
- Report drafts
- Camp-readiness checklists
- Volunteer and staff briefings
- Poster and education drafts
- Kannada translation drafts
- Data-quality review suggestions
- College presentation and viva support

Every response states that it was generated from fictional SmartCare Camp demo data.

## Privacy boundary
Only aggregate counts and fictional operational totals are used. Names, addresses, phone numbers, diagnoses, prescriptions, histories, and identifiable results are excluded from the response context.

## Real AI mode
To enable real AI, copy `.env.example` to `.env`, add a Gemini key, and run `python app_server.py`. No API key exists in frontend code. The server limits requests, validates and minimizes aggregate input, blocks common sensitive and unsafe requests before Gemini, enforces a timeout, avoids logging request contents, and falls back to Demo AI if Gemini is unavailable. The loopback server is for fictional local use only; it is not a production medical backend.
