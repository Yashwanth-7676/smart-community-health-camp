# Security and Privacy

This is a fictional browser-only educational prototype.

- Patient and account demo data use localStorage.
- localStorage is readable and editable by the browser user and is not suitable for real health records.
- No real patient data should be entered.
- No external AI provider receives data in Demo AI mode.
- If the owner configures a local `GEMINI_API_KEY`, the loopback `app_server.py` proxy may send only five validated aggregate fictional counts and an allowed prompt to Gemini. The key remains server-side and is never sent to the browser.
- Yash AI Demo Mode uses aggregate fictional data only and has no provider connection or API key.
- Yash AI excludes names, phone numbers, addresses, diagnoses, prescriptions, histories, and identifiable results.
- No API keys are present in frontend files. `.env` is ignored by Git and cannot be served as a static file.
- The local AI route validates JSON and count types, enforces request/body limits and a local rate limit, blocks obvious clinical and identifying-data prompts, uses a provider timeout, avoids request-content logs, and returns no-store responses.
- The service worker caches the app shell for offline demonstration only.
- Offline changes are fictional and simulated as synchronized; there is no server backup.
- If browser storage is blocked, core account and patient state falls back to temporary in-memory data for the current tab and is not persisted.
- The service worker serves the app shell only for navigation requests; missing offline assets return a controlled unavailable response.

A production system would require server-side authentication, authorization, encrypted transport and storage, audit controls, secure database policies, data retention rules, consent management, and clinical governance review. The included server binds only to `127.0.0.1` and is not a production health-data backend.
