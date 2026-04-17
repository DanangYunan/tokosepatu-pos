import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';
import { type User as AppUser } from '../lib/db';

interface HeaderProps {
  user: AppUser;
  onMenuClick: () => void;
}

export default function Header({ user, onMenuClick }: HeaderProps) {
  return (
    <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-50 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-40 transition-all">
      <div className="flex items-center gap-6 flex-1 max-w-2xl">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-3 text-slate-500 hover:bg-slate-50 rounded-2xl transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative w-full group hidden sm:block">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search Global Intelligence..." 
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 focus:bg-white transition-all text-sm font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4">
          <button className="p-3 text-slate-400 hover:text-slate-950 hover:bg-slate-50 rounded-2xl relative transition-all group">
            <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-indigo-600 rounded-full border-2 border-white ring-4 ring-indigo-50"></span>
          </button>
        </div>
        
        <div className="h-10 w-[1px] bg-slate-100 mx-2"></div>

        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-950 uppercase italic tracking-tighter">{user.name}</p>
            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em] mt-0.5">{user.role}</p>
          </div>
          <div className="relative">
            <div className="w-12 h-12 bg-slate-950 rounded-[1rem] flex items-center justify-center text-white font-black text-lg border-2 border-slate-800 shadow-xl shadow-slate-200 rotate-3 group-hover:rotate-0 transition-transform duration-300">
              {user.name.charAt(0)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
          </div>
        </div>
      </div>
    </header>
  );
}
