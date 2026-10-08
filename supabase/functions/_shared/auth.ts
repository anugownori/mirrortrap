import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};
export function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: cors });
}
export function env() {
  const url = Deno.env.get('SUPABASE_URL');
  const anon = Deno.env.get('SUPABASE_ANON_KEY');
  const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !anon || !secret) throw new Error('Server environment incomplete');
  return { url, anon, secret };
}
export function serviceDb() {
  const { url, secret } = env();
  return createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}
export async function authenticate(request: Request): Promise<string | null> {
  const auth = request.headers.get('Authorization') ?? '';
  if (!/^Bearer \S+$/i.test(auth)) return null;
  const { url, anon } = env();
  const client = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.getUser(auth.replace(/^Bearer /i, ''));
  return error ? null : (data.user?.id ?? null);
}
export function validDomain(v: unknown): v is string {
  if (typeof v !== 'string' || v.length > 253 || v.length < 4) return false;
  return /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(v);
}
export function validUuid(v: unknown): v is string {
  return typeof v === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v);
}
export async function fetchJson(url: string, timeout = 9000): Promise<unknown> {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeout), headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
