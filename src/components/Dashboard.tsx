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
      label: 'Total Pendapatan', 
      value: formatCurrency(totalRevenue), 
      icon: TrendingUp, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50',
      trend: '+12.5%',
      trendUp: true
    },
    { 
      label: 'Total Penjualan', 
      value: totalSales.toString(), 
      icon: ShoppingCart, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50',
      trend: '+5.2%',
      trendUp: true
    },
    { 
      label: 'Stok Produk', 
      value: productCount?.toString() || '0', 
      icon: Package, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50',
      trend: '-2',
      trendUp: false
    },
    { 
      label: 'Pelanggan Baru', 
      value: '128', 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      trend: '+18%',
      trendUp: true
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Ringkasan Toko</h2>
        <p className="text-slate-500">Pantau performa toko sepatu Anda hari ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${stat.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Grafik Penjualan Mingguan</h3>
            <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/20">
              <option>7 Hari Terakhir</option>
              <option>30 Hari Terakhir</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `Rp${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-lg mb-6">Produk Terlaris</h3>
          <div className="space-y-6">
            {[
              { name: 'Nike Air Max 270', sales: 45, price: 'Rp1.500.000' },
              { name: 'Adidas Ultraboost', sales: 38, price: 'Rp1.800.000' },
              { name: 'Vans Old Skool', sales: 32, price: 'Rp800.000' },
              { name: 'Converse Chuck 70', sales: 28, price: 'Rp950.000' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-indigo-600">{item.sales}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Terjual</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
            Lihat Semua Produk
          </button>
        </div>
      </div>
    </div>
  );
}
