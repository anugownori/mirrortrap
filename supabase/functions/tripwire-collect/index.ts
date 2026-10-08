import { serviceDb } from '../_shared/auth.ts';

function notFound(): Response {
  return new Response('Not Found', { status: 404, headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain' } });
}
function toHex(bytes: Uint8Array): string {
  return [...bytes].map(x => x.toString(16).padStart(2, '0')).join('');
}
Deno.serve(async (request) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') return notFound();
  try {
    const token = new URL(request.url).pathname.split('/').filter(Boolean).at(-1) ?? '';
    if (!/^[a-f0-9]{64}$/.test(token)) return notFound();
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
    const hash = toHex(new Uint8Array(digest));
    const db = serviceDb();
    const { data: wire, error } = await db.from('mt_tripwires')
      .select('id,user_id,active').eq('token_hash', hash).maybeSingle();
    if (error || !wire || !wire.active) return notFound();
    const after = new Date(Date.now() - 3600000).toISOString();
    const { count } = await db.from('mt_events').select('*', { count: 'exact', head: true })
      .eq('tripwire_id', wire.id).gte('observed_at', after);
    // Avoid unbounded event ingestion from accidental loops or public crawlers.
    if ((count ?? 0) >= 50) return notFound();
    const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
    const ip = request.headers.get('cf-connecting-ip') ?? forwarded;
    await db.from('mt_events').insert({
      user_id: wire.user_id, tripwire_id: wire.id,
      method: request.method,
      reported_ip: ip?.slice(0, 80) ?? null,
      user_agent: request.headers.get('user-agent')?.slice(0, 300) ?? null,
      request_path: '/tripwire-collect/[redacted]',
    });
    // Response intentionally identical for live, revoked, and unknown tokens.
    return notFound();
  } catch { return notFound(); }
});
