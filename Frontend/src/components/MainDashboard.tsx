
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Search, 
  TrendingUp, 
  BarChart3,
  ArrowRight,
  History as HistoryIcon,
  Globe
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { HistoryItem, RiskLevel } from '../../types';

interface MainDashboardProps {
  history: HistoryItem[];
  onStartNewScan: () => void;
}

function MainDashboard({ history, onStartNewScan }: MainDashboardProps) {
  const stats = useMemo(() => {
    const total = history.length;
    const avg = total > 0 ? Number((history.reduce((acc, h) => acc + h.score, 0) / total).toFixed(1)) : 0;
    const highRisks = history.filter(h => h.riskLevel === RiskLevel.HIGH).length;
    
    return { total, avg, highRisks };
  }, [history]);

  // Transform history for chart (last 7 scans) - sort by date and provide fullUrl + date for tooltip
  const chartData = useMemo(() => {
    const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const last7 = sorted.slice(-7);
    return last7.map(h => {
      // derive a short label using registered domain (SLD + TLD)
      const raw = (h.url || '').replace(/https?:\/\//, '').replace(/\/$/, '');
      const parts = raw.split('.');
      const sld = parts.length >= 2 ? parts.slice(-2).join('.') : raw;
      const label = sld.length > 12 ? `${sld.substring(0, 12)}…` : sld;
      return {
        name: label,
        score: h.score,
        risk: h.riskLevel,
        age: h.domainAgeYears || 0,
        fullUrl: h.url,
        date: h.date
      };
    });
  }, [history]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload || {};
      return (
        <div className="bg-slate-900 border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-white font-bold text-xs mb-1">{entry.fullUrl || payload[0].name}</p>
          {entry.date && <p className="text-xs text-slate-400 mb-2">{new Date(entry.date).toLocaleString()}</p>}
          {payload.map((p: any, idx: number) => (
            <p key={idx} className="font-bold text-sm" style={{ color: p.color }}>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white">Security Command Center</h1>
          <p className="text-slate-400 mt-1">Overview of your infrastructure's health and recent diagnostics.</p>
        </div>
        <button 
          onClick={onStartNewScan}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 hover:scale-105"
        >
          <Search size={20} />
          New Vulnerability Scan
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Scans', value: stats.total, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Avg. Security Score', value: stats.avg, icon: ShieldCheck, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'High Risks Found', value: stats.highRisks, icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-400/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <TrendingUp size={16} className="text-slate-500" />
            </div>
            <div className="text-3xl font-bold text-white font-heading">{stat.value}</div>
            <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Security Score Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="text-blue-400" size={20} />
              Security Score Analysis
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Vulnerability index</span>
            </div>
          </div>
          
          <div className="h-75 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  domain={[0, 100]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={40} name="Score">
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.score >= 80 ? '#22c55e' : entry.score >= 50 ? '#3b82f6' : '#ef4444'} 
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* NEW: Infrastructure Longevity Chart (Domain Age) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-3xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="text-cyan-400" size={20} />
              Domain Longevity (Years)
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyan-500"></div> Domain Age</span>
            </div>
          </div>
          
          <div className="h-75 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="age" 
                  stroke="#22d3ee" 
                  fillOpacity={1} 
                  fill="url(#colorAge)" 
                  name="Age (Years)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Quick Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-3 rounded-3xl border border-white/10 bg-slate-900/40 p-8 backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Infrastructure Intelligence</h3>
            <span className="text-xs text-slate-500">3 priority items detected</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative pl-6 border-l-2 border-blue-500/30">
              <div className="absolute -left-1.25 top-0 w-2 h-2 rounded-full bg-blue-500"></div>
              <p className="text-sm font-bold text-blue-400">Security Recommendation</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                3 domains are currently running with outdated SSL configurations. Update certificates to avoid browser warnings.
              </p>
            </div>
            <div className="relative pl-6 border-l-2 border-green-500/30">
              <div className="absolute -left-1.25 top-0 w-2 h-2 rounded-full bg-green-500"></div>
              <p className="text-sm font-bold text-green-400">Compliance Boost</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Overall score increased by 12% this week after implementing HSTS on core domains.
              </p>
            </div>
            <div className="relative pl-6 border-l-2 border-yellow-500/30">
              <div className="absolute -left-1.25 top-0 w-2 h-2 rounded-full bg-yellow-500"></div>
              <p className="text-sm font-bold text-yellow-500">Configuration Alert</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Port 22 (SSH) was detected as open on some historical scans. Ensure robust IP white-listing is active.
              </p>
            </div>
          </div>
          
          <button className="mt-8 flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold group hover:bg-white/10 transition-all w-full md:w-auto md:min-w-60">
            Generate Full Compliance Audit
            <ArrowRight size={16} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default MainDashboard;
