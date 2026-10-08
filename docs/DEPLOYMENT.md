# MirrorTrap deployment guide

## 1. Prerequisites
- Authorized and DNS-configurable domain.
- Supabase project with access to its SQL editor, Edge Functions, and Auth configuration.
- Node.js compatible with Vite 8 and npm.
- HTTPS for production; localhost for local development.

## 2. Database
Paste `supabase/migrations/001_production.sql` into the Supabase SQL Editor and run it **once in a clean project**. It creates the `mt_assets`, `mt_scans`, `mt_tripwires`, and `mt_events` tables. All have RLS. Authenticated users may register their own assets and tokens; only service-role Edge Functions can record verified status, scan results, and events.

Confirm RLS is enabled on all four tables. Confirm the authenticated role cannot update `mt_assets.verified_at`, cannot insert arbitrary `mt_scans`/`mt_events`, and cannot change a tripwire's hash, owner, or label. The `active` field alone is editable for revocation.

## 3. Authentication
Enable email authentication in Supabase Auth. Set your Site URL to the deployed dashboard's HTTPS origin. Configure allowed redirect origins and email confirmation as required. Consider CAPTCHA and Supabase rate limits for registration. Do not disable RLS.

## 4. Edge Functions
Install and authenticate the Supabase CLI, link it to the project, then run:

```bash
supabase functions deploy verify-domain
supabase functions deploy verified-scan
supabase functions deploy tripwire-collect --no-verify-jwt
```

`supabase/config.toml` also documents the JWT configuration. The **tripwire-collect** function is intentionally public because visiting the secret URL is the signal. The other two functions must enforce authentication independently; they verify the authenticated user and domain ownership server-side.

Supabase normally injects `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` into Edge Functions. Keep the service-role secret on the server only, and never set it as a `VITE_` variable or commit it.

## 5. Frontend

```bash
cp .env.example .env.local
# Fill in public values:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
npm ci
npm run build
npm run dev
```

Deploy the production `dist/` directory to a static host with SPA routing. If using Vercel, the included `vercel.json` provides a fallback rewrite. Configure the two public VITE variables in that host's environment settings, redeploy, and use HTTPS.

## 6. Verify real behavior
- Register a domain you control, publish `_mirrortrap-challenge.<domain>` TXT with the exact value shown. Click Verify DNS until propagation succeeds.
- Run a scan and confirm timestamps, stored `mt_scans` row and actual source statuses.
- Create a canary URL, visit it, confirm `404` and a matching `mt_events` row. Then revoke and confirm subsequent visits do not create new events.
- Sign out, register a separate account and verify it cannot read the first account's records.

## 7. Operational limitations
- The scanner reads public external services; it does not perform Nmap active scanning, Wireshark capture, Snort detection, exploit verification, or malware analysis.
- Shodan InternetDB is a historical third-party index; data can be incomplete or stale. Certificate-transparency names also include retired hosts and non-live records.
- The canary collector records **requests**, not confirmed attacker identity. IP headers can be absent or affected by proxies; do not treat reported addresses as forensic ground truth.
- The collector implements a maximum of 50 stored events per token per hour, but broader abuse throttling, monitoring, retention, privacy notices, and anomaly correlation remain future work.
- A single missed external provider does not prove the asset is safe. Read the source-status section of each scan.
