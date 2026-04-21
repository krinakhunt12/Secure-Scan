
import React from 'react';
import { FileCode, CheckCircle2, XCircle } from 'lucide-react';
import { SecurityHeader } from '../../../securescan-ai/types';

interface HeadersCardProps {
  headers: SecurityHeader[];
}

function HeadersCard({ headers }: HeadersCardProps) {
  return (
    <div className="h-full rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md transition-all hover:bg-slate-900/60 hover:border-blue-500/30">
      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
        <FileCode className="text-blue-400" size={20} />
        Security Headers
      </h3>
      
      <div className="space-y-3">
        {headers.map((header, idx) => (
          <div key={idx} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-300">{header.name}</span>
              {header.value && (
                <span className="text-[10px] text-slate-500 truncate max-w-[150px]">{header.value}</span>
              )}
            </div>
            {header.present ? (
              <CheckCircle2 size={18} className="text-green-500" />
            ) : (
              <XCircle size={18} className="text-red-500" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeadersCard;
