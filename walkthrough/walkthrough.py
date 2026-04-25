"""Drive the deployed MirrorTrap site through a full feature walkthrough,
on a timeline that exactly matches the Sarvam-rendered voiceover segments.
Connects to Chrome over CDP at http://localhost:29229.

Usage:
    python3 walkthrough.py prepare    # log in + return to landing
    python3 walkthrough.py play       # run timed choreography
"""
import asyncio
import json
import sys
import time
from pathlib import Path

from playwright.async_api import async_playwright

BASE = "https://dist-ouisymuc.devinapps.com"
MANIFEST = Path(__file__).resolve().parent / "audio" / "manifest.json"


def load_timeline():
    raw = json.loads(MANIFEST.read_text())
    timeline = {}
    for s in raw:
        timeline[s["slug"]] = (float(s["start"]), float(s["start"] + s["duration"]))
    return timeline


async def wait_until(t0: float, target: float):
    delay = target - (time.monotonic() - t0)
    if delay > 0:
        await asyncio.sleep(delay)


async def smooth_scroll(page, total_px: int, duration: float):
    steps = max(int(duration * 30), 1)
    each = total_px / steps
    interval = duration / steps
    for _ in range(steps):
        try:
            await page.mouse.wheel(0, each)
        except Exception:
            pass
        await asyncio.sleep(interval)


async def attach():
    pw = await async_playwright().start()
    browser = await pw.chromium.connect_over_cdp("http://localhost:29229")
    ctx = browser.contexts[0]
    pages = ctx.pages
    page = pages[0] if pages else await ctx.new_page()
    for pg in pages[1:]:
        try:
            await pg.close()
        except Exception:
            pass
    await page.bring_to_front()
    await page.set_viewport_size({"width": 1600, "height": 1000})
    return pw, browser, page


async def prepare():
    pw, browser, page = await attach()
    await page.goto(f"{BASE}/login", wait_until="load", timeout=20000)
    await asyncio.sleep(0.8)
    # If we got bounced to /dashboard (already signed in), great. Otherwise log in.
    if "/login" in page.url:
        await page.wait_for_selector('input[type="email"]', timeout=10000)
        await page.fill('input[type="email"]', "demo@mirrortrap.io")
        await page.fill('input[type="password"]', "MirrorTrap2026!")
        await page.click('button[type="submit"]')
        try:
            await page.wait_for_url("**/dashboard", timeout=15000)
        except Exception as e:
            print("dashboard wait warn:", e)
        await asyncio.sleep(0.6)
    await page.goto(BASE, wait_until="load", timeout=20000)
    await asyncio.sleep(1.0)
    print("PREPARED — landing page is live, user signed in.")


async def pulse_scroll(page, times: int, dx: int, gap: float = 1.5):
    for _ in range(times):
        try:
            await page.mouse.wheel(0, dx)
        except Exception:
            pass
        await asyncio.sleep(gap)


async def play():
    tl = load_timeline()
    print("Timeline:", json.dumps(tl, indent=2))
    pw, browser, page = await attach()
    if not page.url.startswith(BASE):
        await page.goto(BASE, wait_until="commit", timeout=20000)
        await asyncio.sleep(1.0)
    print("GO in 1.0s")
    await asyncio.sleep(1.0)
    t0 = time.monotonic()

    # ---- Segments 1+2 (0.00 – 24.66s): Landing + Brand intro ----
    await smooth_scroll(page, 1200, 16.0)
    await asyncio.sleep(0.2)
    await page.evaluate("window.scrollTo({top: 0, behavior: 'smooth'})")
    await wait_until(t0, tl["03_landing"][0])

    # ---- Segment 3 (24.66 – 41.13): Landing & Dashboard tour ----
    await page.goto(f"{BASE}/dashboard", wait_until="commit", timeout=15000)
    await smooth_scroll(page, 900, 12.0)
    await page.evaluate("window.scrollTo({top: 0, behavior: 'smooth'})")
    await wait_until(t0, tl["04_domain"][0])

    # ---- Segment 4 (41.13 – 68.45): Company Domain Scan ----
    await page.goto(f"{BASE}/scan", wait_until="commit", timeout=15000)
    await asyncio.sleep(1.0)
    # Ensure Company Domain pill is active.
    try:
        company_pill = page.locator('button[aria-pressed]:has-text("Company Domain")').first
        if await company_pill.count():
            await company_pill.click(timeout=2500)
    except Exception:
        pass
    await asyncio.sleep(0.3)
    domain_input = page.locator('input[placeholder="company.com"]').first
    try:
        await domain_input.click(timeout=5000)
        await domain_input.fill("")
        await page.keyboard.type("acme-corp.com", delay=70)
        await asyncio.sleep(0.4)
        scan_btn = page.locator('button:has-text("Scan Now"), button:has-text("Run scan"), button:has-text("Start scan")').first
        await scan_btn.click(timeout=4000)
    except Exception as e:
        print("domain scan setup failed:", e)
    await pulse_scroll(page, times=8, dx=180, gap=1.6)
    await wait_until(t0, tl["05_email"][0] - 0.5)

    # ---- Segment 5 (68.45 – 94.83): Personal Email Scan ----
    await page.evaluate("window.scrollTo({top: 0, behavior: 'instant'})")
    await asyncio.sleep(0.4)
    try:
        email_pill = page.locator('button[aria-pressed]:has-text("Personal Email")').first
        await email_pill.click(timeout=5000)
    except Exception as e:
        print("email pill click failed:", e)
    await asyncio.sleep(0.8)
    email_input = page.locator('input[type="email"]').first
    try:
        await email_input.click(timeout=5000)
        await email_input.fill("")
        await page.keyboard.type("ganesh.demo@gmail.com", delay=55)
        await asyncio.sleep(0.4)
        check_btn = page.locator('button:has-text("Check My Email")').first
        await check_btn.click(timeout=4000)
    except Exception as e:
        print("email scan setup failed:", e)
    await pulse_scroll(page, times=10, dx=200, gap=1.5)
    await wait_until(t0, tl["06_killchain"][0])

    # ---- Segment 6 (94.83 – 113.37): Hacker's Eye View / Kill Chain ----
    await page.goto(f"{BASE}/hackers-eye", wait_until="commit", timeout=15000)
    await asyncio.sleep(1.0)
    await smooth_scroll(page, 800, 10.0)
    await wait_until(t0, tl["07_breach"][0])

    # ---- Segment 7 (113.37 – 135.06): Breach Simulator ----
    try:
        sim = page.get_by_role("button", name="Simulate Breach")
        await sim.scroll_into_view_if_needed()
        await sim.click(timeout=4000)
    except Exception:
        try:
            btn = page.locator('button:has-text("Simulate Breach")').first
            await btn.scroll_into_view_if_needed()
            await btn.click()
        except Exception as e:
            print("breach btn failed:", e)
    await wait_until(t0, tl["08_darkweb"][0] - 0.8)
    try:
        await page.keyboard.press("Escape")
    except Exception:
        pass
    await asyncio.sleep(0.3)

    # ---- Segment 8 (135.06 – 156.49): Dark Web + Hackability + Dossier ----
    await smooth_scroll(page, 1400, 18.0)
    await wait_until(t0, tl["09_phantom"][0])

    # ---- Segment 9 (156.49 – 175.28): PhantomShield ----
    await page.goto(f"{BASE}/phantomshield", wait_until="commit", timeout=15000)
    await asyncio.sleep(1.0)
    await smooth_scroll(page, 700, 14.0)
    await wait_until(t0, tl["10_reports"][0])

    # ---- Segment 10 (175.28 – 202.85): Reports + Alerts + Chat ----
    await page.goto(f"{BASE}/reports", wait_until="commit", timeout=15000)
    await asyncio.sleep(0.6)
    try:
        await page.get_by_role("button", name="Financial Impact").click(timeout=2500)
    except Exception:
        pass
    await smooth_scroll(page, 800, 9.0)
    await page.goto(f"{BASE}/alerts", wait_until="commit", timeout=15000)
    await asyncio.sleep(0.4)
    await smooth_scroll(page, 500, 9.0)
    try:
        chat_btn = page.locator(
            'button[aria-label*="chat" i], button:has-text("Ask MirrorTrap")'
        ).first
        if await chat_btn.count():
            await chat_btn.click(timeout=2000)
    except Exception:
        pass
    await wait_until(t0, tl["11_closing"][0])

    # ---- Segment 11 (202.85 – 224.59): Closing pitch ----
    await page.goto(BASE, wait_until="commit", timeout=15000)
    await asyncio.sleep(0.6)
    await smooth_scroll(page, 2400, 16.0)
    await page.evaluate("window.scrollTo({top: 0, behavior: 'smooth'})")
    await wait_until(t0, 224.5)

    elapsed = time.monotonic() - t0
    print(f"Choreography finished in {elapsed:.2f}s")


def usage():
    print(__doc__)
    sys.exit(2)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        usage()
    cmd = sys.argv[1]
    if cmd == "prepare":
        asyncio.run(prepare())
    elif cmd == "play":
        asyncio.run(play())
    else:
        usage()
