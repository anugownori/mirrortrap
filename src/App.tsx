import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  Activity, ArrowRight, Bell, CheckCircle2, ClipboardCopy, Download, ExternalLink,
  Fingerprint, Globe2, KeyRound, Loader2, LockKeyhole, LogOut, Plus, Radar,
  RefreshCw, SearchCheck, Shield, ShieldAlert, ShieldCheck, ShieldOff, XCircle,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { apiBase, configured, supabase } from './lib/supabase';

type View = 'overview' | 'assets' | 'scans' | 'tripwires' | 'events' | 'reports';
type Asset = { id: string; user_id: string; domain: string; challenge: string; verified_at: string | null; created_at: string };
type Finding = { severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH'; source: string; title: string; evidence: Record<string, unknown>; recommendation: string };
type SourceStatus = { status: 'ok' | 'error' | 'skipped'; error?: string; collected_at?: string };
type Scan = { id: string; asset_id: string; domain: string; exposure_index: number; findings: Finding[]; sources: Record<string, SourceStatus>; created_at: string };
type Tripwire = { id: string; label: string; token_hash: string; active: boolean; created_at: string };
type Event = { id: string; tripwire_id: string; method: string; reported_ip: string | null; user_agent: string | null; observed_at: string };
const domainPattern = /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

function randomHex(length: number): string {
  const data = new Uint8Array(length);
  crypto.getRandomValues(data);
  return Array.from(data, byte => byte.toString(16).padStart(2, '0')).join('');
}
async function sha256(value: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}
function date(value: string | null): string {
  return value ? new Date(value).toLocaleString() : 'Not verified';
}
function saveJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
function severityClass(severity: string) {
  return severity === 'HIGH' ? 'text-rose-300 bg-rose-400/10 border-rose-400/20' :
    severity === 'MEDIUM' ? 'text-amber-300 bg-amber-400/10 border-amber-400/20' :
    'text-sky-300 bg-sky-400/10 border-sky-400/20';
}
function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-white/10 bg-[#111827]/80 shadow-[0_12px_45px_rgba(0,0,0,0.13)] ${className}`}>{children}</section>;
}
function Button({ children, onClick, disabled = false, variant = 'primary', type = 'button' }:
  { children: ReactNode; onClick?: () => void; disabled?: boolean; variant?: 'primary' | 'muted' | 'danger'; type?: 'button' | 'submit' }) {
  const style = variant === 'primary' ? 'bg-indigo-500 hover:bg-indigo-400 text-white' :
    variant === 'danger' ? 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20' :
      'bg-white/5 text-slate-200 hover:bg-white/10 border border-white/10';
  return <button type={type} onClick={onClick} disabled={disabled}
    className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${style}`}>{children}</button>;
}
function Empty({ title, body }: { title: string; body: string }) {
  return <div className="flex min-h-40 flex-col items-center justify-center gap-2 px-6 py-8 text-center">
    <ShieldOff className="h-6 w-6 text-slate-500" /><b className="text-slate-200">{title}</b>
    <p className="max-w-lg text-sm text-slate-400">{body}</p>
  </div>;
}

export default function App() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [view, setView] = useState<View>('overview');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [tripwires, setTripwires] = useState<Tripwire[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [assetDomain, setAssetDomain] = useState('');
  const [wireLabel, setWireLabel] = useState('');
  const [newWireUrl, setNewWireUrl] = useState('');
  const [selectedScan, setSelectedScan] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (!supabase) { setCheckingSession(false); return; }
    let active = true;
    void supabase.auth.getSession().then(({ data, error: authError }) => {
      if (!active) return;
      if (authError) setError(authError.message);
      setUser(data.session?.user ?? null);
      setCheckingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setCheckingSession(false);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  const reload = useCallback(async () => {
    if (!supabase || !user) return;
    setLoadingData(true);
    const [a, s, t, e] = await Promise.all([
      supabase.from('mt_assets').select('*').order('created_at', { ascending: false }),
      supabase.from('mt_scans').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('mt_tripwires').select('*').order('created_at', { ascending: false }),
      supabase.from('mt_events').select('*').order('observed_at', { ascending: false }).limit(100),
    ]);
    if (a.error || s.error || t.error || e.error) setError([a.error, s.error, t.error, e.error].filter(Boolean).map(x => x!.message).join(' | '));
    else {
      setAssets((a.data ?? []) as Asset[]);
      setScans((s.data ?? []) as Scan[]);
      setTripwires((t.data ?? []) as Tripwire[]);
      setEvents((e.data ?? []) as Event[]);
    }
    setLoadingData(false);
  }, [user]);
  useEffect(() => {
    if (!user) { setAssets([]); setScans([]); setTripwires([]); setEvents([]); return; }
    void reload();
    const timer = window.setInterval(() => { void reload(); }, 30000);
    return () => window.clearInterval(timer);
  }, [user, reload]);

  const runAction = async (name: string, fn: () => Promise<void>) => {
    setBusy(name); setError(''); setNotice('');
    try { await fn(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Operation failed'); }
    finally { setBusy(''); }
  };
  const submitAuth = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction('auth', async () => {
      if (!supabase) throw new Error('Supabase is not configured. Set the environment variables and restart.');
      if (password.length < 12) throw new Error('Use a password of at least 12 characters.');
      if (authMode === 'login') {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
      } else {
        const { data, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;
        setNotice(data.session ? 'Account created and signed in.' : 'Check your email to confirm the account, then sign in.');
      }
    });
  };
  const addAsset = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction('asset', async () => {
      if (!supabase || !user) throw new Error('Sign in required');
      const domain = assetDomain.trim().toLowerCase().replace(/\.$/, '');
      if (!domainPattern.test(domain)) throw new Error('Enter a valid hostname you own, such as example.com.');
      const { error: insertError } = await supabase.from('mt_assets').insert({
        user_id: user.id, domain, challenge: randomHex(16),
      });
      if (insertError) throw insertError;
      setAssetDomain(''); setNotice('Asset added. Publish the TXT record shown below, then verify it.');
      await reload();
    });
  };
  const invoke = async (name: string, payload: Record<string, string>) => {
    if (!supabase) throw new Error('Supabase configuration required');
    const { data, error: invokeError } = await supabase.functions.invoke(name, { body: payload });
    if (invokeError) {
      const context = 'context' in invokeError ? invokeError.context as Response | undefined : undefined;
      const body = context ? await context.clone().json().catch(() => null) : null;
      throw new Error((body as { error?: string } | null)?.error || invokeError.message);
    }
    if ((data as { error?: string } | null)?.error) throw new Error((data as { error: string }).error);
    return data;
  };
  const verifyAsset = (asset: Asset) => void runAction(`verify-${asset.id}`, async () => {
    await invoke('verify-domain', { asset_id: asset.id });
    setNotice(`${asset.domain} verified through public DNS.`);
    await reload();
  });
  const scanAsset = (asset: Asset) => void runAction(`scan-${asset.id}`, async () => {
    if (!asset.verified_at) throw new Error('Domain ownership verification required.');
    await invoke('verified-scan', { asset_id: asset.id });
    setNotice(`Real-source scan completed for ${asset.domain}. Partial-source failures are displayed in the report.`);
    setView('scans'); setSelectedScan(null);
    await reload();
  });
  const createTripwire = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction('wire', async () => {
      if (!supabase || !user || !apiBase) throw new Error('Supabase must be configured');
      const label = wireLabel.trim();
      if (!label || label.length > 80) throw new Error('Use a descriptive label of at most 80 characters.');
      const token = randomHex(32);
      const tokenHash = await sha256(token);
      const { error: insertError } = await supabase.from('mt_tripwires').insert({ user_id: user.id, label, token_hash: tokenHash });
      if (insertError) throw insertError;
      setNewWireUrl(`${apiBase}/tripwire-collect/${token}`);
      setWireLabel('');
      setNotice('Tripwire created. Copy its URL now; the secret URL is only displayed once.');
      await reload();
    });
  };
  const revokeWire = (wire: Tripwire) => void runAction(`revoke-${wire.id}`, async () => {
    if (!supabase || !wire.active) return;
    const { error: updateError } = await supabase.from('mt_tripwires').update({ active: false }).eq('id', wire.id);
    if (updateError) throw updateError;
    setNotice('Tripwire disabled. Its URL will no longer record events.');
    await reload();
  });
  const logout = () => void runAction('logout', async () => {
    if (!supabase) return;
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) throw signOutError;
    setView('overview'); setNewWireUrl(''); setPassword('');
  });
  const activeWires = useMemo(() => tripwires.filter(x => x.active).length, [tripwires]);
  const displayedScan = selectedScan ? scans.find(x => x.id === selectedScan) : scans[0];

  if (checkingSession) return <div className="min-h-screen bg-[#090d18] flex items-center justify-center text-slate-400"><Loader2 className="mr-3 animate-spin"/>Checking session…</div>;
  if (!configured) return <div className="min-h-screen bg-[#090d18] grid place-items-center p-6"><Panel className="max-w-xl p-8 space-y-4">
    <ShieldAlert className="h-10 w-10 text-amber-400"/><h1 className="text-2xl font-bold">MirrorTrap requires configuration</h1>
    <p className="text-slate-300">Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local, apply the SQL migration, and deploy the functions. For security, there is no fallback account or fabricated local dataset.</p>
    <p className="text-sm text-slate-400">See README.md and docs/DEPLOYMENT.md.</p>
  </Panel></div>;
  if (!user) return <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080B14] p-5">
    <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl"/>
    <div className="relative grid w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#0d1323] shadow-2xl md:grid-cols-2">
      <section className="hidden space-y-7 bg-gradient-to-br from-indigo-600/20 to-transparent p-10 md:block">
        <div className="flex items-center gap-3"><Shield className="h-8 w-8 text-indigo-300"/><span className="text-2xl font-bold tracking-tight">MirrorTrap</span></div>
        <h1 className="text-4xl font-semibold leading-tight">Know what is exposed. Monitor what gets touched.</h1>
        <p className="text-slate-300">Verified-domain reconnaissance and real honeytoken events, with evidence recorded in your own workspace.</p>
        <div className="space-y-4 text-sm text-slate-300">
          <p className="flex items-center gap-3"><SearchCheck className="text-indigo-300"/> Domain ownership checks</p>
          <p className="flex items-center gap-3"><Globe2 className="text-indigo-300"/> Public-source network exposure data</p>
          <p className="flex items-center gap-3"><Bell className="text-indigo-300"/> Evidence-backed canary URL alerts</p>
        </div>
      </section>
      <section className="space-y-6 p-8 md:p-10">
        <div className="flex items-center gap-2 md:hidden"><Shield className="text-indigo-300"/>MirrorTrap</div>
        <div><h2 className="text-2xl font-bold">{authMode === 'login' ? 'Sign in' : 'Create an account'}</h2><p className="mt-1 text-sm text-slate-400">Secure workspace access through Supabase Authentication.</p></div>
        <form onSubmit={submitAuth} className="space-y-4">
          <label className="block space-y-1 text-sm text-slate-300">Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-indigo-400"/></label>
          <label className="block space-y-1 text-sm text-slate-300">Password<input required type="password" minLength={12} value={password} onChange={e=>setPassword(e.target.value)} autoComplete={authMode==='login'?'current-password':'new-password'} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-indigo-400"/></label>
          <Button type="submit" disabled={!!busy}><LockKeyhole size={16}/>{busy ? 'Please wait…' : authMode === 'login' ? 'Sign in' : 'Create account'}<ArrowRight size={16}/></Button>
        </form>
        <button onClick={()=>{setAuthMode(authMode === 'login' ? 'signup' : 'login');setError('');setNotice('');}} className="text-sm text-indigo-300 hover:underline">{authMode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}</button>
        {error && <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
        {notice && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">{notice}</p>}
        <p className="text-xs text-slate-500">Scan only domains you own or are authorized to assess. No simulated security findings are created.</p>
      </section>
    </div>
  </main>;

  const navigation: Array<{ key: View; label: string; icon: typeof Activity }> = [
    { key: 'overview', label: 'Overview', icon: Activity },
    { key: 'assets', label: 'Verified assets', icon: Globe2 },
    { key: 'scans', label: 'Exposure scans', icon: Radar },
    { key: 'tripwires', label: 'Tripwire URLs', icon: KeyRound },
    { key: 'events', label: 'Security events', icon: Bell },
    { key: 'reports', label: 'Evidence reports', icon: Fingerprint },
  ];
  return <div className="min-h-screen bg-[#080B14] text-slate-100">
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0c1120]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6">
        <Shield className="h-7 w-7 text-indigo-400"/><b className="text-lg tracking-tight">MirrorTrap</b>
        <span className="ml-1 rounded-md border border-indigo-400/20 bg-indigo-400/10 px-2 py-0.5 text-xs text-indigo-200">Security workspace</span>
        <div className="ml-auto flex items-center gap-3"><span className="hidden max-w-48 truncate text-xs text-slate-400 sm:inline">{user.email}</span>
          <Button variant="muted" onClick={()=>void reload()} disabled={loadingData}><RefreshCw size={15} className={loadingData?'animate-spin':''}/>Refresh</Button>
          <button onClick={logout} title="Sign out" aria-label="Sign out" className="rounded-lg p-2 text-slate-400 hover:bg-white/10"><LogOut size={18}/></button>
        </div>
      </div>
    </header>
    <div className="mx-auto grid max-w-7xl gap-5 p-4 sm:p-6 lg:grid-cols-[225px_1fr]">
      <aside className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
        {navigation.map(({key,label,icon: Icon})=><button key={key} onClick={()=>{setView(key);setError('');setNotice('');}} className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${view===key?'bg-indigo-500/20 text-indigo-200 ring-1 ring-indigo-400/30':'text-slate-400 hover:bg-white/5 hover:text-white'}`}><Icon size={18}/>{label}</button>)}
        <div className="mt-4 hidden rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-xs leading-relaxed text-slate-400 lg:block">Only recorded observations are shown. Public data can be stale; always confirm before remediation.</div>
      </aside>
      <main className="min-w-0 space-y-5 pb-12">
        {error && <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200"><XCircle size={18} className="shrink-0"/>{error}</div>}
        {notice && <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200"><CheckCircle2 size={18} className="shrink-0"/>{notice}</div>}
        {view==='overview' && <>
          <div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-[.2em] text-indigo-400">Defensive monitoring</p><h1 className="text-3xl font-bold">Security overview</h1><p className="text-slate-400">Records retrieved from your authenticated workspace. No simulated incidents or generated activity.</p></div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {label:'Verified domains',n:assets.filter(x=>x.verified_at).length,icon:ShieldCheck},
              {label:'Recorded scans',n:scans.length,icon:Radar},
              {label:'Active canary URLs',n:activeWires,icon:KeyRound},
              {label:'Recorded URL events',n:events.length,icon:Bell},
            ].map(({label,n,icon:Icon})=><Panel key={label} className="p-5"><Icon size={19} className="text-indigo-300"/><div className="mt-4 text-3xl font-bold tabular-nums">{n}</div><p className="mt-1 text-sm text-slate-400">{label}</p></Panel>)}
          </div>
          <Panel className="p-6"><h2 className="text-xl font-semibold">Latest recorded activity</h2><p className="mb-5 mt-1 text-sm text-slate-400">Source timestamps are preserved so that reports remain auditable.</p>
            {!scans.length && !events.length?<Empty title="No recorded activity" body="Verify a domain and run an authorized scan, or deploy a canary URL. No activity is invented."/>:
              <div className="space-y-3">{scans.slice(0,3).map(s=><div key={s.id} className="flex justify-between gap-3 border-b border-white/5 pb-3 text-sm"><span>Scan of <b>{s.domain}</b></span><span className="text-slate-400">{date(s.created_at)}</span></div>)}{events.slice(0,3).map(e=><div key={e.id} className="flex justify-between gap-3 border-b border-white/5 pb-3 text-sm"><span>Canary URL request recorded</span><span className="text-slate-400">{date(e.observed_at)}</span></div>)}</div>}
          </Panel>
        </>}
        {view==='assets' && <>
          <div><h1 className="text-3xl font-bold">Verified assets</h1><p className="mt-1 text-sm text-slate-400">You must prove DNS control before requesting a scan.</p></div>
          <Panel className="p-5"><form onSubmit={addAsset} className="flex flex-col gap-3 sm:flex-row"><input required placeholder="your-domain.example" value={assetDomain} onChange={e=>setAssetDomain(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-4 py-2 outline-none focus:border-indigo-400"/><Button type="submit" disabled={!!busy}><Plus size={17}/>Register domain</Button></form></Panel>
          {!assets.length?<Panel><Empty title="No domains registered" body="Start with a domain you control. Verification does not require a paid scanner or unsafe network probes."/></Panel>:
            assets.map(a=><Panel key={a.id} className="space-y-4 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">{a.domain}</h2><p className="text-xs text-slate-400">{a.verified_at?`Verified: ${date(a.verified_at)}`:'Verification pending'}</p></div><span className={`rounded-full border px-3 py-1 text-xs ${a.verified_at?'border-emerald-500/30 text-emerald-300':'border-amber-500/30 text-amber-300'}`}>{a.verified_at?'Verified':'Not verified'}</span></div>
            {!a.verified_at&&<div className="space-y-2 rounded-xl bg-black/20 p-4 text-sm"><p>Add this DNS TXT record, wait for propagation, then verify:</p><p className="text-slate-400">Host: <code className="break-all text-indigo-300">_mirrortrap-challenge.{a.domain}</code></p><p className="text-slate-400">Value: <code className="break-all text-indigo-300">mirrortrap-verify={a.challenge}</code></p><p className="text-xs text-slate-500">Your DNS provider may require only the relative label as the host.</p></div>}
            <div className="flex flex-wrap gap-2">{!a.verified_at&&<Button variant="muted" onClick={()=>verifyAsset(a)} disabled={!!busy}><SearchCheck size={16}/>Verify DNS</Button>}<Button onClick={()=>scanAsset(a)} disabled={!a.verified_at||!!busy}>{busy===`scan-${a.id}`?<Loader2 className="animate-spin" size={16}/>:<Radar size={16}/>}Scan verified domain</Button></div>
          </Panel>)}
        </>}
        {view==='scans' && <>
          <div><h1 className="text-3xl font-bold">Exposure scans</h1><p className="mt-1 text-sm text-slate-400">Passive public-source results for verified domains. Exposure scores are heuristic, not proof of compromise.</p></div>
          {!scans.length?<Panel><Empty title="No scans recorded" body="Verify a domain in Assets and start a scan. Unavailable providers are reported explicitly, not replaced with sample findings."/></Panel>:<>
            <div className="flex flex-wrap gap-2">{scans.map(s=><button key={s.id} onClick={()=>setSelectedScan(s.id)} className={`rounded-lg border px-3 py-2 text-sm ${displayedScan?.id===s.id?'border-indigo-400/40 bg-indigo-500/20 text-white':'border-white/10 text-slate-400 hover:bg-white/5'}`}>{s.domain} · {date(s.created_at)}</button>)}</div>
            {displayedScan&&<><Panel className="p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-slate-400">Recorded exposure index</p><h2 className="mt-2 text-3xl font-bold">{displayedScan.exposure_index}<span className="ml-1 text-sm text-slate-500">/ 100</span></h2><p className="mt-2 text-sm text-slate-400">{displayedScan.domain} · {date(displayedScan.created_at)}</p></div><Button variant="muted" onClick={()=>saveJson(`mirrortrap-${displayedScan.domain}-${displayedScan.id}.json`,displayedScan)}><Download size={16}/>Export evidence</Button></div><p className="mt-4 text-xs text-slate-400">This index sums selected observed exposure indicators. A score of zero does not establish safety when sources are unavailable.</p></Panel>
              <Panel className="p-5"><h3 className="mb-4 font-semibold">Source availability</h3><div className="grid gap-2 sm:grid-cols-2">{Object.entries(displayedScan.sources).map(([name,status])=><div key={name} className="rounded-lg border border-white/5 bg-black/15 p-3 text-sm"><div className="flex items-center justify-between"><b>{name}</b><span className={status.status==='ok'?'text-emerald-300':'text-amber-300'}>{status.status}</span></div>{status.error&&<p className="mt-1 text-xs text-slate-400">{status.error}</p>}</div>)}</div></Panel>
              <div className="space-y-3">{displayedScan.findings.length===0?<Panel><Empty title="No findings from responding sources" body="Review source failures before concluding that the asset is safe."/></Panel>:displayedScan.findings.map((f,i)=><Panel key={`${displayedScan.id}-${i}`} className="p-5"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-md border px-2 py-0.5 text-xs font-bold ${severityClass(f.severity)}`}>{f.severity}</span><span className="text-xs text-slate-400">{f.source}</span></div><h3 className="mt-2 font-semibold">{f.title}</h3><pre className="mt-3 overflow-auto rounded-lg bg-black/30 p-3 text-xs text-slate-300">{JSON.stringify(f.evidence,null,2)}</pre><p className="mt-3 text-sm text-slate-400">{f.recommendation}</p></Panel>)}</div>
            </>}
          </>}
        </>}
        {view==='tripwires' && <>
          <div><h1 className="text-3xl font-bold">Tripwire URLs</h1><p className="mt-1 text-sm text-slate-400">A canary URL creates a stored event when somebody requests it. It is not a full honeypot or a credential detector.</p></div>
          <Panel className="p-5"><form onSubmit={createTripwire} className="flex flex-col gap-3 sm:flex-row"><input required maxLength={80} value={wireLabel} onChange={e=>setWireLabel(e.target.value)} placeholder="e.g., staging document canary" className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-4 py-2 outline-none focus:border-indigo-400"/><Button type="submit" disabled={!!busy}><Plus size={16}/>Create URL</Button></form>
            <p className="mt-3 text-xs text-slate-500">Only place canary URLs in systems you own or control. Do not lure unauthorized traffic to unrelated services.</p></Panel>
          {newWireUrl&&<Panel className="border-indigo-400/30 p-5"><h2 className="font-semibold text-emerald-300">New canary URL — copy now</h2><p className="mt-1 text-xs text-slate-400">The plaintext token is not stored, so this URL cannot be recovered later.</p><code className="mt-3 block break-all rounded-lg bg-black/25 p-3 text-sm text-indigo-300">{newWireUrl}</code><div className="mt-3 flex gap-2"><Button variant="muted" onClick={()=>void navigator.clipboard.writeText(newWireUrl)}><ClipboardCopy size={16}/>Copy URL</Button><Button variant="muted" onClick={()=>window.open(newWireUrl,'_blank','noopener,noreferrer')}><ExternalLink size={16}/>Test URL</Button></div><p className="mt-3 text-xs text-amber-300">Testing it yourself creates a genuine request event. The HTTP endpoint deliberately returns 404.</p></Panel>}
          {!tripwires.length?<Panel><Empty title="No canary URLs created" body="Create one to generate a high-entropy tracking URL. Visiting it causes a real server-side event."/></Panel>:tripwires.map(t=><Panel key={t.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><h2 className="font-semibold">{t.label}</h2><p className="text-xs text-slate-400">Created {date(t.created_at)} · {events.filter(e=>e.tripwire_id===t.id).length} recorded recent events</p><p className={`mt-1 text-xs ${t.active?'text-emerald-300':'text-slate-500'}`}>{t.active?'Active':'Revoked'}</p></div>{t.active&&<Button variant="danger" disabled={!!busy} onClick={()=>revokeWire(t)}>Revoke token</Button>}</Panel>)}
        </>}
        {view==='events'&&<>
          <div><h1 className="text-3xl font-bold">Recorded security events</h1><p className="mt-1 text-sm text-slate-400">Actual HTTP requests received by canary URLs. Hits can include your own tests, crawlers, and benign automated clients.</p></div>
          {!events.length?<Panel><Empty title="No tripwire requests recorded" body="When a valid canary URL is requested, the Edge Function saves the method, timestamp, reported IP, and user agent."/></Panel>:events.map(e=><Panel key={e.id} className="p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><Bell size={18} className="text-amber-300"/><b>{tripwires.find(t=>t.id===e.tripwire_id)?.label ?? 'Canary URL'}</b></div><span className="text-xs text-slate-400">{date(e.observed_at)}</span></div><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3"><div><dt className="text-xs text-slate-400">Method</dt><dd>{e.method}</dd></div><div><dt className="text-xs text-slate-400">Reported IP</dt><dd className="break-all">{e.reported_ip??'Unavailable'}</dd></div><div><dt className="text-xs text-slate-400">User agent</dt><dd className="break-all">{e.user_agent??'Unavailable'}</dd></div></dl></Panel>)}
        </>}
        {view==='reports'&&<>
          <div><h1 className="text-3xl font-bold">Evidence reports</h1><p className="mt-1 text-sm text-slate-400">Download the actual saved scan output and event log. No predicted breach timelines or fabricated datasets.</p></div>
          <Panel className="flex flex-wrap items-center justify-between gap-4 p-5"><div><h2 className="font-semibold">Workspace evidence export</h2><p className="mt-1 text-xs text-slate-400">{scans.length} scan records · {events.length} recorded canary hits</p></div><Button disabled={!scans.length&&!events.length} onClick={()=>saveJson(`mirrortrap-evidence-${new Date().toISOString().slice(0,10)}.json`,{
            exported_at: new Date().toISOString(), source:'MirrorTrap authenticated workspace',
            limitations:'Passive public information can be stale; canary hits are not proof of an attacker.', assets:assets.map(a=>({domain:a.domain,verified_at:a.verified_at})),scans,events,
          })}><Download size={16}/>Download JSON</Button></Panel>
          <Panel className="p-5"><h2 className="font-semibold">Interpretation guidance</h2><p className="mt-3 text-sm text-slate-400">Shodan and certificate transparency provide third-party observations, not confirmed exploitation. Validate any suspicious exposure manually in an authorized environment. When a source fails, its status is preserved alongside findings.</p></Panel>
        </>}
      </main>
    </div>
    <footer className="mx-auto max-w-7xl border-t border-white/10 px-6 py-5 text-xs text-slate-500">MirrorTrap · Security monitoring for verified assets · Submission development by Anushree N</footer>
  </div>;
}
