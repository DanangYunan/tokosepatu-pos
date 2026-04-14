import React, { useState } from 'react';
import { db, type User } from '../lib/db';
import { ShoppingBag, Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthProps {
  onLogin: (user: User) => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'customer' as 'admin' | 'customer'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const user = await db.users.where('email').equals(formData.email).first();
        if (user && user.password === formData.password) {
          onLogin(user);
        } else {
          setError('Email atau password salah.');
        }
      } else {
        const existing = await db.users.where('email').equals(formData.email).first();
        if (existing) {
          setError('Email sudah terdaftar.');
        } else {
          const newUser: User = {
            email: formData.email,
            password: formData.password,
            name: formData.name,
            role: formData.role,
            createdAt: Date.now()
          };
          const id = await db.users.add(newUser);
          onLogin({ ...newUser, id });
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 mb-6">
            <ShoppingBag className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">SOLEFLOW</h1>
          <p className="text-slate-500 mt-2">Melangkah lebih jauh dengan gaya.</p>
        </div>

        <motion.div 
          layout
          className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50"
        >
          <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Masuk
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Daftar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nama Lengkap</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      required
                      type="text" 
                      placeholder="Masukkan nama Anda"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Daftar Sebagai</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, role: 'customer'})}
                      className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${formData.role === 'customer' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-500'}`}
                    >
                      Customer
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, role: 'admin'})}
                      className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${formData.role === 'admin' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-500'}`}
                    >
                      Admin
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required
                  type="email" 
                  placeholder="email@contoh.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
                {error}
              </p>
            )}

            <button 
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {isLogin ? 'Masuk' : 'Daftar Sekarang'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {isLogin && (
            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">Akun Demo:</p>
              <div className="mt-2 space-y-1 text-xs font-mono text-slate-400">
                <p>Admin: admin@soleflow.com / admin</p>
                <p>User: customer@gmail.com / user123</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
