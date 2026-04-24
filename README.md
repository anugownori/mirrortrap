# MirrorTrap

**See yourself through a hacker's eyes.**

MirrorTrap is a full-stack cybersecurity SaaS that scans a company's public
attack surface, deploys AI-generated decoy assets (honey AWS keys, admin
portals, tracking URLs), and catches attackers in real time — before they
reach real systems.

![MirrorTrap](./public/favicon.svg)

## What's inside

- **Landing page** with cinematic hero, live terminal animation, pricing.
- **Supabase auth** (graceful fallback to local demo auth if env vars are absent).
- **Scan flow** — animated 5-source OSINT sweep (HIBP, Shodan, crt.sh, GitHub, DNS),
  ARS score counter, severity-coded findings, and AI dossier.
- **PhantomShield** — 4 deployable decoys with per-asset logs and a live
  monitoring terminal feed.
- **Alerts** — dramatic tripwire-fired UI with behavior analysis, classification,
  and a probable attack-path timeline. One-click "Simulate Attack" for demos.
- **Reports** — Recharts ARS trend chart, scan history, downloadable HTML
  reports (print-to-PDF).
- **Dashboard** — animated ARS gauge, stat cards, recent alerts, scan history,
  and a quick-scan input bar.
- **Demo Mode** — preloads a full `targetcompany.com` dataset across the app.
  Toggle with the navbar button or press <kbd>D</kbd> anywhere.

## Tech

- React 19 + TypeScript
- Tailwind CSS 3 + tailwindcss-animate
- React Router v6
- Supabase JS SDK (auth + data)
- Recharts (trend chart)
- Lucide React (icons)
- Radix UI primitives (Switch)

## Getting started

```bash
npm install
npm run dev
# → http://localhost:5173
```

### Supabase (optional)

Create a `.env.local` file:

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

Suggested tables (all user-scoped via RLS):

```sql
create table scans (
  id text primary key,
  user_id uuid references auth.users not null,
  domain text not null,
  ars_score int not null,
  findings_json jsonb not null,
  created_at timestamptz not null default now()
);

create table alerts (
  id text primary key,
  user_id uuid references auth.users not null,
  severity text not null,
  ip text not null,
  asset_used text not null,
  payload_json jsonb not null,
  created_at timestamptz not null default now()
);

create table decoys (
  id text primary key,
  user_id uuid references auth.users not null,
  active boolean not null default false,
  meta_json jsonb,
  updated_at timestamptz not null default now()
);
```

Without Supabase configured, the app runs in fully-mocked local mode — any
email + password logs in, all state is persisted to `localStorage`.

### Keyboard shortcuts

- <kbd>D</kbd> — toggle Demo Mode
- <kbd>/</kbd> — focus the quick-scan bar

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — typecheck + production build
- `npm run lint` — ESLint
- `npm run preview` — preview the production build

## Design

- Background `#0D0B1A`, surface `#1A1730`, terminal `#0A0814`
- Primary `#7F77DD`, amber `#EF9F27`, danger `#F09595`, success `#1D9E75`
- Inter for UI, JetBrains Mono for terminals and code

## License

All rights reserved — built for a hackathon demo.
