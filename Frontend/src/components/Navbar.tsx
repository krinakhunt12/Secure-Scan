
import React from 'react';
import { Shield, LayoutDashboard, History, Settings, Home } from 'lucide-react';
import { View } from '../../types';

interface NavbarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

function Navbar({ currentView, onNavigate }: NavbarProps) {
  const navItems = [
    { id: View.LANDING, label: 'Home', icon: Home },
    { id: View.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: View.HISTORY, label: 'History', icon: History },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => onNavigate(View.LANDING)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/50 transition-all group-hover:bg-blue-600/30 group-hover:scale-105">
            <Shield size={24} />
          </div>
          <span className="font-heading text-xl font-bold tracking-tight text-white">
            SecureScan <span className="text-blue-500">AI</span>
          </span>
        </div>
        
        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-2 text-sm font-semibold transition-all hover:text-blue-400 py-2 px-3 rounded-lg hover:bg-white/5 ${
                currentView === item.id ? 'text-blue-400 bg-blue-500/5' : 'text-slate-400'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        <button 
          onClick={() => onNavigate(View.LANDING)}
          className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 hover:scale-105 active:scale-95"
        >
          New Scan
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
