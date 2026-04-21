
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Home, Terminal, ShieldX, Info, Flag, Check } from 'lucide-react';

interface ErrorPageProps {
  message: string;
  onRetry: () => void;
  onGoHome: () => void;
}

function ErrorPage({ message, onRetry, onGoHome }: ErrorPageProps) {
  const [copied, setCopied] = useState(false);

  const handleReport = () => {
    const timestamp = new Date().toISOString();
    const diagnosticBundle = `
--- SECURESCAN AI ERROR REPORT ---
Timestamp: ${timestamp}
Error Message: ${message}
Status Code: 503_SERVICE_UNAVAILABLE
Peering Node: US-EAST-1
----------------------------------
    `.trim();

    // Copy to clipboard
    navigator.clipboard.writeText(diagnosticBundle);
    
    // Log details to console as requested
    console.log("%c[SECURESCAN AI] INCIDENT_REPORTED", "color: #ef4444; font-weight: bold; font-size: 14px;");
    console.log({
      incidentId: Math.random().toString(36).substr(2, 9).toUpperCase(),
      timestamp,
      message,
      diagnosticBundle,
      action: 'USER_REPORT_SUBMITTED'
    });

    // Visual feedback
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto mt-20 max-w-4xl px-4 pb-20">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-red-500/20 bg-slate-900/40 p-8 md:p-12 backdrop-blur-xl">
        {/* Background glow effects */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-red-500/10 blur-[80px]" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-500/5 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-red-500/10 text-red-500 shadow-2xl shadow-red-500/20 ring-1 ring-red-500/50"
          >
            <ShieldX size={48} />
          </motion.div>

          <h2 className="mb-4 font-heading text-4xl font-bold text-white">Diagnostic Failure</h2>
          <p className="mb-10 max-w-lg text-lg text-slate-400">
            The security scan engine encountered an unexpected interruption. 
            <span className="block mt-2 font-medium text-red-400/80">{message}</span>
          </p>

          {/* Terminal-like error diagnostic log */}
          <div className="mb-10 w-full rounded-2xl bg-[#0a0c10] border border-white/5 p-6 text-left font-mono text-[10px] sm:text-xs relative group">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
              <div className="flex items-center gap-2 text-slate-600">
                <Terminal size={14} />
                <span className="font-bold tracking-widest uppercase">SYSTEM_DIAGNOSTIC_LOG</span>
              </div>
              <span className="text-[10px] text-slate-700">NODE_ID: SS-NODE-8812</span>
            </div>
            <div className="space-y-1 text-red-400/70">
              <p>[09:24:12] INITIALIZING GLOBAL_PROBE_SEQUENCE...</p>
              <p>[09:24:13] ERROR: Handshake sequence timed out at edge node US-EAST-1</p>
              <p>[09:24:13] STACK: SecureScanEngine.initiateProbe() failure at Layer 4</p>
              <p>[09:24:14] STATUS: 503 SERVICE_UNAVAILABLE (Target Host Unreachable)</p>
              <p className="text-white animate-pulse mt-2">_ Connection terminated. Logs stored locally.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full justify-center">
            <button
              onClick={onRetry}
              className="group relative flex items-center justify-center gap-3 rounded-2xl bg-red-600 px-8 py-4 font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-500 hover:scale-105 active:scale-95 flex-1 min-w-[200px]"
            >
              <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
              Retry Diagnostic
            </button>
            
            <button
              onClick={handleReport}
              className={`relative flex items-center justify-center gap-3 rounded-2xl border px-8 py-4 font-bold transition-all hover:scale-105 active:scale-95 flex-1 min-w-[200px] ${
                copied 
                  ? 'bg-green-500/10 border-green-500/50 text-green-500' 
                  : 'bg-blue-600/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
              }`}
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-3"
                  >
                    <Check size={20} />
                    Reported
                  </motion.div>
                ) : (
                  <motion.div
                    key="flag"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-3"
                  >
                    <Flag size={20} />
                    Report Issue
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <button
              onClick={onGoHome}
              className="flex items-center justify-center gap-3 rounded-2xl bg-slate-800 px-8 py-4 font-bold text-slate-300 transition-all hover:bg-slate-700 hover:text-white flex-1 min-w-[200px]"
            >
              <Home size={20} />
              Return Home
            </button>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 flex items-center justify-center gap-2 text-sm text-slate-500"
      >
        <Info size={16} />
        <p>
          Need human assistance? Our security analysts are standing by. <a href="#" className="text-blue-400 hover:underline">Open a ticket</a>.
        </p>
      </motion.div>
    </div>
  );
};

export default ErrorPage;
