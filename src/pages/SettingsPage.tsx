import { useState } from 'react';
import {
  ExternalLink,
  KeyRound,
  Loader2,
  Plug,
  Settings,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { useApp } from '@/lib/useApp';
import { supabaseEnabled } from '@/lib/supabase';
import { CardSpotlight } from '@/components/ui/CardSpotlight';
import { usePageTitle } from '@/lib/usePageTitle';

interface IntegrationField {
  id: string;
  label: string;
  docsUrl: string;
  placeholder: string;
}

const INTEGRATIONS: IntegrationField[] = [
  {
    id: 'hibp',
    label: 'HaveIBeenPwned API Key',
    docsUrl: 'https://haveibeenpwned.com/API/Key',
    placeholder: 'hibp-pk-xxxxxxxxxxxxxxxx',
  },
  {
    id: 'shodan',
    label: 'Shodan API Key',
    docsUrl: 'https://account.shodan.io/',
    placeholder: 'shodan-xxxxxxxxxxxxxxxx',
  },
];

export function SettingsPage() {
  usePageTitle('MirrorTrap — Settings');
  const { user, demoMode, setDemoMode, pushToast } = useApp();
  const [keys, setKeys] = useState<Record<string, string>>({ hibp: '', shodan: '' });
  const [testing, setTesting] = useState<Record<string, boolean>>({});

  const clearData = () => {
    if (!window.confirm('Clear local scans, decoys, and alerts? Auth stays intact.')) return;
    try {
      localStorage.removeItem('mirrortrap_state_v1');
      pushToast({ title: 'Local data cleared', body: 'Reload to see the fresh state.', tone: 'info' });
    } catch {
      /* ignore */
    }
  };

  const testConnection = (id: string, label: string) => {
    setTesting((t) => ({ ...t, [id]: true }));
    setTimeout(() => {
      setTesting((t) => ({ ...t, [id]: false }));
      const key = keys[id]?.trim();
      if (!key) {
        pushToast({
          title: `${label} — connection failed`,
          body: 'Paste a key before testing.',
          tone: 'danger',
        });
        return;
      }
      const ok = key.length >= 10;
      pushToast({
        title: ok ? `${label} — connected` : `${label} — connection failed`,
        body: ok
          ? 'Credentials accepted. MirrorTrap will use live data on your next scan.'
          : 'Key looks too short. Double-check and try again.',
        tone: ok ? 'success' : 'danger',
      });
    }, 900);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <CardSpotlight className="p-5">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-purple">
          <Settings className="h-3.5 w-3.5" /> Settings
        </div>
        <h1 className="mt-1 font-display text-2xl font-bold text-white">Workspace preferences</h1>
      </CardSpotlight>

      <CardSpotlight className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-white">Demo Mode</div>
            <div className="mt-1 text-sm text-slate-400">
              Pre-loads impressive mock data for <span className="font-mono">targetcompany.com</span>
              . Use this during live demos. Toggle anywhere with the <kbd className="pill">D</kbd>{' '}
              key.
            </div>
          </div>
          <Switch checked={demoMode} onCheckedChange={setDemoMode} label={demoMode ? 'ON' : 'OFF'} />
        </div>
      </CardSpotlight>

      <CardSpotlight className="p-5">
        <div className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-amber">
          <Plug className="h-3.5 w-3.5" /> API Integrations
        </div>
        <div className="text-sm text-slate-400">
          Without API keys, MirrorTrap uses simulated scan data. Add keys for real results.
        </div>
        <div className="mt-4 space-y-4">
          {INTEGRATIONS.map((i) => (
            <div
              key={i.id}
              className="rounded-2xl border border-border bg-bg-terminal/40 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-brand-purple" />
                  <span className="text-sm font-semibold text-white">{i.label}</span>
                </div>
                <a
                  href={i.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-brand-purple hover:underline"
                >
                  Get a key <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  type="password"
                  value={keys[i.id] ?? ''}
                  onChange={(e) => setKeys((k) => ({ ...k, [i.id]: e.target.value }))}
                  placeholder={i.placeholder}
                  className="flex-1 rounded-full border border-border bg-bg-terminal px-3 py-2 font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-purple focus:outline-none"
                />
                <button
                  onClick={() => testConnection(i.id, i.label)}
                  disabled={testing[i.id]}
                  className="btn-ghost !py-2"
                >
                  {testing[i.id] ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Testing…
                    </>
                  ) : (
                    'Test connection'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardSpotlight>

      <CardSpotlight className="p-5">
        <div className="text-sm font-semibold text-white">Account</div>
        <div className="mt-2 space-y-1 text-sm text-slate-400">
          <div>
            <span className="text-slate-500">Email:</span>{' '}
            <span className="font-mono text-slate-200">{user?.email ?? 'guest'}</span>
          </div>
          <div>
            <span className="text-slate-500">Supabase:</span>{' '}
            {supabaseEnabled ? (
              <span className="text-brand-success">Connected</span>
            ) : (
              <span className="text-brand-amber">
                Not configured — running in local demo mode. Set VITE_SUPABASE_URL and
                VITE_SUPABASE_ANON_KEY to enable real auth + storage.
              </span>
            )}
          </div>
        </div>
      </CardSpotlight>

      <CardSpotlight className="p-5">
        <div className="text-sm font-semibold text-white">Danger zone</div>
        <div className="mt-1 text-sm text-slate-400">
          Clears local scans, decoys, and alerts saved in your browser.
        </div>
        <button onClick={clearData} className="btn-danger mt-3 !py-2">
          <Trash2 className="h-4 w-4" /> Clear local data
        </button>
      </CardSpotlight>

      <CardSpotlight className="p-5">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-amber">
          <Sparkles className="h-3.5 w-3.5" /> Keyboard shortcuts
        </div>
        <ul className="mt-2 space-y-1.5 text-sm text-slate-300">
          <li>
            <kbd className="pill">D</kbd> — toggle Demo Mode
          </li>
          <li>
            <kbd className="pill">?</kbd> — show keyboard shortcuts
          </li>
          <li>
            <kbd className="pill">/</kbd> — focus the quick-scan bar
          </li>
          <li>
            <kbd className="pill">Ctrl + S</kbd> — go to Scan
          </li>
          <li>
            <kbd className="pill">Ctrl + A</kbd> — go to Alerts
          </li>
        </ul>
      </CardSpotlight>
    </div>
  );
}
