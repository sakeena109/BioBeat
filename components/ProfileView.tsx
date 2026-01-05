
import React from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, MapPin, Fingerprint, Activity, ShieldAlert, Pill, FileText, ChevronRight, Dna } from 'lucide-react';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, 
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
  })
};

const ProfileView: React.FC = () => {
  const patientData = {
    name: "John Doe",
    age: 42,
    sex: "Male",
    bloodType: "A+",
    weight: "78 kg",
    height: "182 cm",
    id: "PT-422-X9",
    dob: "August 12, 1982",
    email: "j.doe@medical-cloud.org",
    phone: "+1 (555) 012-3456",
    address: "742 Medical Way, Palo Alto, CA",
    conditions: ["Hypertension (Managed)", "Seasonal Allergies"],
    medications: [
      { name: "Lisinopril", dosage: "10mg", freq: "Once Daily" },
      { name: "Loratadine", dosage: "10mg", freq: "As Needed" }
    ],
    emergencyContact: {
      name: "Jane Doe",
      relation: "Spouse",
      phone: "+1 (555) 012-3457"
    }
  };

  return (
    <div className="p-12 max-w-7xl mx-auto space-y-10">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-8">
          <motion.div 
            whileHover={{ rotate: [0, -5, 5, 0] }}
            className="relative"
          >
            <div className="w-32 h-32 rounded-[40px] bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-4xl font-bold text-white shadow-2xl shadow-teal-500/20">
              JD
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center">
              <Fingerprint className="w-5 h-5 text-teal-500" />
            </div>
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">{patientData.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="px-3 py-1 bg-teal-500/10 text-teal-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-teal-500/20">Live Sync Active</span>
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">UID: {patientData.id}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <motion.button whileHover={{ y: -2 }} className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs font-bold text-zinc-300">
            <FileText className="w-4 h-4 inline mr-2" /> Records
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} className="px-6 py-3 bg-teal-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-teal-500/10">
            Edit
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible" className="lg:col-span-1 space-y-8">
          <section className="glass p-8 rounded-[40px] border border-zinc-800/50 space-y-6">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <User className="w-3 h-3" /> Biometric Data
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {['Age', 'Sex', 'Blood Type', 'Weight'].map((label, i) => (
                <div key={i}>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase mb-1">{label}</p>
                  <p className="text-lg font-bold text-white">
                    {label === 'Age' ? patientData.age : label === 'Sex' ? patientData.sex : label === 'Blood Type' ? patientData.bloodType : patientData.weight}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="glass p-8 rounded-[40px] border border-zinc-800/50 space-y-6">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Mail className="w-3 h-3" /> Contact Details
            </h2>
            <div className="space-y-4">
              {[Phone, Mail, MapPin].map((Icon, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="p-2 bg-zinc-900 rounded-xl"><Icon className="w-4 h-4 text-zinc-500" /></div>
                  <p className="text-xs font-bold text-zinc-300">
                    {i === 0 ? patientData.phone : i === 1 ? patientData.email : 'Palo Alto, CA'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </motion.div>

        <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible" className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="glass p-8 rounded-[40px] border border-zinc-800/50 space-y-6">
              <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Active Conditions</h2>
              <div className="space-y-3">
                {patientData.conditions.map((c, i) => (
                  <div key={i} className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 text-sm font-bold text-zinc-200">
                    {c}
                  </div>
                ))}
              </div>
            </section>
            <section className="glass p-8 rounded-[40px] border border-zinc-800/50 space-y-6">
              <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Medications</h2>
              <div className="space-y-3">
                {patientData.medications.map((m, i) => (
                  <div key={i} className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 flex justify-between items-center">
                    <span className="text-sm font-bold text-zinc-200">{m.name}</span>
                    <span className="text-[10px] text-zinc-500 font-black uppercase">{m.dosage}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="glass p-10 rounded-[40px] border border-zinc-800/50 border-dashed text-center">
            <Dna className="w-10 h-10 text-purple-500 mx-auto mb-4 animate-float" />
            <h3 className="text-white font-bold mb-2">Genomic Data Encryption Active</h3>
            <p className="text-zinc-500 text-xs max-w-sm mx-auto leading-relaxed">Advanced biomarker sequencing available via provider-level authorization.</p>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileView;
