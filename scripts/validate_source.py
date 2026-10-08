"""Offline structural smoke check. This is NOT a runtime security test."""
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
expected = [
    'src/App.tsx', 'src/lib/supabase.ts',
    'supabase/migrations/001_production.sql',
    'supabase/functions/verify-domain/index.ts',
    'supabase/functions/verified-scan/index.ts',
    'supabase/functions/tripwire-collect/index.ts',
]
for f in expected:
    assert (root / f).is_file(), f'Missing {f}'
assert not (root / 'src/lib/demo-data.ts').exists()
assert not (root / 'walkthrough').exists()
frontend = '\n'.join(p.read_text() for p in (root / 'src').rglob('*.ts*'))
assert 'VITE_ANTHROPIC_API_KEY' not in frontend
assert 'DEMO_SCAN' not in frontend
assert 'generateAlert()' not in frontend
assert 'simulateAttack' not in frontend
assert 'localStorage' not in frontend
assert 'SUPABASE_SERVICE_ROLE_KEY' not in frontend
schema = (root / 'supabase/migrations/001_production.sql').read_text().lower()
for table in ['mt_assets', 'mt_scans', 'mt_tripwires', 'mt_events']:
    assert re.search(rf'alter table public\.{table} enable row level security', schema), table
print('PASS: expected files and RLS policies present; demo and browser-secret patterns absent.')
print('NOTE: typechecking, network calls, integration and security review are still required.')
