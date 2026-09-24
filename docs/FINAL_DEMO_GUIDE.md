## First-place judging narrative

Lead with the innovation statement: **SmartCare Guided Camp Workflow with Yash AI Operations Assistant.**

Explain the value in this order:

1. Community health camps lose time at handoffs between registration, queue, care, medicines, and follow-up.
2. SmartCare makes each handoff visible through a guided, role-aware workflow.
3. Yash AI adds aggregate operational support without diagnosis, prescribing, or autonomous clinical decisions.
4. Kannada support, offline demo mode, and fictional-data boundaries make the prototype accessible and responsible for a classroom demonstration.
5. The future path is a secure backend and real multi-device sync, not unsafe browser-only healthcare storage.

## Presentation Mode

From `#/dashboard`, select **Presentation Mode**. Use Next/Previous or the arrow keys through the 20-step story. Presenter notes, progress, Reset demo, Full screen, and Exit are built in.
# SmartCare Camp Final Demo Guide

## Run

```powershell
python app_server.py
```

Open `http://127.0.0.1:8000/index.html`. Without a local `.env` key, Yash AI uses Demo Mode. To demonstrate the secured Real AI path, configure `GEMINI_API_KEY` in a non-committed `.env` file before starting the server.

## Demo accounts

- Administrator: `admin@smartcare.demo` / `Admin@123`
- Volunteer: `volunteer@smartcare.demo` / `Volunteer@123`
- Nurse: `nurse@smartcare.demo` / `Nurse@123`
- Doctor: `doctor@smartcare.demo` / `Doctor@123`
- Pharmacist: `pharmacist@smartcare.demo` / `Pharmacy@123`

## Recommended presentation flow

1. Show the public landing page and open the health-camp poster.
2. Open the staff portal and sign in as Administrator.
3. Demonstrate `#/dashboard` and the dashboard summary card.
4. Open `#/workflow` and complete several fictional workflow steps.
5. Open `#/reports` and show aggregate statistics/export.
6. Log out and sign in as Volunteer to demonstrate patient registration and queue access.
7. Log out and sign in as Pharmacist to demonstrate inventory and stock updates.
8. Open `#/yash-ai` and run an operational summary.
9. Test a diagnosis or prescription prompt and show the safe refusal.
10. Switch Kannada, switch dark mode, and show that preferences persist.
11. Use browser back/forward to demonstrate routed portal navigation.
12. Log out and return to the public landing page.

## Route examples

- `#/dashboard`
- `#/workflow`
- `#/camps`
- `#/patients`
- `#/registration`
- `#/queue`
- `#/screening`
- `#/medicines`
- `#/reports`
- `#/yash-ai`
- `#/settings`
- `#/profile`

These are hash routes because the project is a static PWA without a server router. Public informational sections continue to use normal scrolling.

## Presentation safety statement

This is a fictional educational prototype. It does not provide medical diagnosis, treatment, prescription decisions, secure healthcare storage, or production authentication.

## Recovery

If the browser shows a genuine workspace error, use `Reload workspace`. If an old cached shell is visible, open the localhost URL with a new query string or clear the site cache once before the demonstration.
