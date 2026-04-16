import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { formatCurrency } from '../lib/utils';
import { 
  Download, 
  TrendingUp, 
  Calendar, 
  ArrowUpRight,
  Package,
  Award
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function Reports() {
  const transactions = useLiveQuery(() => db.transactions.toArray());
  const products = useLiveQuery(() => db.products.toArray());

  // Aggregate sales by product
  const productSalesMap: Record<string, { count: number; revenue: number; name: string }> = {};
  
  transactions?.forEach(tx => {
    tx.items.forEach(item => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = { count: 0, revenue: 0, name: item.name };
      }
      productSalesMap[item.productId].count += item.quantity;
      productSalesMap[item.productId].revenue += item.subtotal;
    });
  });

  const productSalesData = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const totalRevenue = transactions?.reduce((acc, curr) => acc + curr.totalAmount, 0) || 0;
  const totalItemsSold = transactions?.reduce((acc, curr) => acc + curr.items.reduce((a, c) => a + c.quantity, 0), 0) || 0;

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-5xl font-black text-slate-950 tracking-tighter italic uppercase underline decoration-indigo-600 decoration-8 underline-offset-[12px] decoration-double">Analysis</h2>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] ml-1">Comprehensive Strategic Intelligence</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button className="flex items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-950 bg-white border-2 border-slate-100 rounded-3xl hover:border-slate-950 transition-all shadow-xl shadow-slate-200/50 active:scale-95">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Selection range
          </button>
          <button className="flex items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-slate-950 rounded-3xl hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-300 active:scale-95 group">
            <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
            Download Intel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: TrendingUp, label: 'Gross Revenue', value: formatCurrency(totalRevenue), trend: '+24.8%', color: 'emerald' },
          { icon: Package, label: 'Units Deployed', value: `${totalItemsSold} QTY`, trend: '+12.5%', color: 'indigo' },
          { icon: Award, label: 'Average Ticket', value: transactions?.length ? formatCurrency(totalRevenue / transactions.length) : 'Rp0', trend: '+5.2%', color: 'amber' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-indigo-500/5 relative group overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 rounded-bl-[10rem] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`} />
            <div className={`p-4 w-fit rounded-[1.5rem] bg-${stat.color}-50 mb-8 border border-${stat.color}-100 rotate-6 group-hover:rotate-0 transition-transform`}>
              <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{stat.label}</p>
            <h3 className="text-4xl font-black text-slate-950 mt-3 tracking-tighter italic">{stat.value}</h3>
            <div className="mt-6 flex items-center gap-2">
               <div className={`px-2 py-1 rounded-lg bg-${stat.color}-50 text-${stat.color}-600 text-[10px] font-black flex items-center gap-1`}>
                 <ArrowUpRight className="w-3 h-3" />
                 {stat.trend}
               </div>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Growth Index</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl shadow-indigo-500/5 flex flex-col">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-xl font-black text-slate-950 uppercase italic tracking-tight">Revenue Stream</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Top 5 Performing Models</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-3xl">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div className="h-[400px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productSalesData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f8fafc" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}
                  width={120}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc', radius: 16 }}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '24px', 
                    border: 'none',
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
                    padding: '20px'
                  }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ display: 'none' }}
                  formatter={(value: number) => [formatCurrency(value), 'REVENUE']}
                />
                <Bar dataKey="revenue" radius={[0, 20, 20, 0]} barSize={40}>
                  {productSalesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl shadow-indigo-500/5">
          <div className="mb-12">
            <h3 className="text-xl font-black text-slate-950 uppercase italic tracking-tight">Performance Audit</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Detailed Unit Movement</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] border-b border-slate-50">
                  <th className="pb-6">Designate</th>
                  <th className="pb-6 text-center">Volume</th>
                  <th className="pb-6 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {productSalesData.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                    <td className="py-6">
                      <p className="text-sm font-black text-slate-950 uppercase italic tracking-tight group-hover:translate-x-1 transition-transform">{item.name}</p>
                    </td>
                    <td className="py-6 text-center">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-2xl bg-slate-950 text-white text-[9px] font-black tracking-widest shadow-xl shadow-slate-200">
                        {item.count} UNITS
                      </span>
                    </td>
                    <td className="py-6 text-right">
                      <p className="text-sm font-black text-indigo-600 tracking-tight italic">{formatCurrency(item.revenue)}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="w-full mt-12 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] bg-slate-50 rounded-[2rem] hover:bg-slate-950 hover:text-white transition-all active:scale-95 shadow-lg shadow-slate-100">
            Expand Complete Archive
          </button>
        </div>
      </div>
    </div>
  );
}
