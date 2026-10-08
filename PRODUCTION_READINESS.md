# Production readiness and known limits

**Status: INTEGRATION TESTING REQUIRED — NOT YET DEPLOYMENT-VERIFIED.**

## Implemented in source
- React/TypeScript authenticated dashboard, no guest or demo credential fallback.
- Server-controlled DNS TXT ownership verification before passive scans.
- Source collection from Google DNS-over-HTTPS, crt.sh and Shodan InternetDB; explicit statuses on unavailable sources.
- User-scoped SQL storage for scans/assets and event records, with Row Level Security.
- 256-bit random tripwire URLs; SHA-256 hash stored, real HTTP request ingestion, token revocation, bounded event collection.
- Authenticated JSON evidence export with source evidence, timestamps and limitations.
- Removed generated sample histories, fake attacks, random charts, simulated breach timelines, fake AWS credential validation, unbacked AI claims and demo marketing routes.

## Not yet verified / still needed
- Install npm dependencies; run `npm run build` and `npm run lint` on a connected development machine.
- Deploy database SQL and all three Supabase functions to a project the owner controls.
- Test auth, DNS TXT verification, real scans, event ingestion, revocation and cross-account isolation against actual Supabase.
- Configure domain, HTTPS, proper Auth redirect URLs, CAPTCHA/rate limits, backup and retention policy.
- Add production metrics, alert notifications and an incident response workflow if a continuously monitored product is required.
- Conduct security review of Edge Function auth, RLS, key handling, denial-of-service rate limits and evidence privacy.
- Obtain permission from upstream rights holder before public redistribution or academic claims that the original project was written entirely by the submitting student.

## Test evidence collected in the current environment
- Reviewed user-uploaded source ZIP.
- Transformed the application source and added SQL and Edge Function logic.
- Ran TypeScript isolated syntax/transpilation checks on the authored .ts/.tsx source.
- Full dependency install unavailable because the runtime cannot resolve registry.npmjs.org; live testing requires external services.

**Do not claim a 100% production-ready project until the above gates actually pass.**
