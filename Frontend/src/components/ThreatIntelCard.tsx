
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, AlertTriangle, Zap, Info, ShieldAlert, X, ShieldCheck, ChevronRight, ChevronDown, ExternalLink, Sparkles } from 'lucide-react';
import { ThreatAlert } from '../../types';

interface ThreatIntelCardProps {
  threats?: ThreatAlert[];
  domain?: string;
}

function ThreatIntelCard({ threats, domain }: ThreatIntelCardProps) {
  const [selectedThreat, setSelectedThreat] = useState<ThreatAlert | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [localThreats, setLocalThreats] = useState<ThreatAlert[]>(threats || []);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    // If parent passed threats, use them; otherwise fetch from backend with domain
    if (threats && threats.length) {
      setLocalThreats(threats);
      return;
    }

    // Fetch threats for the specific domain if provided
    if (!domain) return;

    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { fetchThreats } = await import('../services/backendService');
        const data = await fetchThreats(domain);
        if (mounted && data && data.threats) setLocalThreats(data.threats);
      } catch (e) {
        // noop - keep empty list
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false };
  }, [threats, domain]);

  const getSeverityStyles = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-red-500 border-red-500/50';
      case 'high':
        return 'text-orange-500 border-orange-500/50';
      case 'medium':
        return 'text-yellow-500 border-yellow-500/50';
      default:
        return 'text-blue-500 border-blue-500/50';
    }
  };

  const getPulseAnimation = (severity: string) => {
    const s = severity.toLowerCase();
    const themes = {
      critical: {
        glow: 'rgba(239, 68, 68, 0.6)',
        bgLow: 'rgba(239, 68, 68, 0.15)',
        bgHigh: 'rgba(239, 68, 68, 0.4)',
        duration: 1.5
      },
      high: {
        glow: 'rgba(249, 115, 22, 0.5)',
        bgLow: 'rgba(249, 115, 22, 0.15)',
        bgHigh: 'rgba(249, 115, 22, 0.4)',
        duration: 2
      },
      medium: {
        glow: 'rgba(234, 179, 8, 0.4)',
        bgLow: 'rgba(234, 179, 8, 0.15)',
        bgHigh: 'rgba(234, 179, 8, 0.35)',
        duration: 2.5
      },
      info: {
        glow: 'rgba(59, 130, 246, 0.4)',
        bgLow: 'rgba(59, 130, 246, 0.15)',
        bgHigh: 'rgba(59, 130, 246, 0.35)',
        duration: 3
      }
    };
    const theme = themes[s as keyof typeof themes] || themes.info;
    return {
      boxShadow: [
        `0 0 0px ${theme.glow}`,
        `0 0 14px ${theme.glow}`,
        `0 0 0px ${theme.glow}`
      ],
      backgroundColor: [
        theme.bgLow,
        theme.bgHigh,
        theme.bgLow
      ],
      transition: {
        duration: theme.duration,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    };
  };

  const getIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return <ShieldAlert size={14} />;
      case 'high': return <AlertTriangle size={14} />;
      case 'medium': return <Zap size={14} />;
      default: return <Info size={14} />;
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <>
      <div className="h-full rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md transition-all hover:bg-slate-900/60 hover:border-blue-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Radio className="text-red-500 animate-pulse" size={20} />
            Threat Intelligence Feed
          </h3>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Active Scan Nodes</span>
        </div>
        
        {domain && (
          <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
            <Sparkles size={12} className="text-blue-400" />
            <span>Analysis based on <span className="text-blue-400 font-semibold">{domain}</span> security scan</span>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="p-4 text-sm text-slate-400">Loading threat feed…</div>
          ) : (
            localThreats.map((threat, idx) => (
            <motion.div
              key={threat.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`group relative overflow-hidden rounded-xl border transition-all ${
                  expandedId === threat.id 
                    ? 'border-blue-500/40 bg-blue-500/5' 
                    : 'border-white/5 bg-white/2 hover:bg-white/5'
                }`}
            >
              <div 
                className="p-4 cursor-pointer"
                onClick={() => toggleExpand(threat.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <motion.div 
                    animate={getPulseAnimation(threat.severity)}
                    className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getSeverityStyles(threat.severity)}`}
                  >
                    {getIcon(threat.severity)}
                    {threat.severity}
                  </motion.div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-slate-600">{threat.source}</span>
                    <motion.div
                      animate={{ rotate: expandedId === threat.id ? 180 : 0 }}
                      className="text-slate-500 group-hover:text-slate-300"
                    >
                      <ChevronDown size={14} />
                    </motion.div>
                  </div>
                </div>
                
                <h4 className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors pr-6">
                  {threat.title}
                </h4>
                
                <AnimatePresence>
                  {expandedId === threat.id ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                        {threat.description}
                      </p>
                      
                      <div className="mt-4 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheck size={12} className="text-green-500" />
                          <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Recommended Action</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed italic">
                          {threat.remediation || "Analyze technical logs and apply standard security patches."}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between pt-2">
                        <span className="text-[9px] font-mono text-slate-600">INCIDENT_ID: {threat.id}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedThreat(threat);
                          }}
                          className="flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors"
                        >
                          DEEP ANALYSIS <ExternalLink size={10} />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-slate-500 truncate max-w-50">
                        {threat.description}
                      </p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedThreat(threat);
                        }}
                        className="text-[10px] font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1 group/btn transition-colors"
                      >
                        DETAILS <ChevronRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
            ))
          )}
        </div>

        {localThreats.length > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-blue-400" />
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">AI Security Recommendations</span>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                {(() => {
                  const criticalCount = localThreats.filter(t => t.severity === 'Critical').length;
                  const highCount = localThreats.filter(t => t.severity === 'High').length;
                  const mediumCount = localThreats.filter(t => t.severity === 'Medium').length;
                  
                  if (criticalCount > 0) {
                    return `⚠️ ${criticalCount} critical vulnerability${criticalCount > 1 ? 'ies' : ''} found. ${domain || 'This domain'} requires immediate security hardening. Focus on SSL/TLS configurations and security headers first.`;
                  } else if (highCount > 0) {
                    return `⚡ ${highCount} high-priority issue${highCount > 1 ? 's' : ''} detected. ${domain || 'This domain'} needs security improvements. Address email authentication and exposed services.`;
                  } else if (mediumCount > 0) {
                    return `ℹ️ ${mediumCount} medium-severity finding${mediumCount > 1 ? 's' : ''} identified. ${domain || 'This domain'} has room for security enhancements. Consider implementing DNSSEC and improving cookie security.`;
                  } else {
                    return `✅ ${domain || 'This domain'} demonstrates strong security fundamentals. Continue regular monitoring and stay updated with security patches.`;
                  }
                })()}
              </p>
              
              {localThreats.filter(t => t.severity === 'Critical' || t.severity === 'High').length > 0 && (
                <div className="pt-2 border-t border-blue-500/10">
                  <p className="text-[10px] text-blue-300/80 font-semibold">
                    Priority Actions:
                  </p>
                  <ul className="mt-1 space-y-1 text-[10px] text-slate-400">
                    {localThreats
                      .filter(t => t.severity === 'Critical' || t.severity === 'High')
                      .slice(0, 3)
                      .map((t, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-blue-400 mt-0.5">•</span>
                          <span>{t.title}</span>
                        </li>
                      ))
                    }
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
        
        <button className="mt-4 w-full rounded-xl bg-white/5 border border-white/10 py-2.5 text-xs font-bold text-slate-400 transition-all hover:bg-white/10 hover:text-white">
          Access Vulnerability Database
        </button>
      </div>

      <AnimatePresence>
        {selectedThreat && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedThreat(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl overflow-hidden"
            >
              {/* Decorative background glow */}
              <div className={`absolute -top-24 -right-24 w-64 h-64 blur-[80px] opacity-20 rounded-full ${
                selectedThreat.severity === 'Critical' ? 'bg-red-500' : 
                selectedThreat.severity === 'High' ? 'bg-orange-500' : 'bg-blue-500'
              }`} />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getSeverityStyles(selectedThreat.severity)}`}>
                    {getIcon(selectedThreat.severity)}
                    {selectedThreat.severity} Severity
                  </div>
                  <button 
                    onClick={() => setSelectedThreat(null)}
                    aria-label="Close threat details"
                    title="Close"
                    className="p-2 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                  {selectedThreat.title}
                </h2>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-6">
                  <span>Audit Source: {selectedThreat.source}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-700" />
                  <span>UUID: {selectedThreat.id}</span>
                </div>

                <div className="space-y-6">
                  <section>
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Info size={14} /> Security Impact
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {selectedThreat.description}
                    </p>
                  </section>

                  <section className="p-5 rounded-2xl bg-white/3 border border-white/5">
                    <h4 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <ShieldCheck size={14} /> Remediation Roadmap
                    </h4>
                    <div className="prose prose-invert prose-sm">
                      <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-800/50 p-4 rounded-xl border border-white/5 font-mono text-[11px]">
                        {selectedThreat.remediation || "Initiate incident response protocols. Standard security patching and infrastructure review recommended."}
                      </p>
                    </div>
                  </section>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <button 
                    onClick={() => setSelectedThreat(null)}
                    className="py-4 rounded-2xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-all"
                  >
                    SAVE TO ARCHIVE
                  </button>
                  <button 
                    onClick={() => setSelectedThreat(null)}
                    className="py-4 rounded-2xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                  >
                    RESOLVE ISSUE
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ThreatIntelCard;
