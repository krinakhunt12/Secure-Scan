
import React from 'react';
import { motion } from 'framer-motion';
import { Globe, AlertCircle, ShieldAlert, Cpu } from 'lucide-react';

interface SubdomainCardProps {
  subdomains: Array<{
    subdomain: string;
    ips: string[];
    is_likely_dev: boolean;
    is_likely_admin: boolean;
  }>;
}

const SubdomainCard: React.FC<SubdomainCardProps> = ({ subdomains }) => {
  if (!subdomains || subdomains.length === 0) {
    return (
      <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Globe size={20} />
          </div>
          <h3 className="text-lg font-bold text-white font-heading">Subdomain Discovery</h3>
        </div>
        <p className="text-sm text-slate-500 italic">No common public subdomains detected in this quick scan.</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-md h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Globe size={20} />
          </div>
          <h3 className="text-lg font-bold text-white font-heading">Subdomain Discovery</h3>
        </div>
        <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
          {subdomains.length} Found
        </div>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {subdomains.map((sub, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors uppercase tracking-tight truncate max-w-[200px]">
                  {sub.subdomain}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-1">
                  {sub.ips.join(', ')}
                </span>
              </div>
              <div className="flex gap-1.5">
                {sub.is_likely_admin && (
                  <div className="p-1 px-2 rounded bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                    <ShieldAlert size={10} />
                    <span className="text-[8px] font-bold uppercase">Admin</span>
                  </div>
                )}
                {sub.is_likely_dev && (
                  <div className="p-1 px-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                    <Cpu size={10} />
                    <span className="text-[8px] font-bold uppercase">Dev</span>
                  </div>
                )}
                {!sub.is_likely_admin && !sub.is_likely_dev && (
                  <div className="p-1 px-2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                    <AlertCircle size={10} />
                    <span className="text-[8px] font-bold uppercase">Public</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
        <p className="text-[10px] text-slate-400 leading-relaxed">
          <span className="text-blue-400 font-bold uppercase">Security Note:</span> Discovered subdomains often host staging environments or internal tools that may have weaker security policies than the main production asset.
        </p>
      </div>
    </div>
  );
};

export default SubdomainCard;
