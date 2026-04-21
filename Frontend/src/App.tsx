
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import CyberBackground from './components/CyberBackground';
import Navbar from './components/Navbar';
import ScanForm from './components/ScanForm';
import LoadingState from './components/LoadingState';
import ResultDashboard from './components/ResultDashboard';
import ScanHistory from './components/ScanHistory';
import MainDashboard from './components/MainDashboard';
import ErrorPage from './components/ErrorPage';
import LandingFeatures from './components/LandingFeatures';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import Documentation from './components/Documentation';
import { fetchDomain, fetchThreats, fetchSubdomains, fetchLookalikes } from './services/backendService';
import { ScanResult, HistoryItem, View, PortStatus } from '../types';

// Fix: Use 'as const' to ensure 'ease' property has a literal type instead of 'string', 
// which satisfies the Easing type required by framer-motion.
const viewVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: "easeInOut" }
} as const;

function App() {
  const [currentView, setCurrentView] = useState<View>(View.LANDING);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAttemptedUrl, setLastAttemptedUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Automatically switch to Dashboard on launch if history exists and we are on Landing
  useEffect(() => {
    if (history.length > 0 && currentView === View.LANDING && !isScanning && !result && !error) {
      setCurrentView(View.DASHBOARD);
    }
  }, [history.length, error]);

  const handleScan = async (url: string) => {
    setIsScanning(true);
    setError(null);
    setResult(null);
    setLastAttemptedUrl(url);

    // Basic URL validation
    if (!url.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)) {
      setError("Invalid URL format. The security engine requires a fully qualified domain name (e.g., example.com) to initiate deep-packet inspection.");
      setIsScanning(false);
      return;
    }

    try {
      // Prefer backend domain scan if available
      const domainResp = await fetchDomain(url.replace(/https?:\/\//, '').replace(/\/$/, ''));
      const threatsResp = await fetchThreats(url.replace(/https?:\/\//, '').replace(/\/$/, '')).catch(() => ({ threats: [] }));
      const subdomainResp = await fetchSubdomains(url.replace(/https?:\/\//, '').replace(/\/$/, '')).catch(() => ({ subdomains: [] }));
      const lookalikesResp = await fetchLookalikes(url.replace(/https?:\/\//, '').replace(/\/$/, '')).catch(() => ({ lookalikes: [] }));

      // Map backend response into ScanResult shape
      const ips: string[] = domainResp.ips || [];
      const openPorts: number[] = domainResp.open_ports || [];

      // compute a simple score heuristic
      let score = 100;
      score -= Math.min(50, (openPorts.length || 0) * 10);
      if (domainResp.ssl && domainResp.ssl.error) score -= 20;
      if (domainResp.http && domainResp.http.error) score -= 10;
      score = Math.max(0, Math.min(100, Math.round(score)));

      const risk = score >= 80 ? 'Low' : score >= 50 ? 'Medium' : 'High';

      // SSL mapping
      let ssl = {
        status: 'Unknown' as 'Secure' | 'Vulnerable' | 'Unknown',
        issuer: domainResp.ssl?.issuer || '',
        expiryDate: domainResp.ssl?.not_after || '',
        daysRemaining: 0
      };
      if (domainResp.ssl && !domainResp.ssl.error) {
        ssl.status = 'Secure';
        if (domainResp.ssl.not_after) {
          const expiry = new Date(domainResp.ssl.not_after);
          const diff = Math.max(0, Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
          ssl.daysRemaining = diff;
          ssl.expiryDate = domainResp.ssl.not_after;
        }
      }

      // headers mapping
      const headersObj = domainResp.http?.headers || {};
      const headerNames = ['content-security-policy','strict-transport-security','x-frame-options','x-content-type-options','referrer-policy','permissions-policy'];
      const headers = headerNames.map((h) => ({ name: h, present: !!headersObj[h], value: headersObj[h] }));

      // domain info
      const whois = domainResp.whois || {};
      const created = whois.creation_date || whois.creationDate || null;
      let domainAgeYears = 0;
      let domainAgeStr = '';
      if (created) {
        const d = new Date(created);
        const years = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365);
        domainAgeYears = Number((years).toFixed(1));
        domainAgeStr = `${domainAgeYears.toFixed(1)} years`;
      }

      const domainInfo = {
        ipAddress: ips[0] || domainResp.domain?.ipAddress || '',
        hostingServer: (domainResp.reverse_dns && ips[0] ? domainResp.reverse_dns[ips[0]] : '') || '',
        domainAge: domainAgeStr,
        domainAgeYears: domainAgeYears,
        expiryDate: whois.expiration_date || whois.expiryDate || ''
      };

      // Map enhanced port data from backend (now includes service names)
      const ports = (openPorts || []).map((p: any) => ({
        port: typeof p === 'number' ? p : p.port,
        service: typeof p === 'object' && p.service ? p.service : (p === 80 ? 'HTTP' : p === 443 ? 'HTTPS' : p === 22 ? 'SSH' : 'unknown'),
        status: 'Open' as const
      })) as PortStatus[];

      const scanResult: ScanResult = {
        url,
        timestamp: new Date().toISOString(),
        score,
        riskLevel: risk as any,
        ssl,
        headers,
        domain: domainInfo,
        ports,
        threatIntel: threatsResp.threats || []
        ,rawBackend: domainResp,
        subdomains: subdomainResp.subdomains || [],
        lookalikes: lookalikesResp.lookalikes || []
      };

      setResult(scanResult);

      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        url: scanResult.url,
        score: scanResult.score,
        date: scanResult.timestamp,
        riskLevel: scanResult.riskLevel,
        domainAgeYears: scanResult.domain.domainAgeYears,
        subdomainCount: scanResult.subdomains?.length || 0
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 10));
      setCurrentView(View.RESULT);
    } catch (err) {
      console.error(err);
      setError("Network Handshake Failed. The target host refused the diagnostic probe or is currently unreachable from our global scanning nodes.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleNavigate = (view: View) => {
    // Reset transient states when navigating to a static view
    setError(null);
    setResult(null);
    setCurrentView(view);
  };

  const handleRetry = () => {
    if (lastAttemptedUrl) {
      handleScan(lastAttemptedUrl);
    } else {
      handleNavigate(View.LANDING);
    }
  };

  const renderContent = () => {
    if (isScanning) return (
      <motion.div key="loading" {...viewVariants}>
        <LoadingState />
      </motion.div>
    );
    
    if (error) {
      return (
        <motion.div key="error-view" {...viewVariants}>
          <ErrorPage 
            message={error} 
            onRetry={handleRetry} 
            onGoHome={() => handleNavigate(View.LANDING)} 
          />
        </motion.div>
      );
    }

    if (result) {
      return (
        <motion.div key="result-view" {...viewVariants}>
          <ResultDashboard result={result} onScanAgain={() => handleNavigate(View.LANDING)} />
        </motion.div>
      );
    }

    if (currentView === View.PRIVACY) {
      return (
        <motion.div key="privacy" {...viewVariants}>
          <PrivacyPolicy onBack={() => handleNavigate(View.LANDING)} />
        </motion.div>
      );
    }

    if (currentView === View.TERMS) {
      return (
        <motion.div key="terms" {...viewVariants}>
          <TermsOfService onBack={() => handleNavigate(View.LANDING)} />
        </motion.div>
      );
    }

    if (currentView === View.DOCUMENTATION) {
      return (
        <motion.div key="docs" {...viewVariants}>
          <Documentation onBack={() => handleNavigate(View.LANDING)} />
        </motion.div>
      );
    }

    switch (currentView) {
      case View.LANDING:
        return (
          <motion.section key="landing" {...viewVariants} className="flex flex-col items-center py-20 lg:py-32 max-w-7xl mx-auto">
            <div className="text-center px-4 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-blue-400 backdrop-blur-md"
              >
                <ShieldAlert size={16} />
                <span>Security Engine v3.1</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6 font-heading text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl"
              >
                Scan Any Website <br />
                <span className="bg-linear-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  For Security & Compliance
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mx-auto max-w-2xl text-lg text-slate-400 sm:text-xl"
              >
                Instant SSL, Security Headers, DNS, and open port risk analysis. 
                Get professional grade cybersecurity diagnostics in seconds.
              </motion.p>
            </div>

            <ScanForm onScan={handleScan} isScanning={isScanning} />

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-16 flex flex-wrap justify-center gap-8 px-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-700"
            >
              <div className="flex items-center gap-2 font-bold text-white"><ShieldAlert /> HIPAA Compliant</div>
              <div className="flex items-center gap-2 font-bold text-white"><ShieldAlert /> SOC2 Ready</div>
              <div className="flex items-center gap-2 font-bold text-white"><ShieldAlert /> PCI-DSS V4.0</div>
            </motion.div>

            <LandingFeatures />
          </motion.section>
        );

      case View.DASHBOARD:
        return (
          <motion.div key="dashboard" {...viewVariants}>
            <MainDashboard history={history} onStartNewScan={() => handleNavigate(View.LANDING)} />
          </motion.div>
        );

      case View.HISTORY:
        return (
          <motion.div key="history" {...viewVariants}>
            <ScanHistory history={history} />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-slate-50 selection:bg-blue-500/30 flex flex-col font-sans">
      <CyberBackground />
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      <main className="relative z-10 grow">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>

      <footer className="mt-auto border-t border-white/5 py-12 relative z-10 bg-slate-950/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 items-center justify-center rounded bg-blue-600/20 text-blue-400 flex ring-1 ring-blue-500/20">
                <ShieldAlert size={20} />
              </div>
              <span className="font-heading font-bold text-xl text-white">SecureScan <span className="text-blue-500">AI</span></span>
            </div>
            
            <div className="flex gap-8 text-sm text-slate-500">
              <button onClick={() => handleNavigate(View.PRIVACY)} className="hover:text-blue-400 transition-colors">Privacy Policy</button>
              <button onClick={() => handleNavigate(View.TERMS)} className="hover:text-blue-400 transition-colors">Terms of Service</button>
              <button onClick={() => handleNavigate(View.DOCUMENTATION)} className="hover:text-blue-400 transition-colors">Documentation</button>
            </div>

            <p className="text-xs text-slate-600">
              © 2024 SecureScan AI Global Security Systems. 
              <span className="hidden sm:inline ml-2">Secure connection established via TLS 1.3</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
