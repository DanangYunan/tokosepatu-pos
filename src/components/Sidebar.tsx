import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  FileText,
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
  { id: 'reports', label: 'Laporan', icon: FileText },
];

export default function Sidebar({ activeTab, setActiveTab, onSwitchView, onLogout }: SidebarProps) {
  return (
    <aside className="w-64 bg-slate-950 text-white h-screen flex flex-col sticky top-0">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center rotate-3">
            <Package className="text-white w-5 h-5" />
          </div>
          <h1 className="font-black text-2xl tracking-tighter italic">SOLEFLOW.</h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5">
        <div className="px-4 mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Main Menu</p>
        </div>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group",
                isActive 
                  ? "bg-white/10 text-white font-bold shadow-lg ring-1 ring-white/20" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("w-5 h-5", isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-400")} />
                <span className="text-sm">{item.label}</span>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
            </button>
          );
        })}

        <div className="pt-6 mt-6 border-t border-white/5 mx-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Storefront</p>
          <button
            onClick={onSwitchView}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-indigo-400 hover:bg-indigo-500/10 rounded-2xl transition-all font-bold text-sm"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Marketplace</span>
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-white/5">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-4 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
