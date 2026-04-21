
import React from 'react';
import { Globe2, HardDrive, History, CalendarDays } from 'lucide-react';
import { DomainInfo } from '../../../../securescan-ai/types';

interface DomainInfoCardProps {
  domain: DomainInfo;
}

function DomainInfoCard({ domain }: DomainInfoCardProps) {
  return (
    <div className="h-full rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md transition-all hover:bg-slate-900/60 hover:border-blue-500/30">
      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
        <Globe2 className="text-blue-400" size={20} />
        Domain Information
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-500">
            <HardDrive size={14} />
            <span className="text-xs uppercase tracking-wider font-semibold">IP Address</span>
          </div>
          <span className="text-sm font-medium text-slate-200">{domain.ipAddress}</span>
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-500">
            <HardDrive size={14} />
            <span className="text-xs uppercase tracking-wider font-semibold">Hosting</span>
          </div>
          <span className="text-sm font-medium text-slate-200">{domain.hostingServer}</span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-500">
            <History size={14} />
            <span className="text-xs uppercase tracking-wider font-semibold">Domain Age</span>
          </div>
          <span className="text-sm font-medium text-slate-200">{domain.domainAge}</span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-500">
            <CalendarDays size={14} />
            <span className="text-xs uppercase tracking-wider font-semibold">Expiry Date</span>
          </div>
          <span className="text-sm font-medium text-slate-200">{domain.expiryDate}</span>
        </div>
      </div>
    </div>
  );
};

export default DomainInfoCard;
