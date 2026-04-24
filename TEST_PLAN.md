# MirrorTrap — Test Plan

## What changed

Initial build of the MirrorTrap SaaS — this PR introduces every user-facing surface
(Landing, Auth, Dashboard, Scan, PhantomShield, Alerts, Reports, Settings) plus
Demo Mode and keyboard shortcuts. Since nothing existed before, every listed test
is effectively a green-field smoke test for the hackathon demo path judges will
watch live.

## What I will test (primary flow)

The single end-to-end path a judge will see:

1. Landing page renders correctly with the auto-playing hero terminal.
2. `/signup` → `/dashboard` works with local auth (no Supabase required).
3. Running an animated scan produces an ARS score + findings + AI Dossier.
4. PhantomShield "DEPLOY ALL" activates all 4 decoys with success banner.
5. Alerts "SIMULATE ATTACK" injects a dramatic alert card with attack path.
6. Reports page shows the ARS trend chart and scan history.
7. Demo Mode (press `D`) preloads the targetcompany.com dataset across pages.

## Test cases

Each case lists **concrete, verifiable** assertions. If any fail, we stop and fix.

### T1 — Landing hero renders with live terminal animation
**Steps**: Navigate to `/`.
**Assertions**:
- H1 contains the exact text "Hackers Study You Before Striking." and "MirrorTrap Shows You What They See." ([LandingPage.tsx:162-167](src/pages/LandingPage.tsx))
- The three stat callouts show exactly: "91%", "4.2hrs", "$4.9M" ([LandingPage.tsx:189-191](src/pages/LandingPage.tsx))
- Pricing shows three tiers with prices "₹0", "₹999", "₹9,999" ([LandingPage.tsx:108-128](src/pages/LandingPage.tsx))
- Hero terminal cycles through animated lines (visible caret + line count increases over ~5 seconds). If the terminal is static, **fail**.

### T2 — Signup → Dashboard
**Steps**: From `/`, click "Sign in" or "Scan Your Domain Free" → navigate to `/signup`. Enter `demo@example.com` / `password123`. Submit.
**Assertions**:
- Redirects to `/dashboard` (URL = `/dashboard`).
- Top bar shows `demo@example.com` in the "Signed in as" block.
- Sidebar lists exactly 6 items: Dashboard, New Scan, PhantomShield, Alerts, Reports, Settings ([DashboardShell.tsx:21-28](src/components/DashboardShell.tsx)).
- ARS gauge on dashboard shows "No scan yet" text because no scan has run yet ([DashboardHome.tsx:146-154](src/pages/DashboardHome.tsx)).
- "Scans this month" stat reads `0`, "Domains scanned" stat reads `0`.

### T3 — Scan flow: animated 5-source progression → ARS score → findings
**Steps**: Go to `/scan`. Type `acme-corp.com`. Click **Scan Now**.
**Assertions** (critical — if this is static or broken, the PR is broken):
- Terminal shows `$ mirrortrap scan acme-corp.com` as the first line ([ScanPage.tsx:185](src/pages/ScanPage.tsx)).
- 5 source rows tick through sequentially: HaveIBeenPwned → Shodan → crt.sh → GitHub → DNS (each showing a ✓ after it completes) ([ScanPage.tsx:32-38](src/pages/ScanPage.tsx)).
- All 5 checkboxes in the "Source status" panel turn to `✓` over ~5 seconds.
- After completion, a large ARS score counter animates from 0 up to a final 2-digit number (expected range 12-99). If it shows `0` or never animates, **fail**.
- "Time to exploit" box shows a number followed by `h`, "Primary entry path" shows a non-empty string, "Confidence" shows a `%`.
- At least 5 finding cards render, each with a severity badge (CRITICAL/HIGH/MEDIUM/LOW) and a source pill.
- Clicking the chevron on a finding expands a "What this means" panel.
- "Generate AI Dossier" button toggles a card containing the text "Executive summary".
- "Deploy PhantomShield" button navigates to `/phantomshield`.

### T4 — PhantomShield deploy-all + live monitoring
**Steps**: On `/phantomshield`, click **DEPLOY ALL**.
**Assertions**:
- All 4 decoy cards show the green "Active" pulse dot (text = "Active") ([PhantomShieldPage.tsx:71-82](src/pages/PhantomShieldPage.tsx)).
- Success banner appears with text containing "PhantomShield Active — 4 decoys deployed" ([PhantomShieldPage.tsx:209-216](src/pages/PhantomShieldPage.tsx)).
- Live Monitoring terminal begins appending new entries over ~5–10 seconds. If no new lines appear within 10s of deploy, **fail**.
- Clicking "View Logs" on the "Fake AWS Key" card opens a modal with a table of at least 1 row.

### T5 — Alerts: SIMULATE ATTACK
**Steps**: Navigate to `/alerts`. Click **SIMULATE ATTACK**.
**Assertions**:
- A new alert card slides in from the top (animated — visible transition) ([AlertsPage.tsx:44-50](src/pages/AlertsPage.tsx)).
- The top counter increments by 1 (e.g. 0 → 1, or previous → previous+1).
- The newest card has a colored left border (red for CRITICAL, amber for HIGH).
- Card shows a large monospace IP address in the expected format X.X.X.X.
- Clicking chevron reveals the "Probable attack path" with exactly 5 numbered steps, with step 3 highlighted with "← triggered" ([mockData.ts:177-183](src/lib/mockData.ts)).
- Clicking **Flag IP** updates the card to show "Flagged" pill and a toast appears.

### T6 — Reports trend chart
**Steps**: Navigate to `/reports`.
**Assertions**:
- Summary row shows "Scans this month", "Avg ARS", "Tripwires fired" with non-NaN numbers.
- Since at least one scan was completed in T3, the ARS trend chart renders with at least one data point. If it says "No scans yet" after a scan was completed, **fail**.
- Scan history table contains a row with the domain `acme-corp.com` from T3.

### T7 — Demo Mode preload via `D` key
**Steps**: From `/dashboard`, press the `D` key.
**Assertions** ([store.tsx:143-166](src/lib/store.tsx)):
- A toast appears titled "Demo Mode activated".
- "Domains scanned" stat increments by at least 7 (demo history + DEMO_SCAN).
- ARS gauge shows the domain `targetcompany.com` and an ARS value of `84`.
- Navigating to `/phantomshield` shows all 4 decoys Active.
- Navigating to `/alerts` shows at least 3 preloaded alerts.
- Navigating to `/reports` shows an ARS trend chart with multiple points.
- Pressing `D` again shows "Demo Mode disabled" toast.

## What a broken build would look like

- Scan terminal shows the full output instantly (not animated) → T3 fails.
- ARS number shows `0` or `NaN` → T3 fails.
- Deploy All leaves switches off → T4 fails.
- Simulate Attack adds no new card → T5 fails.
- Demo Mode changes nothing visible → T7 fails.
- Any page throws a React error / blank page → corresponding test fails.
