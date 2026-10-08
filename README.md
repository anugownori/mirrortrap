# MirrorTrap — verified attack-surface monitoring and canary URL telemetry

**Prepared for:** Anushree N (security implementation and project documentation)

MirrorTrap is a defensive cybersecurity web application built with React, TypeScript, Supabase Auth, PostgreSQL Row Level Security, and Supabase Edge Functions. This revised source does **not** generate fake incidents, random activity charts, guessed breach times, or bypass authentication. Public-source findings and actual canary URL requests are stored separately with timestamps.

## What it actually does

- Authenticated sign-up/sign-in through Supabase; no local/demo sign-in.
- Register a domain and prove control using a DNS TXT record.
- Run a **passive, permission-gated** exposure check for that domain.
- Collect public DNS records, certificate-transparency names, and third-party Shodan InternetDB observations (where services are available).
- Store findings, source status/errors, and heuristic exposure index in PostgreSQL using server-side privileges.
- Generate a 256-bit random canary URL, store only its SHA-256 hash, record HTTP requests that reach the endpoint, and revoke the token.
- View recorded scans, provider failures, and canary events. Export an evidence JSON file.

**Interpretation limits:** A public IP, a certificate log hostname, or a third-party indexed port is not by itself a confirmed vulnerability. A request to a canary URL is not proof that a malicious attacker visited it. The exposure index is a transparent heuristic, not a validated model or a risk prediction.

## Getting started

Requires Node.js compatible with Vite 8 (Node >=20.19 or >=22.12), npm, and a Supabase project. You need a domain for which you can publish DNS TXT records.

1. Create a Supabase project.
2. Apply `supabase/migrations/001_production.sql` through the SQL editor.
3. Deploy the Edge Functions as documented in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). The tripwire endpoint must allow unauthenticated requests, while the two administrative endpoints require JWT authentication.
4. Copy `.env.example` to `.env.local` and enter the public URL and publishable/anon key. **Never paste a service-role key into the frontend.**
5. Run:

   ```bash
   npm ci
   npm run build
   npm run dev
   ```

6. Open `http://localhost:5173`, sign up, verify your email if required, and sign in.
7. Register your authorized domain; publish the TXT record shown in Assets and click **Verify DNS**.
8. Click **Scan verified domain**. Expand findings and provider statuses; export the JSON evidence.
9. Create a canary URL, copy it immediately, and visit it from a browser you control. Its Edge Function intentionally returns `404`, but the request should appear on the **Security events** page after refreshing. Revoke the URL to stop further collection.

## Application structure

| Location | Purpose |
|---|---|
| `src/App.tsx` | Modern authenticated UI, real stored data, and defensive workflows |
| `src/lib/supabase.ts` | Supabase browser client with public credentials only |
| `supabase/migrations/001_production.sql` | RLS database schema |
| `supabase/functions/verify-domain` | Server-side DNS ownership validation |
| `supabase/functions/verified-scan` | Authenticated source collection and evidence persistence |
| `supabase/functions/tripwire-collect` | Public, token-addressed, rate-limited HTTP request event receiver |
| `docs/DEPLOYMENT.md` | Step-by-step launch and environment setup |
| `docs/TEST_PLAN.md` | Real-world acceptance testing checklist |
| `PRODUCTION_READINESS.md` | Honest validation and risk status |

## Safety and authorization

Verify domain ownership before collection. Do not probe, attack, or deploy traps on systems without permission. Canary URLs may capture network metadata of visitors; disclose and retain data responsibly. Public-source observation should be confirmed before remediation. Do not use this application as a substitute for continuous managed security monitoring.

## Source and attribution

This version was adapted from the user-supplied archive associated with <https://github.com/anugownori/mirrortrap>. The upstream README stated **“All rights reserved — built for a hackathon demo”** and no permissive root license was present in the reviewed repository. The upstream author retains their rights. Before publishing or submitting this derivative as an original source package, **obtain permission from the rights holder and accurately distinguish original code from Anushree N's modifications**. Do not remove relevant copyright or ownership notices.

## Verification caveat

This workspace does not have internet access to the npm registry or a configured Supabase project. Therefore the frontend production build, live Edge deployment, DNS verification against a real domain, and canary event smoke test have **not** been executed here. See [PRODUCTION_READINESS.md](PRODUCTION_READINESS.md). No completion claim should exceed the evidence documented there.
