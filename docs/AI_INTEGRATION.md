# AI Integration

## Current mode

SmartCare Camp starts in **Demo AI mode**. The assistant uses local rule-based responses and aggregate fictional data until a server-side Gemini key is configured. The browser first checks `/api/yash-ai/status`; the interface then labels the current mode as Real AI, Demo Mode, or Demo fallback.

## Data boundary

Included data is limited to aggregate registration, queue, consultation, referral, and inventory counts. Identifiers and clinical details are excluded. The data-preview dialog appears before every request.

## Real AI setup (local demo)

1. Copy `.env.example` to a new local file named `.env`.
2. Create a restricted Gemini API key in Google AI Studio and set `GEMINI_API_KEY` in `.env`.
3. Start the project with `python app_server.py`, then open `http://127.0.0.1:8000`.

Never add the key to browser JavaScript, a public environment variable, or source control. `.env` is ignored by Git and the static server explicitly refuses to serve dotfiles.

`app_server.py` calls Gemini from the loopback server only. It accepts only the prompt plus these server-validated integer counts: registrations, waiting, consultations, referrals, and lowStock. It rejects oversized bodies, invalid JSON, cross-origin browser requests, obvious identifiers, and prohibited clinical requests. The proxy has a timeout, a per-client local rate limit, no-store API responses, static-file allowlisting, and a Demo AI fallback. Server access logs intentionally omit prompts and aggregate values.

The server binding is `127.0.0.1`; it is intentionally not reachable from other devices. A deployed production health system would still require real authentication and authorization, HTTPS, a secret manager, database security, consent, privacy assessment, durable audit controls, provider quotas, and clinical governance.

Local server environment variables:

```text
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
AI_REQUEST_TIMEOUT_SECONDS=12
AI_RATE_LIMIT=10
AI_RATE_WINDOW_SECONDS=60
```

Use a secret server environment file locally and commit only an `.env.example` with blank values. Real AI remains disabled when the provider is not configured.

## Disable AI

Remove or hide the Demo AI tab and floating button, or clear the `ai-panel` permission from `ROLE_PERMISSIONS`. A future backend should also provide a server-side feature flag.

## Cost and quota

Demo AI is free and offline. Any future provider may incur usage charges or quota limits; no provider is enabled by this project.
