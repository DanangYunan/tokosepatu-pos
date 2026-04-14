import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Product, type TransactionItem } from '../lib/db';
import { formatCurrency, cn } from '../lib/utils';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  ArrowRight, 
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { type User as AppUser } from '../lib/db';

interface CustomerMarketplaceProps {
  onViewModeChange: () => void;
  onLogout: () => void;
  user: AppUser;
}

export default function CustomerMarketplace({ onViewModeChange, onLogout, user }: CustomerMarketplaceProps) {
  const products = useLiveQuery(() => db.products.toArray());
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const categories = ['Semua', 'Running', 'Casual', 'Basketball', 'Formal'];

  const filteredProducts = products?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, {
        productId: product.id!,
        name: product.name,
        price: product.price,
        quantity: 1,
        subtotal: product.price
      }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty, subtotal: newQty * item.price };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((acc, curr) => acc + curr.subtotal, 0);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Top Banner */}
      <div className="bg-indigo-600 text-white py-2 px-4 text-center text-xs font-bold tracking-widest uppercase">
        Gratis Ongkir Seluruh Indonesia • S&K Berlaku
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="text-white w-5 h-5" />
              </div>
              <span className="font-black text-2xl tracking-tighter">SOLEFLOW</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "text-sm font-bold uppercase tracking-widest transition-colors",
                    selectedCategory === cat ? "text-indigo-600" : "text-slate-400 hover:text-slate-900"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari sepatu impian..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-indigo-500/20 outline-none"
              />
            </div>
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ShoppingBag className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {cart.length}
                </span>
              )}
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900">{user.name}</p>
                <button 
                  onClick={onLogout}
                  className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline"
                >
                  Keluar
                </button>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 font-bold border border-slate-200">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=2070" 
            alt="Hero" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <span className="inline-block text-indigo-400 font-bold tracking-[0.3em] uppercase mb-4">New Collection 2024</span>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8">
              STEP INTO THE <br/> <span className="text-indigo-500 italic">FUTURE.</span>
            </h1>
            <p className="text-slate-300 text-lg mb-10 max-w-lg">
              Temukan koleksi sepatu terbaik dari brand ternama dunia. Kenyamanan maksimal dengan gaya yang tak tertandingi.
            </p>
            <button className="group flex items-center gap-4 bg-white text-slate-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-600 hover:text-white transition-all">
              Belanja Sekarang
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: Truck, title: 'Gratis Ongkir', desc: 'Seluruh Indonesia' },
            { icon: RotateCcw, title: '14 Hari Retur', desc: 'Garansi uang kembali' },
            { icon: ShieldCheck, title: '100% Original', desc: 'Produk resmi & asli' },
            { icon: Star, title: 'Premium Quality', desc: 'Material terbaik' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <f.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">{f.title}</h4>
                <p className="text-xs text-slate-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl font-black tracking-tight mb-2">KOLEKSI TERBARU</h2>
            <p className="text-slate-500">Pilihan terbaik untuk gaya hidup aktif Anda.</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm font-bold text-slate-400">Menampilkan {filteredProducts?.length} Produk</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
          {filteredProducts?.map((product) => (
            <motion.div 
              layout
              key={product.id} 
              className="group"
            >
              <div className="relative aspect-[4/5] bg-slate-100 rounded-3xl overflow-hidden mb-6">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {product.brand}
                  </span>
                </div>
                <button 
                  onClick={() => addToCart(product)}
                  className="absolute bottom-4 left-4 right-4 bg-slate-900 text-white py-4 rounded-2xl font-bold translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
                >
                  Tambah ke Keranjang
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-xs font-bold">4.8</span>
                  </div>
                </div>
                <p className="text-slate-500 text-sm">{product.category} • Size {product.size}</p>
                <p className="text-xl font-black text-slate-900 mt-2">{formatCurrency(product.price)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black tracking-tight mb-4">DAPATKAN DISKON 15%</h2>
          <p className="text-slate-500 mb-10">Berlangganan newsletter kami dan jadilah yang pertama tahu tentang koleksi terbaru dan promo eksklusif.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              placeholder="Alamat email Anda" 
              className="flex-1 px-8 py-4 rounded-full bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button className="bg-indigo-600 text-white px-10 py-4 rounded-full font-bold hover:bg-indigo-700 transition-all">
              Daftar Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-24 pb-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="text-white w-5 h-5" />
              </div>
              <span className="font-black text-2xl tracking-tighter">SOLEFLOW</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Toko sepatu online terpercaya dengan koleksi terlengkap dan kualitas premium. Melangkah lebih jauh bersama SoleFlow.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-xs">Belanja</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="#" className="hover:text-indigo-600">Semua Produk</a></li>
              <li><a href="#" className="hover:text-indigo-600">Running Shoes</a></li>
              <li><a href="#" className="hover:text-indigo-600">Casual Shoes</a></li>
              <li><a href="#" className="hover:text-indigo-600">Basketball Shoes</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-xs">Bantuan</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="#" className="hover:text-indigo-600">Status Pesanan</a></li>
              <li><a href="#" className="hover:text-indigo-600">Pengiriman</a></li>
              <li><a href="#" className="hover:text-indigo-600">Kebijakan Retur</a></li>
              <li><a href="#" className="hover:text-indigo-600">Hubungi Kami</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-xs">Ikuti Kami</h4>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all cursor-pointer">
                <span className="font-bold">Ig</span>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all cursor-pointer">
                <span className="font-bold">Tw</span>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all cursor-pointer">
                <span className="font-bold">Fb</span>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-xs">© 2024 SoleFlow Indonesia. All rights reserved.</p>
          <div className="flex gap-8 text-slate-400 text-xs">
            <a href="#" className="hover:text-slate-900">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6 text-indigo-600" />
                  <h3 className="font-black text-xl tracking-tight">KERANJANG</h3>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.map(item => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0">
                      <img 
                        src={products?.find(p => p.id === item.productId)?.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">{item.name}</h4>
                      <p className="text-sm text-slate-500 mb-3">{formatCurrency(item.price)}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 bg-slate-100 rounded-full px-4 py-1.5">
                          <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:text-indigo-600"><Minus className="w-3 h-3"/></button>
                          <span className="text-sm font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:text-indigo-600"><Plus className="w-3 h-3"/></button>
                        </div>
                        <button onClick={() => updateQuantity(item.productId, -item.quantity)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </div>
                  </div>
                ))}
                {cart.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                      <ShoppingBag className="w-10 h-10 text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-medium">Keranjang Anda kosong.<br/>Mulai belanja sekarang!</p>
                  </div>
                )}
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Total Pembayaran</span>
                  <span className="text-3xl font-black text-indigo-600">{formatCurrency(cartTotal)}</span>
                </div>
                <button 
                  disabled={cart.length === 0}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-indigo-600 transition-all shadow-xl disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  Checkout Sekarang
                </button>
                <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">
                  Pembayaran Aman & Terenkripsi
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
