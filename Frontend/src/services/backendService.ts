const BASE_URL = 'https://secure-scan-qv9z.onrender.com';

export async function fetchThreats(domain?: string): Promise<any> {
  const url = domain
    ? `${BASE_URL}/api/threats?domain=${encodeURIComponent(domain)}`
    : `${BASE_URL}/api/threats`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch threats: ${res.status}`);
  return res.json();
}

export async function fetchDomain(domain: string): Promise<any> {
  const url = `${BASE_URL}/api/domain?domain=${encodeURIComponent(domain)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch domain: ${res.status}`);
  return res.json();
}

export async function fetchSubdomains(domain: string): Promise<any> {
  const url = `${BASE_URL}/api/subdomains?domain=${encodeURIComponent(domain)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch subdomains: ${res.status}`);
  return res.json();
}

export async function fetchLookalikes(domain: string): Promise<any> {
  const url = `${BASE_URL}/api/lookalikes?domain=${encodeURIComponent(domain)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch lookalikes: ${res.status}`);
  return res.json();
}
