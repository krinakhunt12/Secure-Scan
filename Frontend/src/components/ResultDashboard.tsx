
import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ScanResult } from '../../types';
import SecurityScore from './SecurityScore';
import SSLCard from './SSLCard';
import HeadersCard from './HeadersCard';
import DomainInfoCard from './DomainInfoCard';
import PortScanCard from './PortScanCard';
import ThreatIntelCard from './ThreatIntelCard';
import AIConsultantChat from './AIConsultantChat';
import SubdomainCard from './SubdomainCard';
import BrandProtectionCard from './BrandProtectionCard';
import { Download, RefreshCw, AlertTriangle, ShieldAlert, ChevronRight, Loader2, Tractor } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ResultDashboardProps {
  result: ScanResult;
  onScanAgain: () => void;
}

function ResultDashboard({ result, onScanAgain }: ResultDashboardProps) {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  // Find critical threats for summary
  const criticalThreats = useMemo(() => 
    result.threatIntel.filter(t => t.severity.toLowerCase() === 'critical' || t.severity.toLowerCase() === 'high'),
    [result.threatIntel]
  );

  const reportId = useMemo(() => Math.random().toString(36).substr(2, 9).toUpperCase(), []);

  const handleExportPDF = async () => {
    if (!dashboardRef.current) {
      console.error('Dashboard ref not found');
      return;
    }
    
    setIsExporting(true);
    try {
      // Small delay to ensure any layout shifts are settled
      await new Promise(resolve => setTimeout(resolve, 300));

      const element = dashboardRef.current;
      
      console.log('Starting PDF generation...');
      
      // Pre-process: Store all computed RGB values BEFORE cloning
      const colorMap = new Map<Element, {bg: string, color: string, borders: string[]}>();
      const allElements = Array.from(element.querySelectorAll('*'));
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        allElements.forEach((el) => {
          try {
            const cs = window.getComputedStyle(el);
            
            // Convert oklch/modern colors to RGB using canvas
            const convertColor = (color: string): string => {
              if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return color;
              try {
                tempCtx.fillStyle = color;
                return tempCtx.fillStyle; // Returns rgb/rgba
              } catch {
                return 'rgb(226, 232, 240)'; // fallback
              }
            };
            
            colorMap.set(el, {
              bg: convertColor(cs.backgroundColor),
              color: convertColor(cs.color),
              borders: [
                convertColor(cs.borderTopColor),
                convertColor(cs.borderRightColor),
                convertColor(cs.borderBottomColor),
                convertColor(cs.borderLeftColor)
              ]
            });
          } catch (e) {
            // skip
          }
        });
      }
      
      // Use a higher scale for crisp output
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: 'rgb(15, 23, 42)',
        logging: false,
        foreignObjectRendering: false,
        imageTimeout: 0,
        removeContainer: true,
        onclone: (clonedDoc) => {
          console.log('Cloning document for export...');
          
          // Remove all external stylesheets that might contain oklch
          const styleSheets = Array.from(clonedDoc.querySelectorAll('link[rel="stylesheet"]'));
          styleSheets.forEach(sheet => {
            if (sheet instanceof HTMLLinkElement) {
              sheet.disabled = true;
              sheet.remove();
            }
          });
          
          // Remove existing style tags
          const styleTags = Array.from(clonedDoc.querySelectorAll('style'));
          styleTags.forEach(style => style.remove());
          
          // Inject minimal safe RGB-only stylesheet
          const styleOverride = clonedDoc.createElement('style');
          styleOverride.textContent = `
            * {
              background-image: none !important;
              box-shadow: none !important;
              text-shadow: none !important;
              filter: none !important;
              backdrop-filter: none !important;
            }
            body {
              background-color: rgb(15, 23, 42) !important;
              color: rgb(226, 232, 240) !important;
              font-family: system-ui, -apple-system, sans-serif !important;
              margin: 0 !important;
              padding: 24px !important;
              line-height: 1.5 !important;
            }
            .pdf-container {
              background-color: rgb(15, 23, 42) !important;
              padding: 24px !important;
            }
            .pdf-container > * {
              margin-bottom: 24px !important;
            }
            /* Safe RGB color palette for all UI elements */
            .bg-slate-900 { background-color: rgb(15, 23, 42) !important; }
            .bg-slate-800 { background-color: rgb(30, 41, 59) !important; }
            .bg-slate-700 { background-color: rgb(51, 65, 85) !important; }
            .text-slate-200 { color: rgb(226, 232, 240) !important; }
            .text-slate-300 { color: rgb(203, 213, 225) !important; }
            .text-blue-400 { color: rgb(96, 165, 250) !important; }
            .text-emerald-400 { color: rgb(52, 211, 153) !important; }
            .text-red-400 { color: rgb(248, 113, 113) !important; }
            .text-amber-400 { color: rgb(251, 191, 36) !important; }
            .border-slate-700 { border-color: rgb(51, 65, 85) !important; }
            .border-slate-600 { border-color: rgb(71, 85, 105) !important; }
          `;
          clonedDoc.head.appendChild(styleOverride);
          
          // Hide interactive/unnecessary elements in the PDF version
          const buttons = clonedDoc.querySelectorAll('button');
          buttons.forEach(btn => {
            const btnEl = btn as HTMLElement;
            btnEl.style.display = 'none';
          });

          const exportBar = clonedDoc.querySelector('.export-ignore');
          if (exportBar) {
            (exportBar as HTMLElement).style.display = 'none';
          }

          // Process all elements to ensure RGB colors
          try {
            const all = Array.from(clonedDoc.querySelectorAll('*')) as HTMLElement[];
            all.forEach((el, index) => {
              try {
                // Apply pre-computed RGB colors from the map
                const originalEl = allElements[index];
                const colors = colorMap.get(originalEl);
                
                if (colors && colors.bg && colors.bg !== 'transparent') {
                  el.style.setProperty('background-color', colors.bg, 'important');
                }
                if (colors && colors.color) {
                  el.style.setProperty('color', colors.color, 'important');
                }
                
                // Force remove all potentially problematic properties
                el.style.removeProperty('background-image');
                el.style.removeProperty('box-shadow');
                el.style.removeProperty('text-shadow');
                el.style.removeProperty('filter');
                el.style.removeProperty('backdrop-filter');
                
                // Remove gradient-related classes
                const classList = Array.from(el.classList);
                const problematicClasses = classList.filter(c => 
                  c.includes('from-') || 
                  c.includes('via-') || 
                  c.includes('to-') ||
                  c.includes('bg-gradient')
                );
                problematicClasses.forEach(c => el.classList.remove(c));
              } catch (inner) {
                // ignore element-specific errors
              }
            });
            
            console.log('Applied RGB color overrides');
          } catch (e) {
            console.warn('Color processing warning:', e);
          }
        }
      });

      console.log('Canvas generated, creating PDF...');

      // Convert to JPEG for better compression
      const imgData = canvas.toDataURL('image/jpeg', 0.92);

      // Create an A4 PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Add a simple cover page
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.text('SecureScan AI', pageWidth / 2, 40, { align: 'center' });
      pdf.setFontSize(18);
      pdf.text('Security Analysis Report', pageWidth / 2, 52, { align: 'center' });
      pdf.setFontSize(12);
      pdf.setTextColor(147, 197, 253);
      pdf.text(`${result.url}`, pageWidth / 2, 66, { align: 'center' });
      pdf.setFontSize(10);
      pdf.setTextColor(203, 213, 225);
      pdf.text(`Generated: ${new Date(result.timestamp).toLocaleString()}`, pageWidth / 2, 78, { align: 'center' });
      pdf.text(`Report ID: ${reportId}`, pageWidth / 2, 86, { align: 'center' });

      // Prepare image pagination
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth - 20; // 10mm margin each side
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      let heightLeft = imgHeight;
      let position = 0;

      // First content page
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);
      heightLeft -= (pageHeight - 20);

      // Additional pages if content is taller than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 10, position + 10, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 20);
      }

      // Footer on last page
      pdf.setPage(pdf.getNumberOfPages());
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text(`SecureScan AI • ${result.url} • ${reportId}`, pageWidth / 2, pageHeight - 8, { align: 'center' });

      console.log('PDF ready, downloading...');

      // Sanitize filename
      const sanitizedUrl = result.url.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
      const filename = `SecureScan_${sanitizedUrl}_${reportId}.pdf`;
      
      // Save the PDF
      pdf.save(filename);
      
      console.log('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF Generation failed:', error);
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto w-full max-w-7xl px-4 py-8 space-y-8"
    >
      {/* Action Bar (Not included in PDF) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md export-ignore">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Analysis Report: <span className="text-blue-400">{result.url}</span>
            </h2>
            <div className="flex items-center gap-3 text-slate-400 text-sm mt-1 font-medium">
              <span>{new Date(result.timestamp).toLocaleDateString()}</span>
              <span className="h-1 w-1 rounded-full bg-slate-700" />
              <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
              <span className="h-1 w-1 rounded-full bg-slate-700" />
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                <Tractor size={12} /> AGRI-CONTEXT ACTIVE
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-sm font-medium border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
            {isExporting ? 'Generating...' : 'Export PDF'}
          </button>
          <button 
            onClick={onScanAgain}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all text-sm font-bold shadow-lg shadow-blue-500/20"
          >
            <RefreshCw size={16} /> New Scan
          </button>
        </div>
      </div>

      {/* Main Dashboard Content (This is what gets captured) */}
      <div ref={dashboardRef} className="space-y-8 pdf-container">
        {/* Critical Threat Alert Bar (only if threats exist) */}
        {criticalThreats.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 animate-pulse items-center justify-center rounded-lg bg-red-500/20 text-red-500">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Action Required: {criticalThreats.length} Critical Issues Detected</h4>
                <p className="text-xs text-red-400/80">Immediate attention recommended for vulnerabilities identified in the intelligence feed.</p>
              </div>
            </div>
            <button className="hidden sm:flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300 transition-colors">
              Review Threats <ChevronRight size={14} />
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Side: Score & Intel Feed */}
          <div className="lg:col-span-4 space-y-6">
            {/* Score Card */}
            <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-md flex flex-col items-center justify-center">
              <SecurityScore score={result.score} risk={result.riskLevel} />
              <div className="mt-8 w-full">
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">Technical Verdict</p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {result.score >= 80 
                      ? "Overall security is robust. Your infrastructure meets current industry standards. Regular monitoring is advised."
                      : result.score >= 50 
                      ? "Significant misconfigurations found. We recommend prioritizing SSL hardening and implementing missing CSP headers."
                      : "Critical vulnerabilities detected. This domain is currently susceptible to high-severity exploits. Immediate remediation required."}
                  </p>
                </div>
              </div>
            </div>

            {/* Integrated Threat Intelligence Feed */}
            <ThreatIntelCard 
              threats={result.threatIntel} 
              domain={result.url.replace(/^https?:\/\//, '').replace(/\/$/, '')} 
            />
          </div>

          {/* Right Side: Detailed Diagnostic Modules */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 content-start">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <SSLCard ssl={result.ssl} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <HeadersCard headers={result.headers} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="md:col-span-2"
            >
              <DomainInfoCard domain={result.domain} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="md:col-span-2"
            >
              <PortScanCard ports={result.ports} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className="md:col-span-2"
            >
              <SubdomainCard subdomains={result.subdomains || []} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="md:col-span-2"
            >
              <BrandProtectionCard lookalikes={result.lookalikes || []} />
            </motion.div>

            {/* Additional Backend Data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="md:col-span-2 p-6 rounded-2xl border border-white/5 bg-white/2 space-y-4"
            >
              <h4 className="text-sm font-bold text-white">Extended Intelligence</h4>
              <div className="text-sm text-slate-300 space-y-3">
                
                {/* Performance Metrics */}
                {result.rawBackend?.http?.performance && (
                  <div>
                    <span className="font-medium text-slate-400">⚡ Performance:</span>
                    <div className="mt-1 text-xs text-slate-200">
                      Response: {result.rawBackend.http.performance.response_time_ms}ms • 
                      Size: {(result.rawBackend.http.performance.content_length / 1024).toFixed(1)}KB
                      {result.rawBackend.http.http2_support && <span className="ml-2 text-green-400">• HTTP/2 ✓</span>}
                    </div>
                  </div>
                )}

                {/* Security Headers Score */}
                {result.rawBackend?.http?.security_headers_score !== undefined && (
                  <div>
                    <span className="font-medium text-slate-400">🛡️ Security Headers:</span>
                    <div className="mt-1 text-xs">
                      <span className={`font-bold ${result.rawBackend.http.security_headers_score >= 50 ? 'text-green-400' : result.rawBackend.http.security_headers_score >= 30 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {result.rawBackend.http.security_headers_score}/60
                      </span>
                    </div>
                  </div>
                )}

                {/* WAF/CDN Detection */}
                {result.rawBackend?.http?.waf_cdn && result.rawBackend.http.waf_cdn.length > 0 && (
                  <div>
                    <span className="font-medium text-slate-400">🔒 WAF/CDN:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {result.rawBackend.http.waf_cdn.map((w: string, idx: number) => (
                        <span key={idx} className="inline-block px-2 py-0.5 text-[10px] bg-purple-500/10 text-purple-400 rounded border border-purple-500/20 uppercase">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cookie Security */}
                {result.rawBackend?.http?.cookies && result.rawBackend.http.cookies.length > 0 && (
                  <div>
                    <span className="font-medium text-slate-400">🍪 Cookies:</span>
                    <div className="mt-1 text-xs text-slate-200">
                      {result.rawBackend.http.cookies.length} cookie(s) • 
                      Secure: {result.rawBackend.http.cookies.filter((c: any) => c.secure).length} • 
                      HttpOnly: {result.rawBackend.http.cookies.filter((c: any) => c.httponly).length}
                    </div>
                  </div>
                )}

                {/* CORS Policy */}
                {result.rawBackend?.http?.cors && Object.keys(result.rawBackend.http.cors).length > 0 && (
                  <div>
                    <span className="font-medium text-slate-400">🌐 CORS:</span>
                    <div className="mt-1 text-xs text-slate-200">
                      {result.rawBackend.http.cors['access-control-allow-origin'] 
                        ? `Origin: ${result.rawBackend.http.cors['access-control-allow-origin']}`
                        : 'Configured'}
                    </div>
                  </div>
                )}

                {/* SSL Details */}
                {result.rawBackend?.ssl && !result.rawBackend.ssl.error && (
                  <div>
                    <span className="font-medium text-slate-400">🔐 SSL/TLS:</span>
                    <div className="mt-1 text-xs text-slate-200 space-y-0.5">
                      <div>Version: {result.rawBackend.ssl.tls_version || 'N/A'} 
                        {result.rawBackend.ssl.deprecated_tls && <span className="ml-2 text-red-400">⚠️ Deprecated</span>}
                      </div>
                      <div>Cipher: {result.rawBackend.ssl.cipher_strength || 'Unknown'} ({result.rawBackend.ssl.cipher_bits || 0} bits)</div>
                      <div>Chain: {result.rawBackend.ssl.chain_length || 0} certificates</div>
                      {result.rawBackend.ssl.ocsp_stapling && <div className="text-green-400">OCSP Stapling ✓</div>}
                    </div>
                  </div>
                )}

                {/* DNSSEC */}
                {result.rawBackend?.dns?.DNSSEC && (
                  <div>
                    <span className="font-medium text-slate-400">🔏 DNSSEC:</span>
                    <span className={`ml-2 text-xs font-bold ${result.rawBackend.dns.DNSSEC.validated ? 'text-green-400' : 'text-slate-500'}`}>
                      {result.rawBackend.dns.DNSSEC.validated ? '✓ Validated' : '✗ Not Validated'}
                    </span>
                  </div>
                )}

                {/* DNS Propagation */}
                {result.rawBackend?.dns?.PROPAGATION && (
                  <div>
                    <span className="font-medium text-slate-400">🌍 DNS Propagation:</span>
                    <div className="mt-1 text-xs text-slate-200 space-y-0.5">
                      {Object.entries(result.rawBackend.dns.PROPAGATION).map(([dns, ips]: [string, any]) => (
                        <div key={dns}>
                          {dns}: {ips ? <span className="text-green-400">✓</span> : <span className="text-red-400">✗</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Email Security */}
                {result.rawBackend?.email_security && (
                  <div>
                    <span className="font-medium text-slate-400">📧 Email Security:</span>
                    <div className="mt-1 text-xs text-slate-200 space-y-0.5">
                      <div>SPF: {result.rawBackend.email_security.spf?.present ? <span className="text-green-400">✓ Present</span> : <span className="text-slate-500">✗ Missing</span>}</div>
                      <div>DMARC: {result.rawBackend.email_security.dmarc?.present ? <span className="text-green-400">✓ Present</span> : <span className="text-slate-500">✗ Missing</span>}</div>
                    </div>
                  </div>
                )}

                {/* Meta Tags & SEO */}
                {result.rawBackend?.homepage?.meta_tags && Object.keys(result.rawBackend.homepage.meta_tags).length > 0 && (
                  <div>
                    <span className="font-medium text-slate-400">🏷️ Meta Tags:</span>
                    <div className="mt-1 text-xs text-slate-200 space-y-0.5">
                      {result.rawBackend.homepage.meta_tags.description && (
                        <div className="truncate">Desc: {result.rawBackend.homepage.meta_tags.description.substring(0, 60)}...</div>
                      )}
                      {result.rawBackend.homepage.meta_tags.og_title && <div>OG: ✓</div>}
                      {result.rawBackend.homepage.meta_tags.twitter_card && <div>Twitter Card: ✓</div>}
                    </div>
                  </div>
                )}

                {/* Subresource Integrity */}
                {result.rawBackend?.homepage?.has_sri && (
                  <div>
                    <span className="font-medium text-slate-400">🔗 SRI:</span>
                    <span className="ml-2 text-xs text-green-400">✓ {result.rawBackend.homepage.sri_count} resource(s)</span>
                  </div>
                )}

                {/* Technologies */}
                {result.rawBackend?.technologies && result.rawBackend.technologies.length > 0 && (
                  <div>
                    <span className="font-medium text-slate-400">💻 Technologies:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {result.rawBackend.technologies.map((tech: any, idx: number) => (
                        <span key={idx} className="inline-block px-2 py-0.5 text-[10px] bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
                          {tech.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Well-known Files */}
                <div>
                  <span className="font-medium text-slate-400">📄 Discovery Files:</span>
                  <div className="mt-1 text-xs text-slate-200 space-y-0.5">
                    {result.rawBackend?.security_txt && <div>security.txt: <span className="text-green-400">✓</span></div>}
                    {result.rawBackend?.sitemap && <div>sitemap.xml: <span className="text-green-400">✓</span></div>}
                    {result.rawBackend?.ads_txt && <div>ads.txt: <span className="text-green-400">✓</span></div>}
                    {result.rawBackend?.humans_txt && <div>humans.txt: <span className="text-green-400">✓</span></div>}
                    {result.rawBackend?.change_password && <div>.well-known/change-password: <span className="text-green-400">✓</span></div>}
                    {!result.rawBackend?.security_txt && !result.rawBackend?.sitemap && <div className="text-slate-500">None detected</div>}
                  </div>
                </div>

                {/* Redirect Chain */}
                {result.rawBackend?.http?.redirect_chain && result.rawBackend.http.redirect_chain.length > 0 && (
                  <div>
                    <span className="font-medium text-slate-400">🔄 Redirects:</span>
                    <div className="mt-1 text-xs text-slate-200">
                      {result.rawBackend.http.redirect_chain.length} hop(s)
                    </div>
                  </div>
                )}

                {/* ASN */}
                <div>
                  <span className="font-medium text-slate-400">🏢 ASN:</span>
                  <div className="mt-1 text-xs text-slate-200">
                    {result.rawBackend?.asn ? (
                      Object.entries(result.rawBackend.asn).map(([ip, a]) => (
                        <div key={ip} className="flex items-center gap-2">
                          <span className="font-mono text-[12px] text-slate-500">{ip}</span>
                          <span className="text-slate-300">{(a as any).asn || '—'}</span>
                          <span className="text-slate-400/70 truncate">{(a as any).asn_org || ''}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-500">No data</span>
                    )}
                  </div>
                </div>

                {/* Geo */}
                <div>
                  <span className="font-medium text-slate-400">📍 Location:</span>
                  <div className="mt-1 text-xs text-slate-200">
                    {result.rawBackend?.geo ? (
                      Object.entries(result.rawBackend.geo).map(([ip, g]) => (
                        <div key={ip} className="flex items-center gap-2">
                          <span className="font-mono text-[12px] text-slate-500">{ip}</span>
                          <span className="text-slate-300">{(g as any)?.country || '—'}</span>
                          <span className="text-slate-400/70">{(g as any)?.city ? `${(g as any).city}` : ''}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-500">No data</span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <button onClick={() => setShowRaw(s => !s)} className="text-xs font-semibold text-blue-400 hover:text-blue-300">{showRaw ? 'Hide' : 'Show'} Raw Backend JSON</button>
                </div>
                {showRaw && (
                  <pre className="mt-2 max-h-80 overflow-auto text-xs bg-slate-900/60 p-3 rounded-md border border-white/5 font-mono text-slate-200">{JSON.stringify(result.rawBackend || result, null, 2)}</pre>
                )}
              </div>
            </motion.div>

            {/* Additional context module */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
                className="md:col-span-2 p-6 rounded-2xl border border-white/5 bg-white/2 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Compliance Standard: NIST-800-53</h4>
                  <p className="text-xs text-slate-500">Auto-mapped results against federal security controls.</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Audited System</span>
            </motion.div>
          </div>
        </div>
        
        {/* PDF Footer (Invisible in UI, captured in PDF) */}
        <div className="pt-12 border-t border-white/5 text-center">
          <p className="text-[10px] text-slate-600 font-mono tracking-widest uppercase">
            Generated by SecureScan AI v3.1 | Report Authentication: {reportId}-{result.url.length}
          </p>
        </div>
      </div>
      
      {/* AI Chat Integration */}
      <AIConsultantChat scanResult={result} />
    </motion.div>
  );
};

export default ResultDashboard;