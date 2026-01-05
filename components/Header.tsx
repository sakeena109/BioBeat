
import React from 'react';
import { Bell, ShieldCheck, Activity, ChevronDown, Database, Cloud, Search } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="h-20 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900 flex items-center justify-between px-10 sticky top-0 z-10">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse" />
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.15em]">System <span className="text-emerald-500">Live</span></span>
        </div>
        <div className="h-6 w-[1px] bg-zinc-800" />
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-zinc-500">
                <Database className="w-3.5 h-3.5 text-orange-500/70" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Firebase Sync</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
                <Cloud className="w-3.5 h-3.5 text-blue-500/70" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Google Cloud Platform</span>
            </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl focus-within:border-teal-500/50 transition-all">
            <Search className="w-3.5 h-3.5 text-zinc-500" />
            <input 
                type="text" 
                placeholder="Search health records..." 
                className="bg-transparent border-none focus:ring-0 text-xs text-zinc-200 placeholder:text-zinc-600 w-48"
            />
        </div>

        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">HIPAA SECURE</span>
        </div>

        <button className="relative p-2.5 text-zinc-500 hover:text-white transition-colors group">
          <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-4 ring-zinc-950" />
        </button>

        <button className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-2xl border border-zinc-800 hover:bg-zinc-900 transition-all group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-teal-500/10">JD</div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-[10px] font-black text-zinc-300 group-hover:text-white">John Doe</span>
            <span className="text-[9px] font-bold text-zinc-600 uppercase mt-0.5">Patient ID 422</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-600" />
        </button>
      </div>
    </header>
  );
};

export default Header;
