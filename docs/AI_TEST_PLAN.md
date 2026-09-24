# AI Test Plan

## Demo AI tests

1. Open the authenticated portal and select `Demo AI`.
2. Enter an operational summary prompt.
3. Confirm the data preview and verify an aggregate-only response.
4. Ask for queue or report guidance and verify no identifiers appear.
5. Ask for translation or education content and verify the human-review notice.
6. Ask `Diagnose this patient.` and verify the refusal.
7. Ask for a prescription or emergency treatment and verify refusal.
8. Clear the conversation and verify messages disappear.
9. Copy and print the latest response.
10. Verify the audit count increases without storing prompt text.

## Security checks

- Search frontend files for API keys: none should exist.
- Confirm the preview lists excluded identifiers.
- Confirm no external AI request is made in Demo AI mode.
- Confirm the app still loads from localhost without a provider.
- Test with reduced motion enabled and at a mobile viewport.

## Real AI server tests

- Start with `python app_server.py`; with no `.env` key, the application must remain in Demo Mode.
- With a local server-side `GEMINI_API_KEY`, verify the Real AI badge and a successful same-origin `/api/yash-ai` request.
- Verify `.env` and `app_server.py` are not available as static files.
- Verify clinical and obvious identifying-data prompts return a refusal before a provider call.
- Stop the provider or use an invalid key and verify the application switches to Demo fallback.
