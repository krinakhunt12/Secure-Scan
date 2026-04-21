from fastapi import FastAPI, HTTPException
from typing import Dict, Any, List
import uvicorn
import os
import socket
import ssl
import contextlib
import hashlib
import json
import time
import re
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Domain Info API")

# Allow requests from common local dev servers. Add ports your frontend uses.
# For development it's convenient to allow localhost on typical Vite ports.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://secure-scan-nine.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/threats")
def get_threats(domain: str = None):
    """Return dynamic threat intelligence alerts based on domain scan results."""
    threats = []
    threat_counter = 1
    
    if not domain:
        # Return generic threats if no domain specified
        return {
            "threats": [
                {
                    "id": f"INC-2026-{str(threat_counter).zfill(4)}",
                    "title": "No domain specified for threat analysis",
                    "severity": "Info",
                    "source": "security-scanner",
                    "description": "Provide a domain parameter to receive dynamic threat intelligence based on actual security findings.",
                    "remediation": "Add ?domain=example.com to the API endpoint to get domain-specific threats."
                }
            ]
        }
    
    # Get domain info to analyze for threats
    try:
        scan_result = domain_info(domain)
    except Exception as e:
        return {
            "threats": [
                {
                    "id": f"INC-2026-{str(threat_counter).zfill(4)}",
                    "title": "Domain scan failed",
                    "severity": "Critical",
                    "source": "security-scanner",
                    "description": f"Unable to scan domain {domain}: {str(e)}",
                    "remediation": "Verify domain is accessible and properly configured."
                }
            ]
        }
    
    # Check SSL/TLS vulnerabilities
    ssl_info = scan_result.get("ssl", {})
    if ssl_info.get("deprecated_tls"):
        threats.append({
            "id": f"INC-2026-{str(threat_counter).zfill(4)}",
            "title": "Deprecated TLS version detected",
            "severity": "Critical",
            "source": "ssl-scanner",
            "description": f"Domain uses deprecated TLS version: {ssl_info.get('tls_version')}. This exposes connections to downgrade attacks and known vulnerabilities.",
            "remediation": "Disable TLS 1.0/1.1 and SSLv2/v3. Configure server to support only TLS 1.2 and TLS 1.3."
        })
        threat_counter += 1
    
    if ssl_info.get("cipher_strength") == "Weak":
        threats.append({
            "id": f"INC-2026-{str(threat_counter).zfill(4)}",
            "title": "Weak cipher suite detected",
            "severity": "High",
            "source": "ssl-scanner",
            "description": f"Server accepts weak cipher with only {ssl_info.get('cipher_bits', 0)} bits. Vulnerable to brute-force attacks.",
            "remediation": "Remove weak ciphers (RC4, DES, 3DES, export ciphers). Use AES-256-GCM or ChaCha20-Poly1305."
        })
        threat_counter += 1
    
    if not ssl_info.get("ocsp_stapling"):
        threats.append({
            "id": f"INC-2026-{str(threat_counter).zfill(4)}",
            "title": "OCSP stapling not enabled",
            "severity": "Low",
            "source": "ssl-scanner",
            "description": "Server does not support OCSP stapling, which can slow down SSL handshakes and reduce privacy.",
            "remediation": "Enable OCSP stapling in your web server configuration to improve performance and privacy."
        })
        threat_counter += 1
    
    # Check security headers
    http_info = scan_result.get("http", {})
    headers = http_info.get("headers", {})
    security_score = http_info.get("security_headers_score", 0)
    
    if security_score < 30:
        severity = "Critical"
    elif security_score < 50:
        severity = "High"
    else:
        severity = "Medium"
    
    missing_headers = []
    if "strict-transport-security" not in headers:
        missing_headers.append("HSTS")
    if "content-security-policy" not in headers:
        missing_headers.append("CSP")
    if "x-frame-options" not in headers:
        missing_headers.append("X-Frame-Options")
    if "x-content-type-options" not in headers:
        missing_headers.append("X-Content-Type-Options")
    
    if missing_headers:
        threats.append({
            "id": f"INC-2026-{str(threat_counter).zfill(4)}",
            "title": f"Missing critical security headers",
            "severity": severity,
            "source": "header-scanner",
            "description": f"Security headers score: {security_score}/60. Missing: {', '.join(missing_headers)}. This exposes the site to XSS, clickjacking, and MIME-type attacks.",
            "remediation": f"Add security headers: {', '.join(missing_headers)}. Configure proper CSP policy and HSTS with includeSubDomains."
        })
        threat_counter += 1
    
    # Check DNSSEC
    dns_info = scan_result.get("dns", {})
    if not dns_info.get("DNSSEC", {}).get("validated"):
        threats.append({
            "id": f"INC-2026-{str(threat_counter).zfill(4)}",
            "title": "DNSSEC not enabled",
            "severity": "Medium",
            "source": "dns-scanner",
            "description": "Domain does not have DNSSEC validation enabled, making it vulnerable to DNS spoofing and cache poisoning attacks.",
            "remediation": "Enable DNSSEC at your domain registrar and configure DS records properly."
        })
        threat_counter += 1
    
    # Check email security
    email_sec = scan_result.get("email_security", {})
    if not email_sec.get("spf"):
        threats.append({
            "id": f"INC-2026-{str(threat_counter).zfill(4)}",
            "title": "SPF record missing",
            "severity": "High",
            "source": "email-scanner",
            "description": "No SPF record found. Allows attackers to spoof emails from your domain, damaging reputation and enabling phishing attacks.",
            "remediation": "Create SPF record in DNS TXT: 'v=spf1 include:_spf.yourmailserver.com ~all'"
        })
        threat_counter += 1
    
    if not email_sec.get("dmarc"):
        threats.append({
            "id": f"INC-2026-{str(threat_counter).zfill(4)}",
            "title": "DMARC policy not configured",
            "severity": "High",
            "source": "email-scanner",
            "description": "No DMARC record found. Without DMARC, you cannot enforce email authentication policies or receive reports about spoofing attempts.",
            "remediation": "Create DMARC record at _dmarc.{domain}: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@{domain}'"
        })
        threat_counter += 1
    
    # Check open ports
    open_ports = scan_result.get("open_ports", [])
    risky_ports = [port for port in open_ports if port.get("port") in [21, 23, 3389, 445]]
    if risky_ports:
        port_list = ', '.join([f"{p.get('port')} ({p.get('service', 'unknown')})" for p in risky_ports])
        threats.append({
            "id": f"INC-2026-{str(threat_counter).zfill(4)}",
            "title": "High-risk ports exposed",
            "severity": "Critical",
            "source": "port-scanner",
            "description": f"Risky ports detected: {port_list}. These services are commonly targeted by attackers and should not be publicly exposed.",
            "remediation": "Close unnecessary ports. Use VPN or IP whitelisting for administrative access. Disable FTP, Telnet, and unencrypted protocols."
        })
        threat_counter += 1
    
    # Check cookie security
    cookies = http_info.get("cookies", [])
    insecure_cookies = [c for c in cookies if not c.get("secure")]
    if insecure_cookies and http_info.get("reachable"):
        threats.append({
            "id": f"INC-2026-{str(threat_counter).zfill(4)}",
            "title": "Insecure cookies detected",
            "severity": "Medium",
            "source": "cookie-scanner",
            "description": f"{len(insecure_cookies)} cookie(s) missing Secure flag. Cookies can be intercepted over unencrypted connections.",
            "remediation": "Set Secure, HttpOnly, and SameSite flags on all cookies. Use SameSite=Strict or Lax to prevent CSRF."
        })
        threat_counter += 1
    
    # Check HTTP/2
    if not http_info.get("http2_support") and http_info.get("reachable"):
        threats.append({
            "id": f"INC-2026-{str(threat_counter).zfill(4)}",
            "title": "HTTP/2 not enabled",
            "severity": "Low",
            "source": "performance-scanner",
            "description": "Server does not support HTTP/2, resulting in slower page loads and reduced security features.",
            "remediation": "Enable HTTP/2 in your web server configuration. Requires TLS 1.2+ for browser support."
        })
        threat_counter += 1
    
    # If no threats found, add a positive message
    if not threats:
        threats.append({
            "id": f"INC-2026-{str(threat_counter).zfill(4)}",
            "title": "No immediate threats detected",
            "severity": "Info",
            "source": "security-scanner",
            "description": f"Domain {domain} passes basic security checks. Continue monitoring and apply defense-in-depth strategies.",
            "remediation": "Maintain regular security scans, keep software updated, and monitor for new vulnerabilities."
        })
    
    return {"threats": threats}


def get_dns_records(domain: str) -> Dict[str, Any]:
    import dns.resolver
    records = {}
    types = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA", "CAA", "SRV"]
    for rtype in types:
        try:
            answers = dns.resolver.resolve(domain, rtype, lifetime=5)
            vals = []
            for a in answers:
                ttl = None
                try:
                    ttl = a.ttl
                except Exception:
                    ttl = None
                vals.append({"value": a.to_text(), "ttl": ttl})
            records[rtype] = vals
        except Exception:
            records[rtype] = []
    
    # Check for DMARC record at _dmarc.domain
    try:
        dmarc_domain = f"_dmarc.{domain}"
        dmarc_answers = dns.resolver.resolve(dmarc_domain, "TXT", lifetime=5)
        records["DMARC"] = [{"value": a.to_text(), "ttl": getattr(a, 'ttl', None)} for a in dmarc_answers]
    except Exception:
        records["DMARC"] = []
    
    # Check DNSSEC validation status
    try:
        import dns.resolver
        res = dns.resolver.Resolver()
        res.use_edns(0, dns.flags.DO, 4096)
        answer = res.resolve(domain, 'A')
        records["DNSSEC"] = {"validated": answer.response.flags & dns.flags.AD != 0}
    except Exception:
        records["DNSSEC"] = {"validated": False}
    
    # DNS propagation check across multiple nameservers
    propagation_check = {}
    public_dns = {
        "Google": "8.8.8.8",
        "Cloudflare": "1.1.1.1",
        "Quad9": "9.9.9.9"
    }
    for name, dns_ip in public_dns.items():
        try:
            import dns.resolver
            resolver = dns.resolver.Resolver()
            resolver.nameservers = [dns_ip]
            resolver.lifetime = 3
            answer = resolver.resolve(domain, 'A')
            propagation_check[name] = [rdata.to_text() for rdata in answer]
        except Exception:
            propagation_check[name] = None
    
    records["PROPAGATION"] = propagation_check
    
    return records


def get_whois(domain: str) -> Dict[str, Any]:
    try:
        import whois
        w = whois.whois(domain)
        def norm_date(d):
            try:
                if isinstance(d, list) and len(d) > 0:
                    d = d[0]
                if hasattr(d, 'isoformat'):
                    return d.isoformat()
                return str(d) if d is not None else None
            except Exception:
                return str(d)

        return {
            "domain_name": w.domain_name[0] if isinstance(w.domain_name, list) else w.domain_name,
            "registrar": w.registrar,
            "creation_date": norm_date(w.creation_date),
            "expiration_date": norm_date(w.expiration_date),
            "emails": w.emails,
            "status": w.status,
            "name": w.name,
            "raw": str(w)
        }
    except Exception as e:
        return {"error": str(e)}


def get_ssl_info(domain: str) -> Dict[str, Any]:
    try:
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                cert_bin = ssock.getpeercert(binary_form=True)
                subject = dict(x[0] for x in cert.get("subject", ()))
                issuer = dict(x[0] for x in cert.get("issuer", ()))
                san = cert.get("subjectAltName", ())
                cipher = ssock.cipher()
                
                # Certificate fingerprint
                fingerprint = hashlib.sha256(cert_bin).hexdigest()
                
                # Get certificate chain info
                chain_length = len(ssock.get_unverified_chain() if hasattr(ssock, 'get_unverified_chain') else [])
                
                # TLS version
                tls_version = ssock.version()
                
                # Cipher strength analysis
                cipher_name = cipher[0] if cipher else ""
                cipher_bits = cipher[2] if cipher and len(cipher) > 2 else 0
                cipher_strength = "Strong" if cipher_bits >= 256 else "Medium" if cipher_bits >= 128 else "Weak"
                
                # Check for deprecated TLS versions
                deprecated_tls = tls_version in ["TLSv1", "TLSv1.1", "SSLv3", "SSLv2"]
                
                # OCSP stapling support check
                ocsp_stapling = hasattr(ssock, 'get_verified_chain')
                
                return {
                    "not_before": cert.get("notBefore"),
                    "not_after": cert.get("notAfter"),
                    "subject": subject,
                    "issuer": issuer,
                    "san": san,
                    "cipher": cipher,
                    "cipher_strength": cipher_strength,
                    "cipher_bits": cipher_bits,
                    "fingerprint": fingerprint,
                    "chain_length": chain_length,
                    "tls_version": tls_version,
                    "deprecated_tls": deprecated_tls,
                    "ocsp_stapling": ocsp_stapling,
                    "serial_number": cert.get("serialNumber")
                }
    except Exception as e:
        return {"error": str(e)}


def get_subdomains(domain: str) -> List[Dict[str, Any]]:
    """Scan for common subdomains to identify hidden assets."""
    common_subs = ["www", "mail", "ftp", "localhost", "webmail", "smtp", "pop", "ns1", "web", "ns2", "blog", "test", "dev", "vpn", "api", "shop", "admin", "app", "m", "portal", "hosting", "support"]
    found_subs = []
    
    for sub in common_subs:
        subdomain = f"{sub}.{domain}"
        try:
            import dns.resolver
            # Check for A records (fastest way to see if it exists)
            answers = dns.resolver.resolve(subdomain, "A", lifetime=1)
            ips = [rdata.to_text() for rdata in answers]
            if ips:
                found_subs.append({
                    "subdomain": subdomain,
                    "ips": ips,
                    "is_likely_dev": sub in ["dev", "test", "staging", "beta", "temp"],
                    "is_likely_admin": sub in ["admin", "portal", "root", "manager"]
                })
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, Exception):
            continue
            
    return found_subs


def get_lookalikes(domain: str) -> List[Dict[str, Any]]:
    """Generate and check potential lookalike domains for phishing detection."""
    base = domain.split('.')[0]
    ext = domain.split('.')[-1] if '.' in domain else 'com'
    
    # Common variations: different TLDs, common phishing prefixes/suffixes
    variations = [
        f"{base}.co", f"{base}.net", f"{base}.org", f"{base}.info", f"{base}.biz",
        f"login-{base}.{ext}", f"secure-{base}.{ext}", f"{base}-portal.{ext}",
        f"{base}-support.{ext}", f"verify-{base}.{ext}"
    ]
    
    # Remove original domain from variations
    variations = [v for v in variations if v != domain]
    
    found_lookalikes = []
    
    for variant in variations:
        try:
            import dns.resolver
            # Check if variation resolves
            answers = dns.resolver.resolve(variant, "A", lifetime=0.8)
            ips = [rdata.to_text() for rdata in answers]
            if ips:
                # If it resolves, it's a potential threat
                found_lookalikes.append({
                    "domain": variant,
                    "ips": ips,
                    "risk_level": "High" if "login-" in variant or "secure-" in variant else "Medium"
                })
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, Exception):
            continue
            
    return found_lookalikes


@app.get("/")
def root():
    return {"message": "API is running 🚀"}
    
@app.get("/api/lookalikes")
def lookalikes(domain: str):
    """Detect potential brand-spoofing domains."""
    if not domain:
        raise HTTPException(status_code=400, detail="query parameter 'domain' required")
    
    domain = domain.strip().replace("https://", "").replace("http://", "").split("/")[0]
    results = get_lookalikes(domain)
    return {"original": domain, "lookalikes": results, "count": len(results)}


@app.get("/api/subdomains")
def subdomains(domain: str):
    """Enumerate subdomains for a given domain."""
    if not domain:
        raise HTTPException(status_code=400, detail="query parameter 'domain' required")
    
    domain = domain.strip().replace("https://", "").replace("http://", "").split("/")[0]
    results = get_subdomains(domain)
    return {"domain": domain, "subdomains": results, "count": len(results)}


@app.get("/api/domain")
def domain_info(domain: str):
    """Fetch domain details: DNS records, WHOIS summary, SSL certificate info."""
    if not domain:
        raise HTTPException(status_code=400, detail="query parameter 'domain' required")

    domain = domain.strip()

    dns_info = get_dns_records(domain)
    whois_info = get_whois(domain)
    ssl_info = get_ssl_info(domain)

    # Resolve IPs from A/AAAA records (records may include ttl)
    ips = []
    for rtype in ("A", "AAAA"):
        for rec in dns_info.get(rtype, []):
            ip = rec.get("value") if isinstance(rec, dict) else rec
            if ip and ip not in ips:
                ips.append(ip)

    # Try HTTP fetch for server headers and status with performance timing
    http = {"reachable": False, "status_code": None, "headers": {}, "error": None, "performance": {}, "redirect_chain": [], "security_headers_score": 0}
    import requests
    try:
        url = f"https://{domain}" if not domain.startswith("http") else domain
        # Perform a verified HTTPS request (do not skip certificate validation).
        start_time = time.time()
        r = requests.get(url, timeout=6, allow_redirects=True)
        response_time = (time.time() - start_time) * 1000  # ms
        
        http["reachable"] = True
        http["status_code"] = r.status_code
        # normalize headers to lowercase for easier frontend lookups
        http["headers"] = {k.lower(): v for k, v in r.headers.items()}
        http["performance"] = {
            "response_time_ms": round(response_time, 2),
            "content_length": len(r.content),
            "transfer_encoding": r.headers.get('transfer-encoding', 'identity')
        }
        
        # Track redirect chain
        if r.history:
            http["redirect_chain"] = [{"url": resp.url, "status": resp.status_code} for resp in r.history]
        
        # Security headers scoring
        security_headers = ['strict-transport-security', 'content-security-policy', 'x-frame-options', 
                          'x-content-type-options', 'referrer-policy', 'permissions-policy']
        score = sum(10 for h in security_headers if h in http["headers"])
        http["security_headers_score"] = score
        
        # Cookie security analysis
        cookies_analysis = []
        for cookie in r.cookies:
            cookies_analysis.append({
                "name": cookie.name,
                "secure": cookie.secure,
                "httponly": cookie.has_nonstandard_attr('HttpOnly'),
                "samesite": cookie.get_nonstandard_attr('SameSite', 'None')
            })
        http["cookies"] = cookies_analysis
        
        # CORS policy detection
        cors_headers = {
            "access-control-allow-origin": http["headers"].get("access-control-allow-origin"),
            "access-control-allow-credentials": http["headers"].get("access-control-allow-credentials"),
            "access-control-allow-methods": http["headers"].get("access-control-allow-methods")
        }
        http["cors"] = {k: v for k, v in cors_headers.items() if v}
        
        # HTTP/2 support detection
        http["http2_support"] = r.raw.version == 20 if hasattr(r.raw, 'version') else False
        
        # WAF/CDN detection
        waf_cdn = []
        waf_signatures = {
            "cloudflare": ["cf-ray", "__cfduid"],
            "akamai": ["akamai"],
            "aws-cloudfront": ["x-amz-cf-id"],
            "fastly": ["fastly"],
            "incapsula": ["x-iinfo", "incap_ses"],
            "sucuri": ["x-sucuri-id"],
            "wordfence": ["wordfence"]
        }
        for waf, signatures in waf_signatures.items():
            for sig in signatures:
                if any(sig in h.lower() for h in http["headers"].keys()) or any(sig in v.lower() for v in http["headers"].values()):
                    waf_cdn.append(waf)
                    break
        http["waf_cdn"] = list(set(waf_cdn))
        
    except requests.exceptions.SSLError as e:
        http["error"] = f"SSL verification failed: {e}"
    except Exception as e:
        http["error"] = str(e)

    # Reverse DNS lookup for discovered IPs
    reverse = {}
    for ip in ips:
        try:
            name, _, _ = socket.gethostbyaddr(ip)
            reverse[ip] = name
        except Exception:
            reverse[ip] = None

    # ASN and geo lookups for IPs
    asn_info = {}
    geo_info = {}
    for ip in ips:
        try:
            from ipwhois import IPWhois
            obj = IPWhois(ip)
            res = obj.lookup_rdap(depth=1)
            asn = res.get('asn')
            asn_org = res.get('asn_description') or (res.get('network') or {}).get('name')
            asn_info[ip] = {"asn": asn, "asn_org": asn_org}
        except Exception:
            asn_info[ip] = {"asn": None, "asn_org": None}
        # geo via ipapi.co (best-effort public API)
        try:
            rr = requests.get(f'https://ipapi.co/{ip}/json/', timeout=3)
            if rr.ok:
                j = rr.json()
                geo_info[ip] = {"country": j.get('country_name'), "region": j.get('region'), "city": j.get('city'), "latitude": j.get('latitude'), "longitude": j.get('longitude')}
            else:
                geo_info[ip] = {}
        except Exception:
            geo_info[ip] = {}

    # Enhanced port scan with service detection
    common_ports = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 3306, 3389, 5432, 6379, 8080, 8443]
    open_ports: List[Dict[str, Any]] = []
    service_map = {21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP', 53: 'DNS', 80: 'HTTP', 
                   110: 'POP3', 143: 'IMAP', 443: 'HTTPS', 445: 'SMB', 3306: 'MySQL', 
                   3389: 'RDP', 5432: 'PostgreSQL', 6379: 'Redis', 8080: 'HTTP-Alt', 8443: 'HTTPS-Alt'}
    for port in common_ports:
        try:
            for target in (ips or [domain]):
                with socket.create_connection((target, port), timeout=1) as s:
                    # Try basic banner grab
                    banner = None
                    try:
                        s.settimeout(0.5)
                        banner = s.recv(128).decode('utf-8', errors='ignore').strip()[:50]
                    except:
                        pass
                    open_ports.append({
                        "port": port, 
                        "service": service_map.get(port, 'unknown'),
                        "banner": banner
                    })
                    break
        except Exception:
            continue

    # Try to fetch robots.txt, homepage metadata, and favicon (best-effort)
    robots = None
    homepage = None
    favicon = None
    try:
        robots_url = f"https://{domain}/robots.txt"
        rrobots = requests.get(robots_url, timeout=4)
        if rrobots.ok:
            robots = {"status": rrobots.status_code, "size": len(rrobots.text), "sample": rrobots.text[:1000]}
    except Exception:
        robots = None

    try:
        home_url = f"https://{domain}"
        rh = requests.get(home_url, timeout=6)
        if rh.ok:
            homepage = {"status": rh.status_code, "title": None, "generator": None, "meta_tags": {}, "has_sri": False}
            try:
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(rh.text, 'html.parser')
                t = soup.title.string if soup.title else None
                gen = None
                meta = soup.find('meta', attrs={'name': 'generator'})
                if meta and meta.get('content'):
                    gen = meta.get('content')
                if not gen:
                    if 'wp-' in rh.text or 'wordpress' in rh.text.lower():
                        gen = 'WordPress'
                homepage['title'] = t
                homepage['generator'] = gen
                
                # Extract meta tags (description, keywords, Open Graph, Twitter Card)
                meta_tags = {}
                desc = soup.find('meta', attrs={'name': 'description'})
                if desc and desc.get('content'):
                    meta_tags['description'] = desc.get('content')[:200]
                
                keywords = soup.find('meta', attrs={'name': 'keywords'})
                if keywords and keywords.get('content'):
                    meta_tags['keywords'] = keywords.get('content')[:100]
                
                # Open Graph
                og_title = soup.find('meta', property='og:title')
                if og_title:
                    meta_tags['og_title'] = og_title.get('content', '')[:100]
                
                og_image = soup.find('meta', property='og:image')
                if og_image:
                    meta_tags['og_image'] = og_image.get('content', '')[:200]
                
                # Twitter Card
                twitter_card = soup.find('meta', attrs={'name': 'twitter:card'})
                if twitter_card:
                    meta_tags['twitter_card'] = twitter_card.get('content', '')
                
                homepage['meta_tags'] = meta_tags
                
                # Check for Subresource Integrity (SRI)
                sri_tags = soup.find_all(['script', 'link'], integrity=True)
                homepage['has_sri'] = len(sri_tags) > 0
                homepage['sri_count'] = len(sri_tags)
                
            except Exception:
                pass
    except Exception:
        homepage = None

    try:
        fav_url = f"https://{domain}/favicon.ico"
        rf = requests.get(fav_url, timeout=4)
        if rf.ok:
            h = hashlib.sha256(rf.content).hexdigest()
            favicon = {"status": rf.status_code, "sha256": h, "size": len(rf.content)}
    except Exception:
        favicon = None
    
    # Check for security.txt and other well-known files
    security_txt = None
    try:
        sec_url = f"https://{domain}/.well-known/security.txt"
        rsec = requests.get(sec_url, timeout=4)
        if rsec.ok:
            security_txt = {"status": rsec.status_code, "content": rsec.text[:500]}
    except Exception:
        security_txt = None
    
    # Check for sitemap.xml
    sitemap = None
    try:
        sitemap_url = f"https://{domain}/sitemap.xml"
        rsitemap = requests.get(sitemap_url, timeout=4)
        if rsitemap.ok:
            sitemap = {"status": rsitemap.status_code, "size": len(rsitemap.text)}
    except Exception:
        sitemap = None
    
    # Check for ads.txt (advertising policy)
    ads_txt = None
    try:
        ads_url = f"https://{domain}/ads.txt"
        rads = requests.get(ads_url, timeout=4)
        if rads.ok:
            ads_txt = {"status": rads.status_code, "size": len(rads.text)}
    except Exception:
        ads_txt = None
    
    # Check for humans.txt
    humans_txt = None
    try:
        humans_url = f"https://{domain}/humans.txt"
        rhumans = requests.get(humans_url, timeout=4)
        if rhumans.ok:
            humans_txt = {"status": rhumans.status_code, "present": True}
    except Exception:
        humans_txt = None
    
    # Check for .well-known/change-password (password change URL)
    change_password = None
    try:
        pw_url = f"https://{domain}/.well-known/change-password"
        rpw = requests.get(pw_url, timeout=4, allow_redirects=False)
        if rpw.status_code in [200, 301, 302, 303, 307, 308]:
            change_password = {"status": rpw.status_code, "present": True}
    except Exception:
        change_password = None
    
    # Email security analysis (SPF/DMARC validation)
    email_security = {"spf": None, "dmarc": None}
    # Parse SPF from TXT records
    for txt_rec in dns_info.get("TXT", []):
        val = txt_rec.get("value", "")
        if "v=spf1" in val:
            email_security["spf"] = {"record": val, "present": True}
            break
    
    # Parse DMARC
    if dns_info.get("DMARC"):
        dmarc_val = dns_info["DMARC"][0].get("value", "")
        email_security["dmarc"] = {"record": dmarc_val, "present": True}
    
    # Technology fingerprinting
    technologies = []
    if http["headers"]:
        server = http["headers"].get("server", "")
        if server:
            technologies.append({"category": "Web Server", "name": server})
        x_powered = http["headers"].get("x-powered-by", "")
        if x_powered:
            technologies.append({"category": "Backend", "name": x_powered})
    if homepage and homepage.get("generator"):
        technologies.append({"category": "CMS", "name": homepage["generator"]})

    return {
        "domain": domain,
        "dns": dns_info,
        "whois": whois_info,
        "ssl": ssl_info,
        "ips": ips,
        "reverse_dns": reverse,
        "asn": asn_info,
        "geo": geo_info,
        "http": http,
        "robots": robots,
        "homepage": homepage,
        "favicon": favicon,
        "security_txt": security_txt,
        "sitemap": sitemap,
        "ads_txt": ads_txt,
        "humans_txt": humans_txt,
        "change_password": change_password,
        "email_security": email_security,
        "technologies": technologies,
        "open_ports": open_ports
    }


if __name__ == "__main__":
    # Render sets the PORT environment variable automatically
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Application starting on port {port}...")
    uvicorn.run("main:app", host="0.0.0.0", port=port, log_level="info")
