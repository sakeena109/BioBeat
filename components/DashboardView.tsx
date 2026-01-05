
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Heart, Thermometer, Droplets, ShieldCheck, AlertTriangle, ChevronRight, Activity, Zap, BrainCircuit } from 'lucide-react';
import { generateVitalHistory } from '../services/geminiService';
import { ChartData, ActivityData } from '../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

const DashboardView: React.FC = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activity] = useState<ActivityData>({
    steps: 8432,
    calories: 1240,
    activeMinutes: 42
  });

  useEffect(() => {
    const load = async () => {
      const res = await generateVitalHistory();
      setData(res);
      setIsLoading(false);
    };
    load();
  }, []);

  const currentVitals = [
    { label: 'Heart Rate', value: '74', unit: 'BPM', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10', status: 'Stable' },
    { label: 'Blood Oxygen', value: '98', unit: '%', icon: Droplets, color: 'text-teal-500', bg: 'bg-teal-500/10', status: 'Optimal' },
    { label: 'Body Temp', value: '36.8', unit: '°C', icon: Thermometer, color: 'text-orange-500', bg: 'bg-orange-500/10', status: 'Normal' },
  ];

  if (isLoading) return (
    <div className="flex-1 h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <motion.div 
              animate={{ width: ["0%", "100%", "0%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="h-1 bg-teal-500 rounded-full w-48" 
            />
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">BioBeat Engine Initializing...</p>
        </div>
    </div>
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-8 space-y-8 max-w-[1600px] mx-auto"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">BioBeat Intelligence Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1 flex items-center gap-2">
            Continuous monitoring via <span className="text-teal-400 font-bold uppercase text-[10px]">Google Cloud</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full"
            >
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" 
                />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Vertex AI Active</span>
            </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentVitals.map((vital, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5, transition: { duration: 0.2 } }}
            className="glass p-6 rounded-3xl border border-zinc-800/50 relative overflow-hidden group cursor-default"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <vital.icon className="w-20 h-20" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <motion.div 
                animate={vital.label === 'Heart Rate' ? { scale: [1, 1.15, 1] } : {}}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className={`p-3 ${vital.bg} rounded-2xl`}
              >
                <vital.icon className={`w-5 h-5 ${vital.color}`} />
              </motion.div>
              <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">{vital.status}</span>
            </div>
            <p className="text-zinc-400 text-xs font-semibold mb-1 uppercase tracking-wider">{vital.label}</p>
            <div className="flex items-baseline gap-1">
              <p className="text-4xl font-bold text-white tabular-nums tracking-tight">{vital.value}</p>
              <p className="text-zinc-500 font-bold text-xs uppercase">{vital.unit}</p>
            </div>
          </motion.div>
        ))}

        <motion.div 
          variants={itemVariants} 
          whileHover={{ scale: 1.02 }}
          className="glass p-6 rounded-3xl border border-blue-500/10 bg-blue-500/[0.02] flex flex-col justify-between"
        >
            <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-500/10 rounded-2xl">
                    <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Google Fit API</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Steps</p>
                    <p className="text-xl font-bold text-white tabular-nums">{activity.steps.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Calories</p>
                    <p className="text-xl font-bold text-white tabular-nums">{activity.calories}</p>
                </div>
            </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <motion.div variants={itemVariants} className="lg:col-span-8 glass p-8 rounded-3xl border border-zinc-800/50">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-white">Forecasting Analysis</h2>
            <div className="flex gap-4">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-zinc-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Heart Rate
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-zinc-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" /> SpO2
                </span>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorBpm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#18181b" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#52525b', fontSize: 10}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#52525b', fontSize: 10}} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="bpm" stroke="#f43f5e" strokeWidth={3} fill="url(#colorBpm)" animationDuration={1500} />
                <Area type="monotone" dataKey="spo2" stroke="#14b8a6" strokeWidth={3} fill="transparent" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-4 glass p-8 rounded-3xl border border-zinc-800/50 flex flex-col h-full">
            <h2 className="text-lg font-bold text-white mb-8">Vertex AI Insights</h2>
            <div className="space-y-6 flex-1">
                {[
                    { icon: AlertTriangle, color: 'orange', title: 'Cardiac Drift', desc: '12% drift detected vs historical baseline.' },
                    { icon: ShieldCheck, color: 'teal', title: 'Stability Confirmed', desc: 'Vitals optimal during sleep cycle.' }
                ].map((alert, i) => (
                    <motion.div 
                        key={i}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + (i * 0.1) }}
                        className={`p-4 bg-${alert.color}-500/5 border border-${alert.color}-500/20 rounded-2xl`}
                    >
                        <div className="flex gap-3">
                            <alert.icon className={`w-5 h-5 text-${alert.color}-500 shrink-0`} />
                            <div>
                                <p className={`text-sm font-bold text-${alert.color}-400`}>{alert.title}</p>
                                <p className="text-xs text-zinc-500 mt-1">{alert.desc}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-8 w-full py-4 bg-teal-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl shadow-lg shadow-teal-500/10"
            >
              Full Analytics Report <ChevronRight className="w-4 h-4 inline" />
            </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardView;
