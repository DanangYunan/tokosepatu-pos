import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSwitchView: () => void;
  onLogout: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Kelola Produk', icon: Package },
  { id: 'pos', label: 'Kasir / PoS', icon: ShoppingCart },
  { id: 'history', label: 'Riwayat Transaksi', icon: History },
];

export default function Sidebar({ activeTab, setActiveTab, onSwitchView, onLogout }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Package className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">SoleFlow</h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-indigo-50 text-indigo-700 font-medium" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("w-5 h-5", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </button>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-100">
          <button
            onClick={onSwitchView}
            className="w-full flex items-center gap-3 px-4 py-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all font-bold text-sm"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Lihat Toko (Customer)</span>
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
