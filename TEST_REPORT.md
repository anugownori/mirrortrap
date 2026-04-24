# MirrorTrap — Test Report

**Build under test**: `devin/1776873610-mirrortrap-initial` @ `d2722c9`
**Environment**: Local production build (`npm run build` + `npm run preview`) on `http://localhost:4173`
**Tested**: 2026-04-22

## Summary

Ran MirrorTrap locally against a clean production build and exercised the full judge-facing flow end-to-end: landing → signup → animated scan → PhantomShield deploy-all → simulated alert → reports → Demo Mode. All 6 test cases passed. A screen recording of the full run is attached.

## Escalations

- **PR not yet opened**: the GitHub repo `ganesh2317/Mirror-trap` has no `main` branch yet, so no base branch to target. Feature branch `devin/1776873610-mirrortrap-initial` is pushed and ready. Once `main` exists I'll open the PR automatically.

## Test results

- [PASS] **T1 — Landing** renders hero, 3 stat callouts (91% / 4.2hrs / $4.9M), animated terminal scanning `targetcompany.com` line-by-line, and ₹0 / ₹999 / ₹9,999 pricing tiers.
- [PASS] **T2 — Signup → Dashboard** — `ganesh@mirrortrap.demo` routed to `/dashboard`; topbar shows email; 6 sidebar items; stats default to 0.
- [PASS] **T3 — Scan flow** — entered `acme-corp.com`, 5 sources ticked ✓ sequentially in terminal + source-status list, ARS animated to `99 CRITICAL`, 7 findings with severity badges + source pills, AI Dossier revealed an Executive Summary / Primary entry / Remediation block.
- [PASS] **T4 — PhantomShield** — DEPLOY ALL flipped all 4 cards to "Active", success banner rendered "PhantomShield Active — 4 decoys deployed", Live Monitoring appended 4+ events with timestamps + country flags within ~8s.
- [PASS] **T5 — Alerts SIMULATE ATTACK** — counter incremented 1→2, new card slid in (IP `185.220.101.47`, `🇷🇺 Russia`, `Honey Token URL`), probable attack path showed 5 numbered steps with step 3 marked `← triggered`.
- [PASS] **T6 — Reports** — summary stats (Scans this month `1`, Avg ARS `99`, Tripwires fired `2`), Recharts trend chart rendered with axes + grid, scan history table had `acme-corp.com` row with PDF Report action.
- [PASS] **T7 — Demo Mode (D key)** — toast "Demo Mode activated" appeared, topbar ARS flipped to `84 CRITICAL`, 9 scans in history with targetcompany.com dataset, 5 tripwires, 7-point purple trend line, dashboard gauge showed `84 CRITICAL` with breakdown `2 critical / 3 high / 2 medium` and `4/4 decoys active`.

## Evidence

### T1 — Landing page with animated terminal

![Landing hero with live terminal](https://app.devin.ai/attachments/622d3e3e-14b1-46d0-b093-ece0f839ef74/screenshot_469dea7e12dc43e08f3db602a8edfb90.png)

![Pricing tiers ₹0 / ₹999 / ₹9,999](https://app.devin.ai/attachments/fe71e639-bec0-4e85-994e-0269482108e0/screenshot_cf2a2934157c48179ff560dec5a139c5.png)

### T2 — Signup → Dashboard (empty state)

![Dashboard empty state after signup](https://app.devin.ai/attachments/05ad21e7-2ee5-4c25-b4d1-6e3c49c481df/screenshot_dae8ba84c29d4f799853ad5be5ae06d9.png)

### T3 — Animated scan of `acme-corp.com`

![Terminal + ARS 99 + findings](https://app.devin.ai/attachments/eabea0d8-1f8b-4d2c-848f-99b57e8fce6f/screenshot_a763f7bb86d8490fa0daef7c65b994ed.png)

![7 findings with severity badges](https://app.devin.ai/attachments/a71e8576-0c04-4403-a59c-9595f0f184db/screenshot_dad62d59f67a479097da9bf7d10b3764.png)

![AI Dossier executive summary](https://app.devin.ai/attachments/a6f49480-1cf5-418f-bcd8-7bb5c8f7a925/screenshot_194958c7683c4819b7e6f86dbe98d0dc.png)

### T4 — PhantomShield DEPLOY ALL + Live Monitoring

![All 4 decoys Active + success banner](https://app.devin.ai/attachments/6ef09a17-a12a-4418-95ca-5fb0f0ddfb9b/screenshot_ba6994c1ea2f4911ad98430e68ff81e6.png)

![Live Monitoring streaming tripwire events](https://app.devin.ai/attachments/0bd272a6-78ee-44d3-b53f-66e232e95056/screenshot_63e65ecae64f4d4393c8c53d346f2b75.png)

### T5 — Alerts after SIMULATE ATTACK

![New alert card at top with step 3 triggered](https://app.devin.ai/attachments/b54373c7-68c0-4a96-97f1-73744cc1cc63/screenshot_ad449e2f883545ef9cc2e471080cd748.png)

### T6 — Reports trend + scan history

![Reports trend chart + scan history](https://app.devin.ai/attachments/cf2229c9-2dfd-4cdf-946b-1eaa63d612b6/screenshot_8456aac347c349bb83274c16be15c9c9.png)

### T7 — Demo Mode (D key)

![Demo Mode activated on Reports — 7-point trend](https://app.devin.ai/attachments/2f07aab2-1893-4480-884b-57b23bf8ee3c/screenshot_0cbda7cae4304b978d9b8c0b77b0932e.png)

![Dashboard gauge shows 84 CRITICAL with full dataset](https://app.devin.ai/attachments/ccc3aa82-abb9-4a25-b947-eb075a46aaae/screenshot_0d72e03f9c02472581ee474b432fa1dc.png)
