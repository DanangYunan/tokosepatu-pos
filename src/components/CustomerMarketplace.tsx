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
  Trash2,
  LayoutDashboard,
  Banknote,
  CreditCard,
  Wallet,
  MessageCircle
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
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'transfer' | 'digital' | 'whatsapp'>('transfer');
  const [configProduct, setConfigProduct] = useState<Product | null>(null);
  const [configSize, setConfigSize] = useState<string>('');
  const [configColor, setConfigColor] = useState<string>('');

  const categories = ['Semua', 'Running', 'Casual', 'Basketball', 'Formal'];

  const filteredProducts = products?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product, size: string, color: string) => {
    setCart(prev => {
      const existing = prev.find(item => 
        item.productId === product.id && 
        item.size === size && 
        item.color === color
      );
      if (existing) {
        return prev.map(item => 
          (item.productId === product.id && item.size === size && item.color === color)
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, {
        productId: product.id!,
        name: product.name,
        price: product.sellingPrice,
        quantity: 1,
        subtotal: product.sellingPrice,
        size,
        color
      }];
    });
    setConfigProduct(null);
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: number, size: string | undefined, color: string | undefined, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId && item.size === size && item.color === color) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty, subtotal: newQty * item.price };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((acc, curr) => acc + curr.subtotal, 0);

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;

    const phoneNumber = "6285157720367"; // Nomor WhatsApp admin SoleFlow
    const message = `Halo SoleFlow! Saya ingin memesan sepatu berikut:

*Detail Pesanan:*
${cart.map((item, index) => `${index + 1}. ${item.name} [Size: ${item.size || '-'}, Color: ${item.color || '-'}] (${item.quantity}x) - ${formatCurrency(item.subtotal)}`).join('\n')}

*Metode Pembayaran: ${
  paymentMethod === 'cod' ? 'COD (Bayar di Tempat)' : 
  paymentMethod === 'transfer' ? 'Transfer Bank' : 
  paymentMethod === 'whatsapp' ? 'Manual via WhatsApp' : 'E-Wallet / QRIS'
}*

*Total Pembayaran: ${formatCurrency(cartTotal)}*

Nama Pemesan: ${user.name}
Email: ${user.email}

Terima kasih!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Banner */}
      <div className="bg-slate-950 text-white py-2.5 px-4 text-center text-[10px] font-extrabold tracking-[0.2em] uppercase">
        Pengiriman Kilat ke Seluruh Indonesia • Dapatkan Cashback s/d 10%
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-slate-100/50 flex flex-col lg:block">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 lg:gap-12">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setSelectedCategory('Semua')}>
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-lg shadow-indigo-200">
                <ShoppingBag className="text-white w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl lg:text-2xl tracking-tighter">SOLEFLOW.</span>
            </div>
            
            <div className="hidden lg:flex items-center gap-8">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "text-[11px] font-black uppercase tracking-[0.15em] transition-all relative py-2",
                    selectedCategory === cat 
                      ? "text-indigo-600 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-indigo-600" 
                      : "text-slate-400 hover:text-slate-900"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-6">
            <div className="relative hidden md:block group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Cari koleksi terbaik..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3 bg-slate-100 border-2 border-transparent rounded-2xl text-xs w-48 lg:w-72 focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
              />
            </div>
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 lg:p-3 text-slate-700 hover:bg-slate-100 rounded-2xl transition-all group"
            >
              <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6 group-hover:scale-110 transition-transform" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 lg:w-6 lg:h-6 bg-indigo-600 text-white text-[9px] lg:text-[10px] font-black flex items-center justify-center rounded-xl border-2 border-white shadow-lg">
                  {cart.length}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2 lg:gap-4 pl-3 lg:pl-6 border-l border-slate-100">
              {user.role === 'admin' && (
                <button 
                  onClick={onViewModeChange}
                  className="p-2.5 lg:p-3 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all group flex items-center gap-2"
                  title="Back to Admin Panel"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden xl:block">Admin</span>
                </button>
              )}
              <div className="text-right hidden md:block">
                <p className="text-[11px] font-black text-slate-950 leading-tight uppercase italic">{user.name}</p>
                <button 
                  onClick={onLogout}
                  className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                >
                  Sign Out
                </button>
              </div>
              <div className="w-10 h-10 lg:w-11 lg:h-11 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl lg:rounded-2xl flex items-center justify-center text-slate-800 font-black border border-white shadow-sm overflow-hidden ring-2 ring-slate-50">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Search & Categories */}
        <div className="lg:hidden px-4 pb-4 flex flex-col gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari produk..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-medium focus:bg-white transition-all outline-none"
            />
          </div>
          <div className="flex overflow-x-auto pb-1 no-scrollbar gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                  selectedCategory === cat 
                    ? "bg-slate-950 text-white shadow-lg shadow-slate-200" 
                    : "bg-white text-slate-400 border border-slate-100 hover:border-slate-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[85vh] lg:h-[90vh] flex items-center overflow-hidden pt-32 lg:pt-0">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=2070" 
            alt="Hero Background" 
            className="w-full h-full object-cover scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black tracking-[0.3em] uppercase mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Limited Edition Drop
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-[10rem] font-extrabold text-white leading-[0.9] lg:leading-[0.8] tracking-[-0.05em] mb-8 lg:mb-10">
                ULTIMATE <br/> <span className="text-indigo-500 italic">STYLE.</span>
              </h1>
              <p className="text-slate-300 text-base md:text-lg lg:text-xl mb-10 lg:mb-12 max-w-xl leading-relaxed font-medium">
                Melangkah dengan penuh percaya diri. Koleksi eksklusif SoleFlow hadir untuk mendefinisikan jati diri Anda melalui kenyamanan premium.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
                <button 
                  onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group flex items-center justify-center gap-4 bg-white text-slate-950 px-8 lg:px-10 py-4 lg:py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-2xl shadow-indigo-500/10"
                >
                  Explore Collection
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </button>
                <div className="flex items-center justify-center sm:justify-start gap-4">
                  <div className="flex -space-x-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-12 h-12 rounded-2xl border-4 border-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden">
                        <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="user" className="w-full h-full object-cover opacity-80" />
                      </div>
                    ))}
                  </div>
                  <div className="text-slate-400 text-xs font-bold leading-tight">
                    <span className="text-white">5k+ People</span> <br/> 
                    Trusted Our Shoes
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features - Premium Look */}
      <section className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { icon: Truck, title: 'Express Logistics', desc: 'Pengiriman instan & terlacak' },
            { icon: RotateCcw, title: 'Safe Returns', desc: 'Hassle-free 14 hari retur' },
            { icon: ShieldCheck, title: 'Authenticity Guarantee', desc: 'Cek verifikasi keaslian' },
            { icon: Star, title: 'Elite Loyalty', desc: 'Member exclusive rewards' },
          ].map((f, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="group p-8 bg-white rounded-[2rem] border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 mb-6 group-hover:rotate-6 shadow-sm">
                <f.icon className="w-6 h-6" />
              </div>
              <h4 className="font-black text-xs uppercase tracking-widest mb-2">{f.title}</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      <section id="collection" className="py-32 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="max-w-xl">
            <span className="text-indigo-600 font-black text-[10px] tracking-[0.4em] uppercase mb-4 block">Curated Selection</span>
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">NEW RELEASES.</h2>
            <p className="text-slate-500 text-lg leading-relaxed font-medium">
              Edisi terbatas yang dirancang khusus untuk performa tinggi dan gaya hidup urban yang dinamis.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] border border-slate-100 px-6 py-3 rounded-2xl">
              Results: {filteredProducts?.length} Models
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-16">
          {filteredProducts?.map((product) => (
            <motion.div 
              layout
              key={product.id} 
              className="group"
            >
              <div className="relative aspect-[3/4] bg-slate-100 rounded-[2.5rem] overflow-hidden mb-8 shadow-sm">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/20 transition-all duration-500" />
                
                <div className="absolute top-6 left-6">
                  <span className="bg-white/95 backdrop-blur-xl px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl">
                    {product.brand}
                  </span>
                </div>
                
                <button 
                  onClick={() => {
                    setConfigProduct(product);
                    setConfigSize(product.size);
                    setConfigColor('Original');
                  }}
                  className="absolute bottom-8 left-8 right-8 bg-white text-slate-950 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-[400ms] shadow-2xl hover:bg-slate-950 hover:text-white"
                >
                  Configure & Add
                </button>
              </div>
              
              <div className="px-2 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-extrabold text-lg text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors uppercase italic">{product.name}</h3>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full text-amber-600 border border-amber-100/50">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-[10px] font-black">4.8</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.category}</span>
                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-xs">Size {product.size}</span>
                </div>
                <p className="text-2xl font-black text-slate-950 tracking-tight">{formatCurrency(product.sellingPrice)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter - Premium Design */}
      <section className="bg-slate-950 py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-1/3 h-full bg-indigo-600/5 blur-[120px] rounded-full" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <span className="text-indigo-500 font-black text-[10px] tracking-[0.4em] uppercase mb-6 block">Join the Circle</span>
          <h2 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter mb-6 leading-tight">BECOME AN INSIDER.</h2>
          <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium">
            Dapatkan akses awal ke drop terbaru, konten eksklusif, dan penawaran khusus member.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto p-2 bg-slate-900 rounded-[2.5rem] border border-slate-800">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 px-8 py-5 bg-transparent text-white outline-none font-medium placeholder:text-slate-600"
            />
            <button className="bg-white text-slate-950 px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
              Subscribe Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-24">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-8 scale-110 origin-left">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center -rotate-6 shadow-lg shadow-indigo-200">
                <ShoppingBag className="text-white w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl tracking-tighter">SOLEFLOW.</span>
            </div>
            <p className="text-slate-500 text-lg leading-relaxed font-medium mb-10">
              Membangun masa depan persepatuan. Kami tidak hanya menjual sepatu, kami memberikan pengalaman melangkah yang lebih baik melalui inovasi dan desain premium.
            </p>
            <div className="flex gap-4">
              {['Ig', 'Tw', 'In', 'Fb'].map(social => (
                <div key={social} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[10px] font-black text-slate-400 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer border border-slate-100 shadow-sm">
                  {social}
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <h4 className="font-black mb-8 uppercase tracking-[0.2em] text-[10px] text-slate-400">Shop</h4>
            <ul className="space-y-5 text-sm font-bold text-slate-600">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Men Collection</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Women Collection</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Limited Drops</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Sale Store</a></li>
            </ul>
          </div>
          
          <div className="lg:col-span-2">
            <h4 className="font-black mb-8 uppercase tracking-[0.2em] text-[10px] text-slate-400">Information</h4>
            <ul className="space-y-5 text-sm font-bold text-slate-600">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Shipping</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Order Status</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Refund Policy</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Work</a></li>
            </ul>
          </div>

          <div className="lg:col-span-4 bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
            <h4 className="font-black mb-6 uppercase tracking-[0.2em] text-[10px] text-slate-900">Headquarters</h4>
            <p className="text-slate-500 font-medium text-sm leading-loose mb-8">
              SCBD District 8, Jakarta Selatan <br/>
              Indonesia 12190 <br/>
              contact@soleflow.id
            </p>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">+62 21 8888 9999</p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">© 2024 SoleFlow Indonesia. Handcrafted with Precision.</p>
          <div className="flex gap-10 text-slate-400 text-[10px] font-bold tracking-widest uppercase">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Cookies</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Legal</a>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {configProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfigProduct(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <div className="relative h-64 bg-slate-100">
                <img 
                  src={configProduct.imageUrl} 
                  alt={configProduct.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => setConfigProduct(null)}
                  className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-xl rounded-2xl hover:bg-white transition-all shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 lg:p-10 space-y-6 lg:space-y-8">
                <div>
                  <h3 className="text-2xl lg:text-3xl font-black text-slate-950 leading-tight uppercase italic">{configProduct.name}</h3>
                  <p className="text-indigo-600 font-black text-lg lg:text-xl mt-1">{formatCurrency(configProduct.sellingPrice)}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Ukuran</span>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Size Guide</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['38', '39', '40', '41', '42', '43', '44', '45'].map(size => (
                      <button 
                        key={size}
                        onClick={() => setConfigSize(size)}
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black transition-all",
                          configSize === size 
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                            : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Warna</span>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { name: 'Original', class: 'bg-slate-200' },
                      { name: 'Stealth Black', class: 'bg-slate-950' },
                      { name: 'Pure White', class: 'bg-white border border-slate-200' },
                      { name: 'Crimson Red', class: 'bg-red-600' },
                      { name: 'Royal Blue', class: 'bg-blue-600' }
                    ].map(color => (
                      <button 
                        key={color.name}
                        onClick={() => setConfigColor(color.name)}
                        className={cn(
                          "px-4 py-2.5 rounded-xl border-2 flex items-center gap-2 transition-all group",
                          configColor === color.name 
                            ? "border-indigo-600 bg-indigo-50" 
                            : "border-slate-100 hover:border-slate-200"
                        )}
                      >
                        <div className={cn("w-3 h-3 rounded-full shadow-sm", color.class)} />
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          configColor === color.name ? "text-indigo-600" : "text-slate-500"
                        )}>{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => addToCart(configProduct, configSize, configColor)}
                  className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-950 transition-all shadow-xl shadow-indigo-100"
                >
                  Confirm & Add to Bag
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full lg:max-w-xl bg-white z-[110] shadow-[-20px_0_50px_rgba(0,0,0,0.1)] flex flex-col"
            >
              <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-2xl tracking-tighter uppercase italic">My Cart</h3>
                    <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">{cart.length} Items Selected</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-3 hover:bg-slate-100 rounded-2xl transition-all group"
                >
                  <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-10">
                {cart.map(item => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={item.productId} 
                    className="flex gap-8 group"
                  >
                    <div className="w-32 h-40 bg-slate-100 rounded-[2rem] overflow-hidden flex-shrink-0 shadow-inner">
                      <img 
                        src={products?.find(p => p.id === item.productId)?.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-2">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="font-extrabold text-xl text-slate-950 leading-tight truncate uppercase italic">{item.name}</h4>
                      <button onClick={() => updateQuantity(item.productId, item.size, item.color, -item.quantity)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5"/></button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-500 uppercase">Size: {item.size}</span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-500 uppercase">Color: {item.color}</span>
                    </div>
                    <p className="text-lg font-black text-indigo-600 mt-2">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center justify-between mt-6 bg-slate-50 p-2 rounded-2xl">
                    <div className="flex items-center gap-6 px-4">
                      <button onClick={() => updateQuantity(item.productId, item.size, item.color, -1)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:text-indigo-600 transition-all font-bold group">
                        <Minus className="w-3 h-3 group-hover:scale-125 transition-transform"/>
                      </button>
                      <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.size, item.color, 1)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:text-indigo-600 transition-all font-bold group">
                        <Plus className="w-3 h-3 group-hover:scale-125 transition-transform"/>
                      </button>
                    </div>
                    <span className="text-sm font-black pr-4 text-slate-400">SUBTOTAL: {formatCurrency(item.subtotal)}</span>
                  </div>
                </div>
                  </motion.div>
                ))}
                
                {cart.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20">
                    <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-10 rotate-3">
                      <ShoppingBag className="w-16 h-16 text-slate-200" />
                    </div>
                    <h5 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter italic">Your bag is empty</h5>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs mx-auto">
                      Sepertinya Anda belum menemukan sepatu impian. Jelajahi koleksi kami sekarang!
                    </p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="mt-10 px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-950 transition-all shadow-xl shadow-indigo-200"
                    >
                      Start Shopping
                    </button>
                  </div>
                )}
              </div>

              <div className="p-10 bg-slate-950 text-white space-y-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                    <span>Order Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                    <span>Shipping Fee</span>
                    <span>FREE</span>
                  </div>
                  <div className="h-px bg-slate-900 w-full" />
                  <div className="flex justify-between items-end pt-2">
                    <span className="text-slate-400 font-black uppercase tracking-widest text-[11px]">Estimate Total</span>
                    <span className="text-5xl font-extrabold tracking-tighter italic">{formatCurrency(cartTotal)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Select Payment Method</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'cod', label: 'COD (Bayar di Tempat)', icon: Banknote, desc: 'Bayar saat barang sampai' },
                      { id: 'transfer', label: 'Transfer Bank', icon: CreditCard, desc: 'BCA, Mandiri, BNI, BRI' },
                      { id: 'digital', label: 'E-Wallet / QRIS', icon: Wallet, desc: 'GoPay, OVO, Dana, ShopeePay' },
                      { id: 'whatsapp', label: 'Manual WhatsApp', icon: MessageCircle, desc: 'Konfirmasi via Chat Admin' },
                    ].map((method) => (
                      <button 
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group",
                          paymentMethod === method.id 
                            ? "bg-white border-white text-slate-950 shadow-xl" 
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                          paymentMethod === method.id ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-500 group-hover:bg-slate-700"
                        )}>
                          <method.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] font-black uppercase tracking-widest">{method.label}</p>
                          <p className="text-[9px] font-bold opacity-50 mt-0.5">{method.desc}</p>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          paymentMethod === method.id ? "border-indigo-600 bg-indigo-600" : "border-slate-800"
                        )}>
                          {paymentMethod === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <button 
                  disabled={cart.length === 0}
                  onClick={handleWhatsAppCheckout}
                  className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-slate-950 transition-all disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed shadow-[0_20px_50px_rgba(79,70,229,0.3)]"
                >
                  Konfirmasi Pesanan
                </button>
                
                <div className="flex items-center justify-center gap-2 opacity-30">
                  <ShieldCheck className="w-3 h-3" />
                  <p className="text-[9px] uppercase tracking-widest font-black">
                    Secured by SoleFlow Advanced Security
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
