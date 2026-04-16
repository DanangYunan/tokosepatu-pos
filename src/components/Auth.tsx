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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white selection:bg-indigo-100 selection:text-indigo-900">
      {/* Left Side: Visual / Hero */}
      <div className="hidden lg:block relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=1974" 
            alt="Shoe store luxury" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        <div className="absolute bottom-20 left-20 right-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center rotate-3 shadow-2xl shadow-indigo-500/50">
                <ShoppingBag className="text-white w-6 h-6" />
              </div>
              <span className="font-black text-3xl tracking-tighter text-white uppercase italic">SOLEFLOW.</span>
            </div>
            <h2 className="text-6xl font-black text-white leading-tight tracking-tighter mb-6">DEFINE YOUR <br/> <span className="text-indigo-500 italic">STYLE.</span></h2>
            <p className="text-slate-400 text-lg max-w-md font-medium leading-relaxed">
              Bergabunglah dengan komunitas SoleFlow dan dapatkan akses eksklusif ke koleksi sepatu premium terbaik dunia.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex items-center justify-center p-8 lg:p-24 bg-slate-50/50">
        <div className="w-full max-w-md space-y-12">
          <div className="lg:hidden text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 mb-6 rotate-3">
              <ShoppingBag className="text-white w-7 h-7" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-950 leading-none">SOLEFLOW.</h1>
          </div>

          <div className="space-y-2">
            <h3 className="text-4xl font-extrabold text-slate-950 tracking-tighter">
              {isLogin ? 'Hello, Welcome Back.' : 'Ready to Start?'}
            </h3>
            <p className="text-slate-500 font-medium">
              {isLogin ? 'Masukkan detail akun Anda di bawah ini.' : 'Buat akun SoleFlow Anda sekarang.'}
            </p>
          </div>

          <motion.div layout>
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        required
                        type="text" 
                        placeholder="John Doe"
                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-medium text-slate-950"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Account Category</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, role: 'customer'})}
                        className={`py-4 text-[11px] font-black uppercase tracking-widest rounded-2xl border-2 transition-all ${formData.role === 'customer' ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-lg shadow-indigo-500/10' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                      >
                        Member
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, role: 'admin'})}
                        className={`py-4 text-[11px] font-black uppercase tracking-widest rounded-2xl border-2 transition-all ${formData.role === 'admin' ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-lg shadow-indigo-500/10' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                      >
                        Retailer
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    required
                    type="email" 
                    placeholder="email@example.com"
                    className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-medium text-slate-950"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    required
                    type="password" 
                    placeholder="••••••••"
                    className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-medium text-slate-950"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 text-red-600 text-xs font-bold"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {error}
                </motion.div>
              )}

              <button 
                disabled={loading}
                type="submit"
                className="w-full py-5 bg-slate-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-500/10 active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    {isLogin ? 'Sign In Now' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="h-px bg-slate-100 flex-1" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">or</span>
            <div className="h-px bg-slate-100 flex-1" />
          </div>

          <div className="text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              {isLogin ? 'Don\'t have an account? Join SoleFlow' : 'Already a member? Sign In'}
            </button>
          </div>

          {isLogin && (
            <div className="p-8 bg-slate-100/50 rounded-[2rem] border border-slate-200/50 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Demo Access</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs px-2">
                  <span className="font-bold text-slate-500">ADMIN</span>
                  <span className="font-black text-slate-900 tracking-tight">admin@soleflow.com / admin</span>
                </div>
                <div className="flex justify-between items-center text-xs px-2">
                  <span className="font-bold text-slate-500">MEMBER</span>
                  <span className="font-black text-slate-900 tracking-tight">customer@gmail.com / user123</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
