# MirrorTrap — Hackathon Walkthrough Video

A 4-minute narrated walkthrough of every feature in MirrorTrap, recorded against the live preview at https://dist-ouisymuc.devinapps.com.

## 🎥 Watch the video

### ▶ Watch on YouTube — **https://youtu.be/_gOj0ZJIpw4**

[![Watch the MirrorTrap walkthrough on YouTube](https://img.youtube.com/vi/_gOj0ZJIpw4/maxresdefault.jpg)](https://youtu.be/_gOj0ZJIpw4)

📺 **Backup MP4 in this folder:** [`MirrorTrap_Walkthrough.mp4`](./MirrorTrap_Walkthrough.mp4) — 224.6 s · 1280×800 · H.264 + AAC · 9.7 MB

> The MP4 above plays inline on its GitHub blob page (under 10 MB). For the highest-quality version, **use the YouTube link → https://youtu.be/_gOj0ZJIpw4**.

## 🎙️ Voice-over

- Engine: **[Sarvam AI](https://dashboard.sarvam.ai)** TTS — model `bulbul:v3`
- Speaker: **`shubh`** — *Energetic Voice for Helpdesk · Male*
- Language: `en-IN` · pace 1.0
- Audio file: [`audio/voiceover.mp3`](./audio/voiceover.mp3) (192 kbps)
- Per-segment timing: [`audio/manifest.json`](./audio/manifest.json)

## 📜 Script

The exact, time-coded narration is at [`docs/WALKTHROUGH_SCRIPT.md`](../docs/WALKTHROUGH_SCRIPT.md) at the repo root.

## 🧭 What's covered (11 segments, ≈ 4 min)

| # | Time | Segment | What you see |
|---|------|---------|--------------|
| 1 | 0:00 – 0:13 | Hook | "Every cyberattack starts the same way…" landing hero |
| 2 | 0:13 – 0:25 | Brand | MirrorTrap tagline + animated terminal |
| 3 | 0:25 – 0:41 | Landing & Dashboard | ARS gauge, breach window, scan history |
| 4 | 0:41 – 1:08 | **Company Domain Scan** | crt.sh + DNS + Shodan + GitHub + HIBP live findings, ARS 85 |
| 5 | 1:08 – 1:35 | **Personal Email Scan** *(new)* | HIBP catalog, breach cards, attacker-capability panel |
| 6 | 1:35 – 1:53 | **Hacker's Eye View** | MITRE ATT&CK kill chain T1595 → T1041 |
| 7 | 1:53 – 2:15 | **Breach Simulator** | Big red button, 12-min compressed replay, ransom note |
| 8 | 2:15 – 2:36 | **Dark Web Mirror + Hackability** | Marketplace listing, Grade D, downloadable Attacker Dossier |
| 9 | 2:36 – 2:55 | **PhantomShield** | AI honey assets + tripwire alerts |
| 10 | 2:55 – 3:23 | **Reports + Financial Impact + Alerts + Chat** | Attack Origin Intel, ROI, AI Chat assistant |
| 11 | 3:23 – 3:45 | Closing pitch | ₹999/mo vs $7,500/yr Canary · $4.9 M avg breach |

## 🔁 Reproduce the recording

```bash
# 1. Render audio with Sarvam (one WAV per segment + a concatenated MP3)
python3 walkthrough/generate_audio.py            # see docs/ for full pipeline

# 2. Open Chrome with CDP exposed on :29229 against the preview URL
google-chrome --remote-debugging-port=29229 \
  --window-size=1600,1000 --app=https://dist-ouisymuc.devinapps.com

# 3. Sign in to the demo account, then drive the timed walkthrough
python3 walkthrough/walkthrough.py prepare       # log in + return to landing
ffmpeg -y -f x11grab -framerate 30 -video_size 1600x1000 \
  -i :0.0+0,0 -t 230 -c:v libx264 -preset ultrafast -crf 22 \
  -pix_fmt yuv420p walkthrough/video/screen.mp4 &
python3 walkthrough/walkthrough.py play          # ~225 s timed choreography

# 4. Mux audio + video
ffmpeg -y -i walkthrough/video/screen.mp4 \
  -i walkthrough/audio/voiceover.mp3 \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest \
  walkthrough/MirrorTrap_Walkthrough.mp4
```

## 🛠 Files in this folder

| File | Purpose |
|------|---------|
| [`MirrorTrap_Walkthrough.mp4`](./MirrorTrap_Walkthrough.mp4) | 🎬 Final 4-minute narrated walkthrough — submit this |
| [`audio/voiceover.mp3`](./audio/voiceover.mp3) | Sarvam-rendered voice-over only (no video) |
| [`audio/manifest.json`](./audio/manifest.json) | Per-segment slug + start + duration |
| [`walkthrough.py`](./walkthrough.py) | Playwright orchestrator that drives Chrome through the timed choreography over CDP |
