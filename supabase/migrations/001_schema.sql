-- MirrorTrap Production Schema
-- Migration 001 — Initial schema
-- Run this in your Supabase SQL editor

-- ─────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  full_name   TEXT,
  avatar_url  TEXT,
  plan        TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  demo_mode   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ─────────────────────────────────────────────
-- SCANS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scans (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target                    TEXT NOT NULL,
  ars_score                 INTEGER CHECK (ars_score BETWEEN 0 AND 100),
  risk_level                TEXT CHECK (risk_level IN ('MINIMAL', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
  status                    TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scanning', 'complete', 'failed')),
  findings                  JSONB DEFAULT '[]',
  attack_paths              JSONB DEFAULT '[]',
  estimated_exploit_time    TEXT,
  primary_attack_vector     TEXT,
  scan_duration_seconds     INTEGER,
  confidence                INTEGER DEFAULT 70,
  real_sources_used         TEXT[] DEFAULT '{}',
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS scans_user_id_idx ON scans(user_id);
CREATE INDEX IF NOT EXISTS scans_created_at_idx ON scans(created_at DESC);

-- ─────────────────────────────────────────────
-- HONEYPOTS (decoys deployed)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS honeypots (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  type              TEXT NOT NULL,
  url               TEXT,
  status            TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deploying')),
  interaction_count INTEGER DEFAULT 0,
  last_triggered    TIMESTAMPTZ,
  config            JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS honeypots_user_id_idx ON honeypots(user_id);

-- ─────────────────────────────────────────────
-- THREAT ALERTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS threat_alerts (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID REFERENCES profiles(id) ON DELETE CASCADE,
  honeypot_id             UUID REFERENCES honeypots(id) ON DELETE SET NULL,
  severity                TEXT NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  attacker_ip             TEXT,
  attacker_geo            JSONB,
  attacker_tool           TEXT,
  attacker_classification TEXT,
  confidence_score        FLOAT CHECK (confidence_score BETWEEN 0 AND 1),
  event_type              TEXT,
  raw_payload             JSONB,
  replay_data             JSONB,
  is_read                 BOOLEAN DEFAULT false,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS threat_alerts_user_id_idx ON threat_alerts(user_id);
CREATE INDEX IF NOT EXISTS threat_alerts_severity_idx ON threat_alerts(severity);
CREATE INDEX IF NOT EXISTS threat_alerts_created_at_idx ON threat_alerts(created_at DESC);

-- ─────────────────────────────────────────────
-- TRIPWIRE EVENTS (individual events per alert)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tripwire_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id    UUID REFERENCES threat_alerts(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type  TEXT,
  timestamp   TIMESTAMPTZ DEFAULT NOW(),
  metadata    JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS tripwire_events_alert_id_idx ON tripwire_events(alert_id);

-- ─────────────────────────────────────────────
-- REPLAY SESSIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS replay_sessions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id             UUID REFERENCES threat_alerts(id) ON DELETE CASCADE,
  user_id              UUID REFERENCES profiles(id) ON DELETE CASCADE,
  steps                JSONB NOT NULL DEFAULT '[]',
  attacker_profile     JSONB,
  predicted_next_moves JSONB,
  confidence_score     FLOAT CHECK (confidence_score BETWEEN 0 AND 1),
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS replay_sessions_alert_id_idx ON replay_sessions(alert_id);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans           ENABLE ROW LEVEL SECURITY;
ALTER TABLE honeypots       ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_alerts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tripwire_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE replay_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (id = auth.uid());

-- Scans
CREATE POLICY "scans_own" ON scans
  FOR ALL USING (user_id = auth.uid());

-- Honeypots
CREATE POLICY "honeypots_own" ON honeypots
  FOR ALL USING (user_id = auth.uid());

-- Threat alerts
CREATE POLICY "threat_alerts_own" ON threat_alerts
  FOR ALL USING (user_id = auth.uid());

-- Tripwire events
CREATE POLICY "tripwire_events_own" ON tripwire_events
  FOR ALL USING (user_id = auth.uid());

-- Replay sessions
CREATE POLICY "replay_sessions_own" ON replay_sessions
  FOR ALL USING (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- REALTIME PUBLICATIONS
-- ─────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE threat_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE honeypots;
ALTER PUBLICATION supabase_realtime ADD TABLE tripwire_events;
