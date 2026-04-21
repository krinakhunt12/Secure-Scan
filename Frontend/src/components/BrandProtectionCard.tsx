
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Fingerprint, ChevronRight } from 'lucide-react';

interface BrandProtectionCardProps {
  lookalikes: Array<{
    domain: string;
    ips: string[];
    risk_level: 'High' | 'Medium';
  }>;
}

const BrandProtectionCard: React.FC<BrandProtectionCardProps> = ({ lookalikes }) => {
  if (!lookalikes || lookalikes.length === 0) {
    return (
      <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Fingerprint size={20} />
          </div>
          <h3 className="text-lg font-bold text-white font-heading">Brand Protection</h3>
        </div>
        <p className="text-sm text-slate-500 italic">No active lookalike domains detected in this sweep. Your digital brand presence appears secure.</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-md h-full relative overflow-hidden">
      {/* Background Warning Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 blur-[60px] rounded-full pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
            <ShieldAlert size={20} />
          </div>
          <h3 className="text-lg font-bold text-white font-heading">Brand Spoofing Detected</h3>
        </div>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold uppercase border border-red-500/30 animate-pulse">
            <AlertTriangle size={12} /> High Alert
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-6 leading-relaxed relative z-10">
        The following domains are registered and currently resolve. Using visually similar names is a common tactic for phishing agricultural enterprises.
      </p>

      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative z-10">
        {lookalikes.map((look, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`p-4 rounded-2xl border ${
              look.risk_level === 'High' 
                ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' 
                : 'bg-orange-500/5 border-orange-500/20 hover:border-orange-500/40'
            } transition-all group`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${look.risk_level === 'High' ? 'text-red-400' : 'text-orange-400'}`}>
                    {look.domain}
                  </span>
                  <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    look.risk_level === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {look.risk_level} Risk
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1 opacity-70">
                  Target IP: {look.ips[0]}
                </div>
              </div>
              <a 
                href={`https://${look.domain}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight size={16} />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 relative z-10">
        <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Recommended Defense</h4>
        <ul className="text-[10px] text-slate-400 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-red-400 mt-0.5">•</span>
            Report these domains to agricultural anti-phishing bodies.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-400 mt-0.5">•</span>
            Monitor for MX records to detect mail-impersonation.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-400 mt-0.5">•</span>
            Alert your farm cooperative members of these exact domains.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BrandProtectionCard;
