
import React from 'react';
import { ShieldCheck, Calendar, Server, Clock } from 'lucide-react';
import { SSLInfo } from '../../types';

interface SSLCardProps {
  ssl: SSLInfo;
}

function SSLCard({ ssl }: SSLCardProps) {
  const issuerDisplay = typeof ssl.issuer === 'string' ? ssl.issuer : (ssl.issuer && typeof ssl.issuer === 'object') ? (ssl.issuer.commonName || ssl.issuer.organizationName || JSON.stringify(ssl.issuer)) : '';
  return (
    <div className="h-full rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md transition-all hover:bg-slate-900/60 hover:border-blue-500/30">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="text-blue-400" size={20} />
          SSL Certificate
        </h3>
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
          ssl.status === 'Secure' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
        }`}>
          {ssl.status}
        </span>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Server size={16} className="text-slate-500 mt-1" />
          <div>
            <p className="text-xs text-slate-500">Issuer</p>
            <p className="text-sm font-medium text-slate-200">{issuerDisplay}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Calendar size={16} className="text-slate-500 mt-1" />
          <div>
            <p className="text-xs text-slate-500">Expiry Date</p>
            <p className="text-sm font-medium text-slate-200">{ssl.expiryDate}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock size={16} className="text-slate-500 mt-1" />
          <div>
            <p className="text-xs text-slate-500">Validity</p>
            <p className="text-sm font-bold text-blue-400">{ssl.daysRemaining} days remaining</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SSLCard;
