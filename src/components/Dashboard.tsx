import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { formatCurrency } from '../lib/utils';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { name: 'Sen', sales: 4000 },
  { name: 'Sel', sales: 3000 },
  { name: 'Rab', sales: 2000 },
  { name: 'Kam', sales: 2780 },
  { name: 'Jum', sales: 1890 },
  { name: 'Sab', sales: 2390 },
  { name: 'Min', sales: 3490 },
];

export default function Dashboard() {
  const productCount = useLiveQuery(() => db.products.count());
  const transactions = useLiveQuery(() => db.transactions.toArray());
  
  const totalRevenue = transactions?.reduce((acc, curr) => acc + curr.totalAmount, 0) || 0;
  const totalSales = transactions?.length || 0;

  const stats = [
    { 
      label: 'Revenue', 
      value: formatCurrency(totalRevenue), 
      icon: TrendingUp, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-500/10',
      trend: '+12.5%',
      trendUp: true
    },
    { 
      label: 'Orders', 
      value: totalSales.toString(), 
      icon: ShoppingCart, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-500/10',
      trend: '+5.2%',
      trendUp: true
    },
    { 
      label: 'Inventory', 
      value: productCount?.toString() || '0', 
      icon: Package, 
      color: 'text-amber-600', 
      bg: 'bg-amber-500/10',
      trend: '-2',
      trendUp: false
    },
    { 
      label: 'New Customers', 
      value: '128', 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-500/10',
      trend: '+18%',
      trendUp: true
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-950 tracking-tight">Overview</h2>
          <p className="text-slate-500 text-xs lg:text-sm font-medium mt-1">Real-time performance metrics for SoleFlow Store.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 shadow-sm">
            Last 24 Hours
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
            Refresh Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-500`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full ${stat.trendUp ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                {stat.trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-950 mt-1 tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 bg-white p-6 lg:p-10 rounded-3xl lg:rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 lg:mb-10">
            <div>
              <h3 className="font-black text-xl text-slate-950 uppercase italic tracking-tighter">Sales Performance</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Weekly Revenue Analysis</p>
            </div>
            <div className="flex p-1 bg-slate-50 border border-slate-100 rounded-xl">
              <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white text-indigo-600 shadow-sm rounded-lg border border-slate-100">7 Days</button>
              <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">30 Days</button>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(value) => `Rp${value/1000}k`}
                />
                <Tooltip 
                  cursor={{ stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '5 5' }}
                  contentStyle={{ 
                    backgroundColor: '#0A0A0B', 
                    borderRadius: '16px', 
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    color: '#fff',
                    padding: '12px'
                  }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ display: 'none' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#4f46e5" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 lg:p-10 rounded-3xl lg:rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
          <div className="mb-8 lg:mb-10">
            <h3 className="font-black text-xl text-slate-950 uppercase italic tracking-tighter">Top Sellers</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Best Performing Items</p>
          </div>
          <div className="space-y-8 flex-1">
            {[
              { name: 'Nike Air Max 270', sales: 45, price: 'Rp1.500.000', id: 'p1' },
              { name: 'Adidas Ultraboost', sales: 38, price: 'Rp1.800.000', id: 'p2' },
              { name: 'Vans Old Skool', sales: 32, price: 'Rp800.000', id: 'p3' },
              { name: 'Converse Chuck 70', sales: 28, price: 'Rp950.000', id: 'p4' },
            ].map((item, i) => (
              <div key={i} className="group flex items-center gap-5 cursor-pointer">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex-shrink-0 border border-slate-100 overflow-hidden ring-4 ring-transparent group-hover:ring-indigo-50 transition-all duration-500">
                  <img src={`https://picsum.photos/seed/${item.id}/100/100`} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-950 uppercase tracking-tight truncate group-hover:text-indigo-600 transition-colors italic">{item.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-widest uppercase">{item.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-indigo-600">{item.sales}</p>
                  <p className="text-[9px] text-slate-300 uppercase font-black tracking-widest leading-none">Sold</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50 rounded-2xl hover:bg-slate-100 hover:text-slate-950 transition-all duration-300">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
