# OTP Regression Investigation (MVP 1–3)

## Facts
- Pre-PR22: 1 SMS per booking, delivered in 3–10 seconds.
- Post-PR22 branch: Vercel logs show [OTP_REQUEST] smsSent: true, but WhySMS shows no new SMS.
- Credentials remain valid and in-code for MVP 1–3 (by design).

## Hypotheses
- H1: Provider call failing, but smsSent incorrectly set true.
- H2: Subtle change in payload/format that WhySMS rejects.
- H3: Using different env/project/credentials between main and PR branch.
- H4: Silent exception before HTTP call.

## To Do
- Identify exact WhySMS call site.
- Log request + response on PR22 branch deployment.
- Compare behavior against last known working commit (d2f0d1a).
- Propose minimal code fix to restore previous behavior without changing credentials.
