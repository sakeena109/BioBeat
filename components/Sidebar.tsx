
import React from 'react';
import { Activity, BrainCircuit, Mic, LineChart, Settings, LogOut, Heart, UserCircle } from 'lucide-react';
import { ViewMode } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'vitals', icon: Activity, label: 'Live Vitals' },
    { id: 'intelligence', icon: BrainCircuit, label: 'Clinical Intelligence' },
    { id: 'voice', icon: Mic, label: 'Voice Consult' },
    { id: 'profile', icon: UserCircle, label: 'Patient Profile' },
    { id: 'analytics', icon: LineChart, label: 'Health Trends' },
    { id: 'settings', icon: Settings, label: 'Configuration' },
  ];

  return (
    <aside className="w-64 flex flex-col h-full bg-zinc-950 border-r border-zinc-900">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
          <Heart className="text-white w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-tight text-white tracking-tight">Bio<span className="text-teal-500">Beat</span></span>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Medical Intelligence Platform</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewMode)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
              currentView === item.id 
                ? 'bg-teal-500/10 text-teal-400' 
                : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'
            }`}
          >
            <item.icon className={`w-5 h-5 ${currentView === item.id ? 'text-teal-400' : 'group-hover:text-zinc-400'}`} />
            <span className="font-semibold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6">
        <div 
          onClick={() => setView('profile')}
          className={`bg-zinc-900/30 rounded-2xl p-4 border border-zinc-800/50 cursor-pointer transition-all hover:border-teal-500/50 ${currentView === 'profile' ? 'border-teal-500/50 bg-teal-500/5' : ''}`}
        >
          <p className="text-[10px] text-zinc-500 font-bold uppercase mb-2">Active Session</p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-teal-500">JD</div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-200 truncate">John Doe</p>
                <p className="text-[10px] text-zinc-500">Patient ID 422</p>
            </div>
            <button className="text-zinc-600 hover:text-rose-500 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
