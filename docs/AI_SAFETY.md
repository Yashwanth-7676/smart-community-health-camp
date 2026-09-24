# AI Safety

The SmartCare Demo AI is an administrative and educational assistant only.

It may:

- Summarize aggregate fictional operations.
- Explain queue and inventory totals.
- Draft non-clinical reports, briefings, posters, and education content.
- Guide users through the camp workflow.

It must not:

- Diagnose a patient.
- Recommend or prescribe medicine.
- Change a clinician's decision.
- Predict disease or individual risk.
- Give emergency treatment instructions.
- Decide referrals or replace healthcare staff.

The assistant refuses unsafe prompts and redirects the user to a qualified healthcare professional. Human review is required before any generated educational or public content is used.

The data preview identifies aggregate fields sent to the local rules engine and lists excluded fields. AI audit entries contain role, feature, data category, mode, result status, review status, and time only. They do not contain patient text.
