// deno-lint-ignore-file no-explicit-any
// Supabase Edge Function: osint-scan
//
// Deploy with:
//   supabase functions deploy osint-scan
// Set secrets:
//   supabase secrets set HIBP_KEY=xxx
//   supabase secrets set GITHUB_TOKEN=xxx   # optional, raises rate limits
//
// Invoke from frontend:
//   supabase.functions.invoke('osint-scan', {
//     body: { kind: 'domain', domain: 'acme.com' }
//   })
//   supabase.functions.invoke('osint-scan', {
//     body: { kind: 'hibp', email: 'foo@acme.com' }
//   })

// @ts-expect-error — Deno std import resolved at deploy time
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

async function hibp(email: string) {
  // @ts-expect-error — Deno runtime
  const key = Deno.env.get('HIBP_KEY');
  if (!key) return { breaches: [], error: 'HIBP_KEY not configured' };
  const r = await fetch(
    `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
    {
      headers: {
        'hibp-api-key': key,
        'user-agent': 'MirrorTrap/1.0 (+https://mirrortrap.io)',
      },
    },
  );
  if (r.status === 404) return { breaches: [] };
  if (!r.ok) return { breaches: [], error: `hibp status ${r.status}` };
  const breaches = await r.json();
  return { breaches };
}

async function crtSh(domain: string) {
  const r = await fetch(`https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`);
  if (!r.ok) return { subdomains: [] };
  const data = (await r.json()) as any[];
  const set = new Set<string>();
  data.forEach((e) => {
    String(e.name_value ?? '')
      .split('\n')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.endsWith(domain.toLowerCase()) && !s.startsWith('*'))
      .forEach((s) => set.add(s));
  });
  return { subdomains: Array.from(set).sort() };
}

async function dnsLookup(domain: string) {
  const types = ['A', 'MX', 'TXT', 'NS'];
  const entries = await Promise.all(
    types.map(async (t) => {
      const r = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${t}`);
      return [t, r.ok ? await r.json() : null] as const;
    }),
  );
  return Object.fromEntries(entries);
}

async function ipInfo(ip: string) {
  if (!ip) return null;
  const r = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`);
  if (!r.ok) return null;
  return r.json();
}

async function githubSearch(domain: string) {
  // @ts-expect-error — Deno runtime
  const token = Deno.env.get('GITHUB_TOKEN');
  const headers: Record<string, string> = {
    'user-agent': 'MirrorTrap/1.0',
    accept: 'application/vnd.github+json',
  };
  if (token) headers.authorization = `Bearer ${token}`;
  const q = encodeURIComponent(domain.replace(/\.[a-z]+$/i, ''));
  const r = await fetch(
    `https://api.github.com/search/repositories?q=${q}+in:name,description&per_page=5`,
    { headers },
  );
  if (!r.ok) return { total_count: 0, items: [] };
  return r.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  try {
    const body = (await req.json()) as { kind: string; domain?: string; email?: string };
    if (body.kind === 'hibp' && body.email) {
      const out = await hibp(body.email);
      return new Response(JSON.stringify(out), { headers: CORS });
    }
    if (body.kind === 'domain' && body.domain) {
      const dns = await dnsLookup(body.domain);
      const firstIp =
        (((dns as any)?.A?.Answer as any[]) ?? []).find((a) => a.type === 1)?.data ?? '';
      const [crt, gh, ip] = await Promise.all([
        crtSh(body.domain),
        githubSearch(body.domain),
        ipInfo(firstIp),
      ]);
      return new Response(
        JSON.stringify({ dns, crt, github: gh, ip, firstIp }),
        { headers: CORS },
      );
    }
    return new Response(JSON.stringify({ error: 'unknown kind' }), {
      status: 400,
      headers: CORS,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: CORS,
    });
  }
});
