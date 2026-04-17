import React, { useState, useEffect } from 'react';
import { db, type AppSettings } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Settings as SettingsIcon, 
  Store, 
  Percent, 
  DollarSign, 
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Settings() {
  const settings = useLiveQuery(() => db.settings.toCollection().first());
  const [formData, setFormData] = useState<Omit<AppSettings, 'id' | 'updatedAt'>>({
    appName: '',
    marginType: 'percentage',
    marginValue: 0
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        appName: settings.appName,
        marginType: settings.marginType,
        marginValue: settings.marginValue
      });
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const current = await db.settings.toCollection().first();
      if (current?.id) {
        await db.settings.update(current.id, {
          ...formData,
          updatedAt: Date.now()
        });
      } else {
        await db.settings.add({
          ...formData,
          updatedAt: Date.now()
        });
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-5xl font-black text-slate-950 tracking-tighter italic uppercase underline decoration-indigo-600 decoration-8 underline-offset-[12px] decoration-double">Terminal</h2>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] ml-1">System Configuration & Logic</p>
        </div>
      </div>

      <div className="max-w-4xl">
        <form onSubmit={handleSave} className="space-y-8">
          {/* App Profile */}
          <section className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-indigo-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-bl-[20rem] -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />
            
            <div className="flex items-center gap-4 mb-10 relative">
              <div className="p-4 bg-indigo-50 rounded-3xl">
                <Store className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-950 italic tracking-tight uppercase">Productive Profile</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Application Identity Branding</p>
              </div>
            </div>

            <div className="space-y-6 relative">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Boutique Name</label>
                <input 
                  type="text"
                  value={formData.appName}
                  onChange={e => setFormData({ ...formData, appName: e.target.value })}
                  placeholder="SoleFlow Premium"
                  className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all font-black text-slate-950 uppercase italic tracking-tight text-lg"
                />
              </div>
            </div>
          </section>

          {/* Pricing Logic */}
          <section className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-indigo-500/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-bl-[20rem] -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />
            
            <div className="flex items-center gap-4 mb-10 relative">
              <div className="p-4 bg-amber-50 rounded-3xl">
                <Percent className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-950 italic tracking-tight uppercase">Economic Engine</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Profit Margin & Pricing Logic</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative text-left">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Algorithm Strategy</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, marginType: 'percentage' })}
                    className={`flex items-center justify-center gap-3 py-6 rounded-3xl border-2 transition-all font-black uppercase tracking-widest text-[11px] ${formData.marginType === 'percentage' ? 'bg-indigo-950 border-indigo-950 text-white shadow-xl shadow-indigo-200' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                  >
                    <Percent className="w-4 h-4" />
                    Relative
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, marginType: 'nominal' })}
                    className={`flex items-center justify-center gap-3 py-6 rounded-3xl border-2 transition-all font-black uppercase tracking-widest text-[11px] ${formData.marginType === 'nominal' ? 'bg-indigo-950 border-indigo-950 text-white shadow-xl shadow-indigo-200' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                  >
                    <DollarSign className="w-4 h-4" />
                    Fixed
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">
                  {formData.marginType === 'percentage' ? 'Growth Value (%)' : 'Flat Value (IDR)'}
                </label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">
                    {formData.marginType === 'percentage' ? <Percent className="w-4 h-4" /> : <span className="text-sm">Rp</span>}
                  </div>
                  <input 
                    type="number"
                    value={formData.marginValue}
                    onChange={e => setFormData({ ...formData, marginValue: Number(e.target.value) })}
                    className="w-full pl-16 pr-8 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all font-black text-2xl text-slate-950 tracking-tighter italic"
                  />
                </div>
              </div>
            </div>

            <div className="mt-10 p-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
              <div className="flex items-center gap-3 text-slate-500">
                <AlertCircle className="w-4 h-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Pricing Policy Simulation</p>
              </div>
              <p className="text-xs font-bold text-slate-600 mt-2 leading-relaxed italic">
                {formData.marginType === 'percentage' 
                  ? `Every model analyzed will automatically appreciate by ${formData.marginValue}% of its tactical acquisition cost.`
                  : `Every model analyzed will have a fixed strategic markup of ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(formData.marginValue)} applied to its cost base.`
                }
              </p>
            </div>
          </section>

          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-4 px-12 py-6 bg-slate-950 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[11px] hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 group"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                  Terminate & Save State
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-12 right-12 z-50 flex items-center gap-4 px-8 py-5 bg-emerald-950 text-emerald-400 rounded-3xl shadow-2xl shadow-emerald-900/40 border border-emerald-800"
          >
            <div className="p-2 bg-emerald-800 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">System State Synchronized</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
