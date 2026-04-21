
import React from 'react';
import { Cpu, Power, PowerOff } from 'lucide-react';
import { PortStatus } from '../../types';

interface PortScanCardProps {
  ports: PortStatus[];
}

function PortScanCard({ ports }: PortScanCardProps) {
  return (
    <div className="h-full rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md transition-all hover:bg-slate-900/60 hover:border-blue-500/30">
      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
        <Cpu className="text-blue-400" size={20} />
        Open Ports
      </h3>
      
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ports.map((port, idx) => (
          <div key={idx} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/40 border border-white/5">
            <span className="text-lg font-bold text-white">{port.port}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-tighter mb-2">{port.service}</span>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              port.status === 'Open' ? 'bg-green-500/10 text-green-500' : 'bg-slate-700/50 text-slate-400'
            }`}>
              {port.status === 'Open' ? <Power size={8} /> : <PowerOff size={8} />}
              {port.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortScanCard;
