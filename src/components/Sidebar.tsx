import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSwitchView: () => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Kelola Produk', icon: Package },
  { id: 'pos', label: 'Kasir / PoS', icon: ShoppingCart },
  { id: 'history', label: 'Riwayat Transaksi', icon: History },
  { id: 'reports', label: 'Laporan', icon: FileText },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
];

export default function Sidebar({ activeTab, setActiveTab, onSwitchView, onLogout, isOpen, onClose }: SidebarProps) {
  const content = (
    <div className="flex flex-col h-full bg-slate-950 text-white w-64">
      <div className="p-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center rotate-3">
            <Package className="text-white w-5 h-5" />
          </div>
          <h1 className="font-black text-2xl tracking-tighter italic">SOLEFLOW.</h1>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 text-slate-500 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
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
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-950 text-white h-screen flex-col sticky top-0">
        {content}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="fixed top-0 left-0 h-full z-[110] lg:hidden shadow-2xl"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
