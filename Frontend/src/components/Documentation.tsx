import React from 'react';

interface Props {
  onBack?: () => void;
}

export default function Documentation({ onBack }: Props) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <button onClick={onBack} className="mb-6 text-sm text-blue-400 hover:underline">← Back</button>

      <h1 className="text-3xl font-bold mb-4">Documentation</h1>

      <p className="text-sm text-slate-300 leading-relaxed">
        This documentation provides detailed guidance on using SecureScan AI, the available APIs,
        and best practices for interpreting scan results and remediating findings.
      </p>

      <section className="mt-6 text-sm text-slate-300 space-y-6">
        <div>
          <h2 className="font-semibold">Overview</h2>
          <p>
            SecureScan AI performs automated security analysis of public-facing domains, combining
            TLS/SSL checks, HTTP header auditing, DNS and email security checks, port scanning, and
            heuristic threat intelligence to produce actionable findings.
          </p>
        </div>

        <div>
          <h2 className="font-semibold">Quick Start</h2>
          <ol className="list-decimal ml-5">
            <li>Open the app and enter a domain (e.g., example.com) in the scan form.</li>
            <li>Start the scan and wait for the dashboard to populate results.</li>
            <li>Review SSL, Headers, Ports, and Threat Intelligence sections for prioritized issues.</li>
            <li>Export a PDF report using the "Export PDF" button for sharing with stakeholders.</li>
          </ol>
        </div>

        <div>
          <h2 className="font-semibold">API Reference</h2>
          <p className="font-medium">Endpoints</p>
          <ul className="list-disc ml-5">
            <li>
              <pre className="bg-slate-900 p-3 rounded text-xs overflow-auto">
                {`[
  {
    "id": "INC-2026-0001",
    "title": "Deprecated TLS version detected",
    "severity": "Critical",
    "source": "ssl-scanner",
    "description": "Detailed description of the finding",
    "remediation": "Upgrade TLS to 1.2+ and disable legacy ciphers"
  }
]`}
              </pre>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold">Threat Taxonomy</h2>
          <p>
            Threats are categorized by severity: <strong>Critical, High, Medium, Low, Info</strong>.
            Each finding includes a diagnostic source (e.g., `ssl-scanner`, `header-scanner`), a
            human-readable description, and suggested remediation steps.
          </p>
        </div>

        <div>
          <h2 className="font-semibold">Best Practices & Remediation</h2>
          <ul className="list-disc ml-5">
            <li>Enforce TLS 1.2+ (preferably TLS 1.3) and disable obsolete ciphers.</li>
            <li>Implement strong Content Security Policy and HSTS headers.</li>
            <li>Publish SPF, DKIM and DMARC for email authentication.</li>
            <li>Close or firewall administrative ports (RDP/SSH) from public internet access.</li>
            <li>Enable OCSP stapling and set appropriate cookie flags (Secure, HttpOnly, SameSite).</li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold">CLI / cURL Examples</h2>
          <pre className="bg-slate-900 p-3 rounded text-xs overflow-auto">curl "https://secure-scan-qv9z.onrender.com/api/threats?domain=example.com"</pre>
        </div>

        <div>
          <h2 className="font-semibold">Troubleshooting</h2>
          <p>
            If scans fail, check network connectivity and ensure the target domain resolves. For
            API errors, inspect backend logs and verify the `domain` parameter is valid (no protocol, no trailing slash).
          </p>
        </div>

        <div>
          <h2 className="font-semibold">Contact & Support</h2>
          <p>
            For developer support, email <a className="text-blue-400" href="mailto:devsupport@securescan.example">devsupport@securescan.example</a>.
            For security disclosures, please include scan details and reproduction steps.
          </p>
        </div>
      </section>
    </div>
  );
}
