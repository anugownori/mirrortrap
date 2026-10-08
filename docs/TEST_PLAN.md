# Acceptance tests and evidence checklist

Use a real Supabase project and **your own domain**. Record screenshots and actual timestamps; don't fabricate results.

1. `npm ci` completes without errors.
2. `npm run build` passes TypeScript and Vite build.
3. `npm run lint` completes and reported issues are resolved.
4. With missing Supabase variables, app shows a configuration error, never a fake login.
5. Sign up, confirm email if required, sign in with real credentials; invalid password is rejected.
6. Add a valid domain and confirm SQL row contains an unverified challenge.
7. Verify without DNS TXT proof and confirm HTTP error; scan must be refused.
8. Add exact TXT proof, wait for DNS propagation, verify, and confirm server-set verified_at.
9. Scan the domain. Check at least one real source response and correct recorded source statuses and timestamps. Validate that a failing source is explicitly marked unavailable.
10. Run two scans within one minute and confirm the rate-limit response.
11. Check scan results are saved on refresh and isolated between two accounts.
12. Create a canary URL and save it once. Confirm DB stores SHA-256 hash, not plaintext token.
13. Visit the canary URL and confirm a real HTTP 404 response and new event record.
14. Verify a random invalid token cannot create an event.
15. Revoke the canary URL and confirm subsequent visits no longer generate events.
16. Verify events are inaccessible to a second account due to RLS.
17. Export a JSON report; manually compare values with stored evidence and source responses.
18. Check responsive layout, keyboard navigation, logout, no browser-exposed service-role secrets, and HTTPS in the final deployment.

**Results in this environment:** TypeScript parsing/transpilation was checked, but npm packages and a real Supabase project were unavailable. No live acceptance test above has been performed here. Complete this checklist before declaring the project ready for submission.
