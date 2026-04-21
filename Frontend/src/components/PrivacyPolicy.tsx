import React from 'react';
import { View } from '../../types';

interface Props {
  onBack?: () => void;
}

export default function PrivacyPolicy({ onBack }: Props) {
  return (
          <div className="mx-auto max-w-4xl px-4 py-12">
            <button onClick={onBack} className="mb-6 text-sm text-blue-400 hover:underline">← Back</button>

            <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              This Privacy Policy describes how SecureScan AI collects, uses, and shares information
              when you access our website, use our scanning services, or interact with our APIs.
              We are committed to protecting your privacy and handling your data responsibly.
            </p>

            <section className="mt-6 text-sm text-slate-300 space-y-4">
              <div>
                <h2 className="font-semibold">1. Scope</h2>
                <p>
                  This policy applies to all users of SecureScan AI services, including anonymous visitors,
                  registered users, and API consumers. It covers data collected through the website,
                  the frontend application, and backend APIs.
                </p>
              </div>

              <div>
                <h2 className="font-semibold">2. Information We Collect</h2>
                <ul className="list-disc ml-5">
                  <li>
                    <strong>Domain & scan data:</strong> Domain names, DNS records, SSL/TLS certificate
                    metadata, HTTP headers, open ports, service banners and scan-derived threat intelligence.
                  </li>
                  <li>
                    <strong>Technical telemetry:</strong> Timestamps, request logs, IP addresses of scanning
                    nodes, and performance metrics used to operate and improve the service.
                  </li>
                  <li>
                    <strong>Account information (optional):</strong> Email, username, and billing details
                    if you register for a paid plan.
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="font-semibold">3. How We Use Information</h2>
                <p>
                  We use collected information to provide scanning and reporting features, to improve
                  detection algorithms, to communicate with users about scans and notifications, and
                  to comply with legal obligations. Aggregated and anonymized data may be used for
                  research and product improvement.
                </p>
              </div>

              <div>
                <h2 className="font-semibold">4. Legal Basis</h2>
                <p>
                  Where applicable, our processing is based on legitimate interests (providing and
                  improving the service), contract performance (delivering paid services), and
                  consent for marketing communications.
                </p>
              </div>

              <div>
                <h2 className="font-semibold">5. Sharing and Disclosure</h2>
                <p>
                  We do not sell personal data. We may share data with:
                </p>
                <ul className="list-disc ml-5">
                  <li>Service providers who perform infrastructure and analytics functions.</li>
                  <li>Law enforcement or courts if required by law.</li>
                  <li>Affiliates or acquirers in connection with a business transaction (with notice).</li>
                </ul>
              </div>

              <div>
                <h2 className="font-semibold">6. Data Retention</h2>
                <p>
                  Scan results and telemetry are retained for operational and security purposes. Retention
                  periods vary by data type; aggregated anonymized records are kept longer for analytics.
                  You may request deletion of your account data by contacting privacy@securescan.example.
                </p>
              </div>

              <div>
                <h2 className="font-semibold">7. Security</h2>
                <p>
                  We implement administrative, technical, and physical safeguards to protect data.
                  Access is limited to authorized personnel and we use encryption in transit (TLS)
                  and at-rest protections for sensitive information.
                </p>
              </div>

              <div>
                <h2 className="font-semibold">8. Cookies and Tracking</h2>
                <p>
                  We use cookies and similar technologies for session management, analytics, and
                  to provide a better user experience. You can control cookies through your browser
                  settings.
                </p>
              </div>

              <div>
                <h2 className="font-semibold">9. Your Rights</h2>
                <p>
                  Depending on your jurisdiction, you may have rights to access, correct, export,
                  or delete your personal data. To exercise these rights, contact privacy@securescan.example.
                </p>
              </div>

              <div>
                <h2 className="font-semibold">10. International Transfers</h2>
                <p>
                  Data may be processed in the United States or other countries where our service
                  providers operate. We take steps to ensure appropriate safeguards for international
                  transfers.
                </p>
              </div>

              <div>
                <h2 className="font-semibold">11. Children</h2>
                <p>
                  Our services are not directed to children under 16. We do not knowingly collect
                  personal data from children.
                </p>
              </div>

              <div>
                <h2 className="font-semibold">12. Changes to This Policy</h2>
                <p>
                  We may update this policy to reflect changes in our practices. We will post a
                  prominent notice on the site when updates occur and indicate the effective date.
                </p>
              </div>

              <div>
                <h2 className="font-semibold">13. Contact</h2>
                <p>
                  For privacy inquiries, data requests, or complaints, contact: <br />
                  <a className="text-blue-400" href="mailto:privacy@securescan.example">privacy@securescan.example</a>
                </p>
              </div>
            </section>
          </div>
        );
}
