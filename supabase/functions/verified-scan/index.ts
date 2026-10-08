import { authenticate, cors, fetchJson, json, serviceDb, validDomain, validUuid } from '../_shared/auth.ts';

type Severity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH';
type Finding = { severity: Severity; source: string; title: string; evidence: Record<string, unknown>; recommendation: string };
type SourceStatus = { status: 'ok' | 'error' | 'skipped'; error?: string; collected_at?: string };

const riskyPorts = new Set([21, 23, 445, 1433, 3306, 3389, 5432, 6379, 9200, 11211, 27017]);
function records(raw: unknown): Array<{ type: number; data: string }> {
  const a = (raw as { Answer?: unknown } | null)?.Answer;
  if (!Array.isArray(a)) return [];
  return a.filter((x): x is { type: number; data: string } => typeof x?.type === 'number' && typeof x?.data === 'string');
}
function publicIp(ip: string): boolean {
  // Only IPv4 A records; Shodan is a third-party index, not an active port scanner.
  const n = ip.split('.').map(Number);
  if (n.length !== 4 || n.some(v => !Number.isInteger(v) || v < 0 || v > 255)) return false;
  const [a,b] = n;
  return !(a === 0 || a === 10 || a === 127 || a >= 224 || a === 169 && b === 254 ||
    a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168 || a === 100 && b >= 64 && b <= 127);
}
Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (request.method !== 'POST') return json({ error: 'POST required' }, 405);
  try {
    const uid = await authenticate(request);
    if (!uid) return json({ error: 'Sign in required' }, 401);
    const body = await request.json() as { asset_id?: unknown };
    if (!validUuid(body.asset_id)) return json({ error: 'Invalid asset ID' }, 400);
    const db = serviceDb();
    const { data: asset } = await db.from('mt_assets').select('id,domain,verified_at')
      .eq('id', body.asset_id).eq('user_id', uid).single();
    if (!asset || !asset.verified_at || !validDomain(asset.domain)) return json({ error: 'Verified owned asset required' }, 403);
    const { data: recent } = await db.from('mt_scans').select('id').eq('user_id', uid)
      .eq('asset_id', asset.id).gte('created_at', new Date(Date.now() - 60000).toISOString()).limit(1);
    if ((recent ?? []).length) return json({ error: 'Wait one minute between scans of the same asset' }, 429);

    const domain = asset.domain as string;
    const findings: Finding[] = [];
    const sources: Record<string, SourceStatus> = {};
    const add = (f: Finding) => findings.push(f);
    const fetchSource = async (name: string, url: string): Promise<unknown | null> => {
      try {
        const data = await fetchJson(url, 9000);
        sources[name] = { status: 'ok', collected_at: new Date().toISOString() };
        return data;
      } catch (error) {
        sources[name] = { status: 'error', error: error instanceof Error ? error.message : 'Source unavailable' };
        return null;
      }
    };
    const [dnsA,dnsMx,dnsTxt,dnsNs] = await Promise.all([
      fetchSource('DNS A', `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`),
      fetchSource('DNS MX', `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`),
      fetchSource('DNS TXT', `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=TXT`),
      fetchSource('DNS NS', `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=NS`),
    ]);
    const ips = [...new Set(records(dnsA).filter(r => r.type === 1).map(r => r.data))].slice(0, 25);
    const mx = records(dnsMx).filter(r => r.type === 15).map(r => r.data).slice(0, 20);
    const ns = records(dnsNs).filter(r => r.type === 2).map(r => r.data).slice(0, 20);
    if (ips.length) add({ severity: 'INFO', source: 'DNS', title: 'Public IPv4 DNS records',
      evidence: { addresses: ips }, recommendation: 'Maintain an inventory of known endpoints.' });
    if (mx.length) add({ severity: 'INFO', source: 'DNS', title: 'Mail exchange records',
      evidence: { records: mx }, recommendation: 'Verify all mail providers are intended.' });
    if (ns.length) add({ severity: 'INFO', source: 'DNS', title: 'Nameserver records',
      evidence: { records: ns }, recommendation: 'Keep registrar and DNS access protected.' });
    if (dnsTxt) {
      const txt = records(dnsTxt).filter(r => r.type === 16).map(r => r.data);
      if (!txt.some(x => x.includes('v=spf1'))) add({ severity: 'MEDIUM', source: 'DNS',
        title: 'SPF policy not visible in DNS response', evidence: { checked: domain },
        recommendation: 'Review email authentication policy; confirm with your DNS operator.' });
    }
    const ct = await fetchSource('crt.sh', `https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`);
    if (Array.isArray(ct)) {
      const names = new Set<string>();
      for (const record of ct.slice(0, 5000)) {
        const v = (record as { name_value?: unknown }).name_value;
        if (typeof v !== 'string') continue;
        for (const raw of v.split('\n')) {
          const host = raw.trim().toLowerCase().replace(/\.$/, '');
          if (host === domain || host.endsWith(`.${domain}`)) names.add(host);
        }
      }
      const subdomains = [...names].sort().slice(0, 100);
      if (subdomains.length) add({ severity: 'INFO', source: 'crt.sh',
        title: 'Names observed in certificate-transparency records',
        evidence: { count_preview: subdomains.length, subdomains },
        recommendation: 'Review inventory for retired or unowned hostnames; appearance alone does not prove a vulnerability.' });
    }
    const indexedIp = ips.find(publicIp);
    if (indexedIp) {
      const indexed = await fetchSource('Shodan InternetDB', `https://internetdb.shodan.io/${indexedIp}`);
      if (indexed && typeof indexed === 'object') {
        const data = indexed as { ports?: unknown; vulns?: unknown };
        const ports = Array.isArray(data.ports) ? data.ports.filter((p): p is number => Number.isInteger(p)) : [];
        const highRisk = ports.filter(p => riskyPorts.has(p));
        if (ports.length) add({ severity: highRisk.length ? 'MEDIUM' : 'INFO', source: 'Shodan InternetDB',
          title: 'Third-party index lists open ports',
          evidence: { ip: indexedIp, ports: ports.slice(0, 100), review_ports: highRisk },
          recommendation: 'Verify indexed exposure on owned infrastructure and restrict unnecessary services. Indexed data may be stale.' });
        const cves = Array.isArray(data.vulns) ? data.vulns.filter((x): x is string => typeof x === 'string').slice(0, 100) : [];
        if (cves.length) add({ severity: 'HIGH', source: 'Shodan InternetDB',
          title: 'Third-party index associates possible CVEs with an IP',
          evidence: { ip: indexedIp, indicators: cves },
          recommendation: 'Confirm software versions and applicability before treating these indicators as vulnerabilities.' });
      }
    } else sources['Shodan InternetDB'] = { status: 'skipped', error: 'No suitable public IPv4 A record' };
    const weights: Record<Severity, number> = { INFO: 0, LOW: 5, MEDIUM: 15, HIGH: 30 };
    const exposureIndex = Math.min(100, findings.reduce((total,f) => total + weights[f.severity], 0));
    const row = { user_id: uid, asset_id: asset.id, domain, exposure_index: exposureIndex, findings, sources };
    const { data: saved, error: saveError } = await db.from('mt_scans').insert(row).select().single();
    if (saveError || !saved) return json({ error: 'Could not persist findings', detail: saveError?.message }, 500);
    return json({ scan: saved });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Scan unavailable' }, 503);
  }
});
