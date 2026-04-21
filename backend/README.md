# Domain Info FastAPI Backend

This FastAPI backend provides comprehensive domain intelligence gathering and security analysis.

## Installation & Running

```bash
python -m pip install -r requirements.txt
uvicorn "main:app" --reload --host 127.0.0.1 --port 8000
```

## API Endpoints

### GET `/api/domain?domain=example.com`

Returns comprehensive domain analysis including:

#### DNS Intelligence
- **Standard Records**: A, AAAA, MX, NS, TXT, CNAME, SOA, CAA (with TTL values)
- **DMARC**: Email authentication policy lookup at `_dmarc.domain`
- **DNSSEC**: Validation status check (DNSSEC-secured or not)

#### SSL/TLS Analysis
- Certificate details (subject, issuer, SAN, validity dates)
- Certificate fingerprint (SHA-256)
- Certificate chain length
- TLS version and cipher suite
- Serial number

#### Network & Infrastructure
- **IPs**: Resolved IPv4/IPv6 addresses
- **Reverse DNS**: PTR records for discovered IPs
- **ASN**: Autonomous System Number and organization (via RDAP)
- **Geolocation**: Country, region, city, coordinates (via ipapi.co)
- **Open Ports**: Enhanced port scan with service detection and banner grabbing (FTP, SSH, HTTP, HTTPS, MySQL, Redis, PostgreSQL, etc.)

#### HTTP/HTTPS Analysis
- **Performance Metrics**: Response time (ms), content length, transfer encoding
- **Redirect Chain**: Full HTTP redirect trail with status codes
- **Security Headers Score**: Automated scoring based on presence of HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **Headers**: Complete HTTP response headers (normalized to lowercase)

#### Web Application Discovery
- **Homepage**: Page title, CMS/generator detection (WordPress, etc.)
- **Robots.txt**: Status, size, and sample content
- **Favicon**: SHA-256 hash and file size
- **Security.txt**: RFC 9116 security policy discovery at `/.well-known/security.txt`

#### Email Security
- **SPF**: Sender Policy Framework record detection and validation
- **DMARC**: Email authentication policy presence and record content

#### Technology Fingerprinting
- Web server identification (nginx, Apache, LiteSpeed, etc.)
- Backend technology detection (PHP, Node.js, etc. via `X-Powered-By`)
- CMS detection (WordPress, Joomla, etc.)

#### WHOIS Data
- Domain registrar, creation/expiration dates, status, contacts

### GET `/api/threats`

Returns sample threat intelligence alerts (for demo purposes).

## Features

✅ **Comprehensive DNS Analysis**
- Standard records: A, AAAA, MX, NS, TXT, CNAME, SOA, CAA, SRV (with TTL)
- DMARC email authentication policy
- DNSSEC validation status
- DNS propagation check across Google, Cloudflare, and Quad9

✅ **SSL/TLS Deep Inspection**
- Certificate chain validation and length
- TLS version with deprecated protocol detection
- Cipher strength analysis (Strong/Medium/Weak)
- Certificate fingerprint (SHA-256)
- OCSP stapling support detection
- Multiple SAN (Subject Alternative Names)

✅ **Advanced Port Scanning**
- 16 common ports with service detection
- Banner grabbing for service identification
- Services: FTP, SSH, Telnet, SMTP, DNS, HTTP, POP3, IMAP, HTTPS, SMB, MySQL, RDP, PostgreSQL, Redis, HTTP-Alt, HTTPS-Alt

✅ **HTTP/HTTPS Advanced Analysis**
- Performance metrics: response time, content length
- HTTP/2 support detection
- Redirect chain tracking with status codes
- Security headers automated scoring (60-point scale)
- Cookie security analysis (Secure, HttpOnly, SameSite flags)
- CORS policy detection

✅ **WAF & CDN Detection**
- Cloudflare, Akamai, AWS CloudFront
- Fastly, Incapsula, Sucuri, Wordfence
- Signature-based identification

✅ **Web Application Discovery**
- Homepage title and CMS/generator detection
- Meta tags: description, keywords, Open Graph, Twitter Card
- Subresource Integrity (SRI) detection and count
- Technology stack fingerprinting (web server, backend, CMS)

✅ **Security File Discovery**
- robots.txt
- sitemap.xml
- ads.txt
- humans.txt
- security.txt (RFC 9116)
- .well-known/change-password
- favicon.ico with SHA-256 hash

✅ **Email Security Validation**
- SPF (Sender Policy Framework) record detection
- DMARC policy presence and content

✅ **Network Intelligence**
- ASN (Autonomous System Number) and organization via RDAP
- Geolocation: country, region, city, coordinates (via ipapi.co)
- Reverse DNS (PTR) lookups

✅ **WHOIS Data**
- Domain registrar, creation/expiration dates
- Status codes, contact emails  

## Configuration

- **CORS**: Allows requests from `localhost:5173`, `localhost:5174` (Vite dev servers)
- **Timeouts**: DNS (5s), HTTP (6s), Port scan (1s/port), External APIs (3-4s)
- **Port Range**: 21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 3306, 3389, 5432, 6379, 8080, 8443

## Notes

- WHOIS lookups may be slow or rate-limited for some TLDs
- Geolocation uses public API (ipapi.co) which may have rate limits
- Port scanning is intentionally limited to common ports for ethical/legal reasons
- All HTTPS requests use verified SSL certificates (no insecure warnings)
