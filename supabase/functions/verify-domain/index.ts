import { authenticate, cors, fetchJson, json, serviceDb, validDomain, validUuid } from '../_shared/auth.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (request.method !== 'POST') return json({ error: 'POST required' }, 405);
  try {
    const uid = await authenticate(request);
    if (!uid) return json({ error: 'Sign in required' }, 401);
    const payload = await request.json() as { asset_id?: unknown };
    if (!validUuid(payload.asset_id)) return json({ error: 'Invalid asset ID' }, 400);
    const db = serviceDb();
    const { data: asset, error } = await db.from('mt_assets')
      .select('id,domain,challenge,user_id,verified_at').eq('id', payload.asset_id)
      .eq('user_id', uid).single();
    if (error || !asset || !validDomain(asset.domain)) return json({ error: 'Asset not found' }, 404);
    const host = `_mirrortrap-challenge.${asset.domain}`;
    const reply = await fetchJson(`https://dns.google/resolve?name=${encodeURIComponent(host)}&type=TXT`);
    const records = (reply as { Answer?: Array<{ type?: number; data?: string }> }).Answer ?? [];
    const expected = `mirrortrap-verify=${asset.challenge}`;
    const verified = records.some(r => r.type === 16 &&
      typeof r.data === 'string' && r.data.replace(/"\s*"/g, '').replace(/"/g, '') === expected);
    if (!verified) return json({ verified: false, error: 'Verification TXT record not found yet', expected, host }, 422);
    const { error: updateError } = await db.from('mt_assets')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', asset.id).eq('user_id', uid);
    if (updateError) return json({ error: 'Could not save verification' }, 500);
    return json({ verified: true, domain: asset.domain });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Verification unavailable' }, 503);
  }
});
