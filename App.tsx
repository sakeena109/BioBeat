
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatView from './components/ChatView';
import DashboardView from './components/DashboardView';
import ProfileView from './components/ProfileView';
import VoiceIntelligenceView from './components/VoiceIntelligenceView';
import { ViewMode } from './types';
import { Heart, Droplets, Save, Download, BarChart3, PieChart, Table } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('vitals');
  
  const [thresholds, setThresholds] = useState({
    hrMin: 60,
    hrMax: 100,
    hrIntensity: 'High',
    spo2Min: 95,
    spo2Intensity: 'High',
    tempMax: 38.0,
    tempIntensity: 'Medium'
  });

  const handleThresholdChange = (key: keyof typeof thresholds, value: any) => {
    setThresholds(prev => ({ ...prev, [key]: value }));
  };

  const IntensitySelector = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
    const levels = [
      { id: 'Low', color: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
      { id: 'Medium', color: 'bg-amber-500', shadow: 'shadow-amber-500/20' },
      { id: 'High', color: 'bg-rose-500', shadow: 'shadow-rose-500/20' }
    ];

    return (
      <div className="flex flex-col gap-2">
        <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest pl-1">Severity Weight</label>
        <div className="flex bg-zinc-950 p-1 rounded-2xl border border-zinc-800/80 w-fit relative z-20">
          {levels.map((level) => {
            const isSelected = value === level.id;
            return (
              <button
                key={level.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(level.id);
                }}
                className={`relative px-5 py-2.5 text-[11px] font-bold uppercase rounded-xl transition-all duration-300 min-w-[85px] flex items-center justify-center gap-2 cursor-pointer pointer-events-auto active:scale-95 ${
                  isSelected 
                    ? `${level.color} text-white shadow-lg ${level.shadow}`
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                }`}
              >
                {isSelected && <motion.div layoutId="activeDot" className="w-1.5 h-1.5 rounded-full bg-white" />}
                {level.id}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderView = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 10, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 1.01 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="h-full"
        >
          {(() => {
            switch (currentView) {
              case 'vitals': return <DashboardView />;
              case 'intelligence': return <ChatView />;
              case 'voice': return <VoiceIntelligenceView />;
              case 'profile': return <ProfileView />;
              case 'analytics': return (
                <div className="p-12 max-w-7xl mx-auto space-y-10">
                  <div className="flex items-center justify-between">
                      <div>
                          <h1 className="text-3xl font-bold text-white tracking-tight">BigQuery Health Analytics</h1>
                          <p className="text-zinc-500 text-sm mt-1">Deep longitudinal insights and population health benchmarking</p>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center gap-2"
                      >
                          <Download className="w-4 h-4" /> Export Dataset (CSV/JSON)
                      </motion.button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { icon: BarChart3, color: 'teal', label: 'Monthly Correlation', desc: 'Correlation between activity intensity and resting heart rate.', val: '0.84', sub: 'High Significance' },
                        { icon: PieChart, color: 'rose', label: 'Anomalies Distribution', desc: 'Vertex AI detected 14 events this quarter. 92% resolved.', val: '14', sub: 'Total Events' },
                        { icon: Table, color: 'blue', label: 'Peer Benchmarking', desc: 'Comparing your health markers against age-matched BigQuery datasets.', val: 'Top 15%', sub: 'Cardio Health' }
                      ].map((card, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          whileHover={{ y: -5, borderColor: 'rgba(20, 184, 166, 0.3)' }}
                          className="glass p-8 rounded-[32px] border border-zinc-800/50 space-y-4"
                        >
                            <div className={`w-12 h-12 bg-${card.color}-500/10 rounded-2xl flex items-center justify-center`}>
                                <card.icon className={`w-6 h-6 text-${card.color}-400`} />
                            </div>
                            <h3 className="text-lg font-bold text-white">{card.label}</h3>
                            <p className="text-xs text-zinc-500 leading-relaxed">{card.desc}</p>
                            <div className="pt-4">
                                <span className="text-2xl font-bold text-white">{card.val}</span>
                                <span className={`text-${card.color}-400 text-xs ml-2 font-bold uppercase`}>{card.sub}</span>
                            </div>
                        </motion.div>
                      ))}
                  </div>

                  <div className="glass rounded-[40px] border border-zinc-800/50 p-10">
                      <div className="flex items-center justify-between mb-8">
                          <h2 className="text-xl font-bold text-white">BigQuery Historical Logs</h2>
                      </div>
                      <div className="space-y-4">
                          {[
                              { date: 'Oct 24, 2023', type: 'Clinical Baseline', value: '72 BPM / 98% SpO2', status: 'Optimal' },
                              { date: 'Oct 20, 2023', type: 'Active recovery', value: '114 BPM avg / 45m', status: 'Goal Met' },
                              { date: 'Oct 15, 2023', type: 'Cardiac Anomaly', value: '98 BPM / Rest state', status: 'Vertex Alert' },
                          ].map((row, i) => (
                              <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + (i * 0.1) }}
                                className="flex items-center justify-between p-4 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 hover:bg-zinc-900/50 transition-all group"
                              >
                                  <div className="flex gap-6 items-center">
                                      <span className="text-xs font-bold text-zinc-600 w-24">{row.date}</span>
                                      <span className="text-sm font-bold text-zinc-300 group-hover:text-white">{row.type}</span>
                                  </div>
                                  <div className="flex gap-12 items-center">
                                      <span className="text-xs font-bold text-zinc-500 tabular-nums">{row.value}</span>
                                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                                          row.status.includes('Alert') ? 'bg-rose-500/10 text-rose-400' : 'bg-teal-500/10 text-teal-400'
                                      }`}>{row.status}</span>
                                  </div>
                              </motion.div>
                          ))}
                      </div>
                  </div>
                </div>
              );
              case 'settings': return (
                <div className="p-12 max-w-6xl space-y-10 mx-auto">
                  <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold mb-2 text-white tracking-tight">System Configuration</h1>
                  </div>
                  <div className="space-y-6">
                    <section className="glass rounded-[40px] border border-zinc-800/50 p-10 space-y-10">
                      <div className="flex items-center justify-between gap-12">
                        <div className="flex items-center gap-6 flex-1">
                          <Heart className="w-7 h-7 text-rose-500" />
                          <p className="text-lg font-bold text-zinc-100">Cardiovascular Range</p>
                        </div>
                        <IntensitySelector 
                          value={thresholds.hrIntensity} 
                          onChange={(val) => handleThresholdChange('hrIntensity', val)} 
                        />
                      </div>
                      <div className="flex items-center justify-between gap-12 border-t border-zinc-800/50 pt-10">
                        <div className="flex items-center gap-6 flex-1">
                          <Droplets className="w-7 h-7 text-teal-500" />
                          <p className="text-lg font-bold text-zinc-100">Oxygen Saturation</p>
                        </div>
                        <IntensitySelector 
                          value={thresholds.spo2Intensity} 
                          onChange={(val) => handleThresholdChange('spo2Intensity', val)} 
                        />
                      </div>
                    </section>
                  </div>
                  <div className="pt-10 flex justify-end">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => alert('Monitoring protocol updated.')}
                      className="px-10 py-5 bg-teal-500 text-white font-bold uppercase text-xs rounded-2xl shadow-xl shadow-teal-500/20"
                    >
                      <Save className="w-5 h-5 inline mr-2" /> Commit Changes
                    </motion.button>
                  </div>
                </div>
              );
              default: return <DashboardView />;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="flex h-screen w-full bg-[#050507] overflow-hidden">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
