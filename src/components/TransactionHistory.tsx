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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Riwayat Transaksi</h2>
          <p className="text-slate-500">Daftar semua penjualan yang telah dilakukan.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-medium hover:bg-slate-50 transition-all shadow-sm">
          <Download className="w-5 h-5" />
          Ekspor Laporan
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari ID transaksi..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
              <Calendar className="w-4 h-4" />
              Pilih Tanggal
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
                <th className="px-6 py-4">ID Transaksi</th>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Metode</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions?.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-bold text-slate-900">#TX-{tx.id?.toString().padStart(6, '0')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-900">{format(tx.timestamp, 'dd MMM yyyy', { locale: id })}</p>
                    <p className="text-xs text-slate-500">{format(tx.timestamp, 'HH:mm', { locale: id })} WIB</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2 overflow-hidden">
                      {tx.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">
                          {item.name.charAt(0)}
                        </div>
                      ))}
                      {tx.items.length > 3 && (
                        <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200">
                          +{tx.items.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      {getPaymentIcon(tx.paymentMethod)}
                      <span className="capitalize">{tx.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900">{formatCurrency(tx.totalAmount)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {(!transactions || transactions.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Belum ada riwayat transaksi.
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
