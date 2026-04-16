import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  Search, 
  Download, 
  Eye, 
  Calendar,
  CreditCard,
  Banknote,
  ArrowRight
} from 'lucide-react';

export default function TransactionHistory() {
  const transactions = useLiveQuery(() => db.transactions.orderBy('timestamp').reverse().toArray());

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'transfer': return <ArrowRight className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-950 tracking-tighter italic uppercase underline decoration-indigo-500 decoration-4 underline-offset-8">Journal</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Validated Transaction Records</p>
        </div>
        <button className="flex items-center justify-center gap-3 bg-slate-950 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95 group">
          <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
          Export Manifesto
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-indigo-500/5 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row gap-6 items-center justify-between bg-slate-50/30">
          <div className="relative w-full sm:w-[400px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search serial numbers..." 
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 text-sm font-medium transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-3 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
              <Calendar className="w-4 h-4" />
              Temporal Range
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Reference ID</th>
                <th className="px-8 py-6">Timestamp</th>
                <th className="px-8 py-6">Inventory</th>
                <th className="px-8 py-6">Protocol</th>
                <th className="px-8 py-6">Quantum</th>
                <th className="px-8 py-6 text-right">Observation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions?.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/30 transition-all group">
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-slate-950 tracking-tighter italic">#TX-{tx.id?.toString().padStart(6, '0')}</span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-slate-950">{format(tx.timestamp, 'dd MMM yyyy', { locale: id })}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{format(tx.timestamp, 'HH:mm', { locale: id })} GMT+7</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex -space-x-3 overflow-hidden">
                      {tx.items.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="inline-block h-10 w-10 rounded-2xl ring-4 ring-white bg-slate-950 flex items-center justify-center text-[10px] font-black text-white border border-slate-800 rotate-2 first:rotate-0 odd:-rotate-2">
                          {item.name.charAt(0)}
                        </div>
                      ))}
                      {tx.items.length > 4 && (
                        <div className="inline-block h-10 w-10 rounded-2xl ring-4 ring-white bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white border border-indigo-500 italic">
                          +{tx.items.length - 4}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600">
                      {getPaymentIcon(tx.paymentMethod)}
                      <span>{tx.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-slate-950 italic tracking-tight">{formatCurrency(tx.totalAmount)}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-slate-950 rounded-2xl transition-all shadow-sm">
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {(!transactions || transactions.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 grayscale opacity-40">
                       <Calendar className="w-12 h-12 text-slate-300" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Zero Data Points Found In Registry</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
