export async function fetchThreats(domain?: string): Promise<any> {
  const url = domain 
    ? `http://127.0.0.1:8000/api/threats?domain=${encodeURIComponent(domain)}`
    : 'http://127.0.0.1:8000/api/threats';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch threats: ${res.status}`);
  return res.json();
}

export async function fetchDomain(domain: string): Promise<any> {
  const url = `http://127.0.0.1:8000/api/domain?domain=${encodeURIComponent(domain)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch domain: ${res.status}`);
  return res.json();
}

export async function fetchSubdomains(domain: string): Promise<any> {
    const url = `http://127.0.0.1:8000/api/subdomains?domain=${encodeURIComponent(domain)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch subdomains: ${res.status}`);
    return res.json();
}

export async function fetchLookalikes(domain: string): Promise<any> {
    const url = `http://127.0.0.1:8000/api/lookalikes?domain=${encodeURIComponent(domain)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch lookalikes: ${res.status}`);
    return res.json();
}
