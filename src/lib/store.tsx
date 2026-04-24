import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Alert, Decoy, ScanResult, ThreatEvent } from './types';
import {
  DEMO_ALERTS,
  DEMO_SCAN,
  SEED_DECOYS,
  generateAlert,
  generateScanHistory,
  generateThreatEvent,
  seedThreatEvents,
} from './mockData';
import { supabase, supabaseEnabled } from './supabase';
import { AppContext, type AppCtx, type Toast } from './appContext';

const STORAGE_KEY = 'mirrortrap_state_v1';

interface Persisted {
  user: AppCtx['user'];
  scans: ScanResult[];
  decoys: Decoy[];
  alerts: Alert[];
  demoMode: boolean;
}

function loadPersisted(): Partial<Persisted> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<Persisted>;
  } catch {
    return {};
  }
}

function savePersisted(p: Persisted) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppCtx['user']>(() => loadPersisted().user ?? null);
  const [demoMode, setDemoModeState] = useState<boolean>(() => loadPersisted().demoMode ?? false);
  const [scans, setScans] = useState<ScanResult[]>(() => loadPersisted().scans ?? []);
  const [decoys, setDecoys] = useState<Decoy[]>(() => loadPersisted().decoys ?? SEED_DECOYS);
  const [alerts, setAlerts] = useState<Alert[]>(() => loadPersisted().alerts ?? []);
  const [plan, setPlanState] = useState<'free' | 'pro' | 'enterprise'>('free');
  const [shieldActive, setShieldActive] = useState(false);
  const [threatEvents, setThreatEvents] = useState<ThreatEvent[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Persist
  useEffect(() => {
    savePersisted({ user, scans, decoys, alerts, demoMode });
  }, [user, scans, decoys, alerts, demoMode]);

  // Supabase session rehydration
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const sess = data.session;
      if (sess?.user) {
        setUser({ email: sess.user.email ?? 'unknown@user', id: sess.user.id });
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser({ email: session.user.email ?? 'unknown@user', id: session.user.id });
      else setUser(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Demo-mode data seeding is applied from setDemoMode below (event-driven, not effect-driven)

  // Auto-incoming alert every 45s if PhantomShield is active (demo pacing)
  useEffect(() => {
    const someActive = decoys.some((d) => d.active);
    if (!someActive) return;
    const int = setInterval(() => {
      if (document.hidden) return;
      const a = generateAlert();
      setAlerts((prev) => [a, ...prev].slice(0, 50));
    }, 45000);
    return () => clearInterval(int);
  }, [decoys]);

  const pushToast = useCallback((t: Omit<Toast, 'id'>) => {
    const toast: Toast = { id: Math.random().toString(36).slice(2), ...t };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== toast.id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const setDemoMode = useCallback(
    (v: boolean) => {
      setDemoModeState(v);
      if (v) {
        setScans((prev) => {
          const hist = generateScanHistory();
          const merged = [...hist, DEMO_SCAN];
          const seen = new Set(prev.map((s) => s.id));
          return [...prev, ...merged.filter((s) => !seen.has(s.id))];
        });
        setDecoys((prev) => prev.map((d) => ({ ...d, active: true })));
        setAlerts((prev) => {
          const seen = new Set(prev.map((a) => a.id));
          return [...DEMO_ALERTS.filter((a) => !seen.has(a.id)), ...prev];
        });
        // Enterprise unlock + autonomous shield online for the /protect demo
        setPlanState('enterprise');
        setShieldActive(true);
        setThreatEvents((prev) => (prev.length ? prev : seedThreatEvents()));
      }
      pushToast({
        title: v ? 'Demo Mode activated' : 'Demo Mode disabled',
        body: v ? 'Loaded targetcompany.com dataset.' : 'Back to live state.',
        tone: v ? 'amber' : 'info',
      });
    },
    [pushToast],
  );

  // Autonomous-shield threat feed — new event every 15s when shield is ON
  useEffect(() => {
    if (!shieldActive) return;
    const int = setInterval(() => {
      if (document.hidden) return;
      setThreatEvents((prev) => [generateThreatEvent(0), ...prev].slice(0, 20));
    }, 15000);
    return () => clearInterval(int);
  }, [shieldActive]);

  const setPlan = useCallback(
    (p: 'free' | 'pro' | 'enterprise') => {
      setPlanState(p);
      pushToast({
        title: `Plan changed → ${p.toUpperCase()}`,
        tone: p === 'enterprise' ? 'success' : 'info',
      });
    },
    [pushToast],
  );

  const setShieldActiveWrapped = useCallback(
    (v: boolean) => {
      setShieldActive(v);
      if (v && threatEvents.length === 0) setThreatEvents(seedThreatEvents());
      pushToast({
        title: v ? 'MirrorTrap Shield activated' : 'Shield offline',
        body: v
          ? 'Autonomous defense is now running.'
          : 'Your assets are unmonitored.',
        tone: v ? 'success' : 'danger',
      });
    },
    [pushToast, threatEvents.length],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (supabaseEnabled && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) setUser({ email: data.user.email ?? email, id: data.user.id });
      } else {
        await new Promise((r) => setTimeout(r, 350));
        setUser({ email, id: `local_${Math.random().toString(36).slice(2, 8)}` });
      }
      pushToast({ title: 'Welcome back', body: email, tone: 'success' });
    },
    [pushToast],
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (supabaseEnabled && supabase) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) setUser({ email: data.user.email ?? email, id: data.user.id });
      } else {
        await new Promise((r) => setTimeout(r, 350));
        setUser({ email, id: `local_${Math.random().toString(36).slice(2, 8)}` });
      }
      pushToast({ title: 'Account created', body: email, tone: 'success' });
    },
    [pushToast],
  );

  const signOut = useCallback(async () => {
    if (supabaseEnabled && supabase) await supabase.auth.signOut();
    setUser(null);
  }, []);

  const addScan = useCallback(
    (s: ScanResult) => {
      setScans((prev) => [...prev, s]);
      if (supabase && user) {
        void supabase.from('scans').insert({
          id: s.id,
          user_id: user.id,
          domain: s.domain,
          ars_score: s.ars_score,
          findings_json: s.findings,
          created_at: s.timestamp,
        });
      }
      pushToast({
        title: 'Scan complete',
        body: `${s.domain} — ARS ${s.ars_score}`,
        tone: s.ars_score >= 70 ? 'danger' : s.ars_score >= 40 ? 'amber' : 'success',
      });
    },
    [user, pushToast],
  );

  const toggleDecoy = useCallback(
    (id: Decoy['id']) => {
      setDecoys((prev) => prev.map((d) => (d.id === id ? { ...d, active: !d.active } : d)));
      pushToast({ title: 'Decoy state updated', tone: 'info' });
    },
    [pushToast],
  );

  const deployAll = useCallback(() => {
    // Sequentially flip each decoy ON with a 0.5s delay — dramatic cascade.
    setDecoys((prev) => {
      prev.forEach((d, i) => {
        if (d.active) return;
        setTimeout(() => {
          setDecoys((cur) => cur.map((x) => (x.id === d.id ? { ...x, active: true } : x)));
        }, i * 500);
      });
      return prev;
    });
    pushToast({
      title: 'PhantomShield deploying…',
      body: '4 decoys coming online. Attackers touching them will trip the wire.',
      tone: 'success',
    });
  }, [pushToast]);

  const addAlert = useCallback(
    (a: Alert) => {
      setAlerts((prev) => [a, ...prev].slice(0, 50));
      if (supabase && user) {
        void supabase.from('alerts').insert({
          id: a.id,
          user_id: user.id,
          severity: a.severity,
          ip: a.ip,
          asset_used: a.asset_used,
          created_at: a.timestamp,
          payload_json: a,
        });
      }
      pushToast({
        title: 'TRIPWIRE FIRED',
        body: `${a.asset_used} — ${a.ip}`,
        tone: 'danger',
      });
    },
    [user, pushToast],
  );

  const simulateAttack = useCallback(() => {
    addAlert(generateAlert());
  }, [addAlert]);

  const updateAlertStatus = useCallback((id: string, status: Alert['status']) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }, []);

  const latestScan = useMemo(() => (scans.length ? scans[scans.length - 1] : null), [scans]);

  const value: AppCtx = {
    user,
    signIn,
    signUp,
    signOut,
    demoMode,
    setDemoMode,
    isPro: plan === 'pro' || plan === 'enterprise',
    isEnterprise: plan === 'enterprise',
    setPlan,
    shieldActive,
    setShieldActive: setShieldActiveWrapped,
    threatEvents,
    scans,
    latestScan,
    addScan,
    decoys,
    toggleDecoy,
    deployAll,
    alerts,
    addAlert,
    simulateAttack,
    updateAlertStatus,
    toasts,
    pushToast,
    dismissToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
