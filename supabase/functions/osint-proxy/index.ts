// deno-lint-ignore-file no-explicit-any
// Supabase Edge Function: osint-proxy
//
// Generic CORS-bypass proxy for a small allow-list of public OSINT endpoints.
// Deploy with:
//   supabase functions deploy osint-proxy
//
// Invoke from frontend:
//   supabase.functions.invoke('osint-proxy', {
//     body: { kind: 'security-headers', url: 'https://securityheaders.com/?q=acme.com&hide=on&followRedirects=on' }
//   })
//   supabase.functions.invoke('osint-proxy', {
//     body: { kind: 'raw', url: 'https://crt.sh/?q=%25.acme.com&output=json' }
//   })

// @ts-expect-error — Deno std import resolved at deploy time
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

const ALLOW_HOSTS = new Set([
  'securityheaders.com',
  'crt.sh',
  'dns.google',
  'ipapi.co',
  'api.github.com',
  'internetdb.shodan.io',
]);

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  try {
    const body = (await req.json()) as { kind?: string; url?: string };
    if (!body.url) {
      return new Response(JSON.stringify({ error: 'missing url' }), {
        status: 400,
        headers: CORS,
      });
    }
    const u = new URL(body.url);
    if (!ALLOW_HOSTS.has(u.hostname)) {
      return new Response(JSON.stringify({ error: `host ${u.hostname} not allowed` }), {
        status: 403,
        headers: CORS,
      });
    }

    // Special-case: securityheaders.com returns the grade in the x-grade header
    // (not the body), which is trivial to proxy.
    if (body.kind === 'security-headers') {
      const r = await fetch(u.toString(), {
        method: 'HEAD',
        headers: { 'user-agent': 'MirrorTrap/1.0 (+https://mirrortrap.io)' },
        redirect: 'follow',
      });
      const grade = r.headers.get('x-grade') ?? null;
      const score = r.headers.get('x-score') ?? null;
      return new Response(JSON.stringify({ grade, score, status: r.status }), {
        headers: CORS,
      });
    }

    // Default raw JSON / text passthrough.
    const r = await fetch(u.toString(), {
      headers: { 'user-agent': 'MirrorTrap/1.0 (+https://mirrortrap.io)' },
    });
    const ct = r.headers.get('content-type') ?? '';
    if (/json/i.test(ct)) {
      const j = await r.json();
      return new Response(JSON.stringify(j), { headers: CORS });
    }
    const text = await r.text();
    return new Response(JSON.stringify({ text, status: r.status }), { headers: CORS });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: CORS,
    });
  }
});
