
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ShieldCheck, AlertTriangle, ShieldAlert, Activity, Lock, FileCode, Globe } from 'lucide-react';
import { RiskLevel } from '../../types';

interface SecurityScoreProps {
  score: number;
  risk: RiskLevel;
}

function SecurityScore({ score, risk }: SecurityScoreProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const data = [
    { value: score },
    { value: 100 - score },
  ];

  const getColor = (s: number) => {
    if (s >= 80) return '#22c55e'; // Green
    if (s >= 50) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  const color = getColor(score);

  const methodologyData = [
    { range: '80 - 100', label: 'Excellent', color: 'text-green-500', icon: ShieldCheck, desc: 'Robust protection. Minimal risk detected.' },
    { range: '50 - 79', label: 'Warning', color: 'text-yellow-500', icon: AlertTriangle, desc: 'Misconfigurations or missing headers.' },
    { range: '0 - 49', label: 'Critical', color: 'text-red-500', icon: ShieldAlert, desc: 'Severe vulnerabilities or insecure protocols.' }
  ];

  const weightedFactors = [
    { label: 'SSL/TLS Handshake', weight: 30, icon: Lock, color: 'bg-blue-500' },
    { label: 'Security Headers', weight: 30, icon: FileCode, color: 'bg-cyan-500' },
    { label: 'Port Exposure', weight: 20, icon: Activity, color: 'bg-indigo-500' },
    { label: 'Domain Reputation', weight: 20, icon: Globe, color: 'bg-purple-500' },
  ];

  return (
    <div className="flex flex-col items-center justify-center relative w-full min-w-0">
      <div 
        className="w-full h-48 sm:h-64 relative cursor-help group min-w-0 min-h-0"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="75%"
              outerRadius="90%"
              paddingAngle={0}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              <Cell key="score" fill={color} />
              <Cell key="background" fill="rgba(255,255,255,0.05)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Central Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl font-bold font-heading text-white"
          >
            {score}
          </motion.span>
          <div className="flex items-center gap-1.5 text-slate-400 text-sm font-medium mt-1 group-hover:text-blue-400 transition-colors">
            <span>Security Score</span>
            <Info size={14} className="opacity-50" />
          </div>
        </div>

        {/* Scoring Methodology Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="absolute z-50 left-1/2 -translate-x-1/2 top-full mt-4 w-85 rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl pointer-events-none overflow-hidden"
            >
              {/* Decorative background glow */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[60px] pointer-events-none" />
              
              <div className="relative z-10">
                <div className="mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-2">Scoring Engine V3.1</h4>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Our proprietary algorithm evaluates infrastructure health by correlating real-time telemetry from multiple security vectors.
                  </p>
                </div>

                <div className="space-y-4 border-t border-white/5 pt-4">
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Weighted Analysis</h5>
                    <div className="space-y-3">
                      {weightedFactors.map((f) => (
                        <div key={f.label} className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <div className="flex items-center gap-2 text-slate-300">
                              <f.icon size={12} className="text-slate-500" />
                              {f.label}
                            </div>
                            <span className="text-slate-500 font-mono">{f.weight}%</span>
                          </div>
                          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${f.weight}%` }}
                              className={`h-full ${f.color}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4">
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Threat Thresholds</h5>
                    <div className="space-y-3">
                      {methodologyData.map((item) => (
                        <div key={item.range} className="flex gap-3 items-start">
                          <div className={`mt-0.5 p-1 rounded-md bg-white/5 ${item.color}`}>
                            <item.icon size={12} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-white">{item.label}</span>
                              <span className={`text-[10px] font-mono font-bold ${item.color}`}>{item.range}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tooltip Arrow */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-l border-t border-white/10 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center gap-3 px-4 py-1 rounded-full bg-slate-900 border border-white/5">
        <span className="text-slate-400 text-sm">Risk Assessment:</span>
        <span className={`font-bold ${
          risk === RiskLevel.LOW ? 'text-green-500' : 
          risk === RiskLevel.MEDIUM ? 'text-yellow-500' : 'text-red-500'
        }`}>
          {risk}
        </span>
      </div>
    </div>
  );
};

export default SecurityScore;
