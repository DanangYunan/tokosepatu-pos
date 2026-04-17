import React, { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Product, type TransactionItem, type Transaction, type Payment } from '../lib/db';
import { formatCurrency, cn, formatInputNumber, parseInputNumber } from '../lib/utils';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  ArrowRight,
  CheckCircle2,
  Printer,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface ReceiptProps {
  transaction: Transaction;
  onClose: () => void;
}

const Receipt = ({ transaction, onClose }: ReceiptProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = receiptRef.current;
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = 'Print' + uniqueName;
    const printWindow = window.open(windowUrl, windowName, 'left=500,top=500,width=400,height=600');

    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Struk SoleFlow</title>
            <style>
              body { font-family: 'Courier New', Courier, monospace; width: 300px; padding: 20px; font-size: 12px; }
              .center { text-align: center; }
              .divider { border-top: 1px dashed #000; margin: 10px 0; }
              .flex { display: flex; justify-content: space-between; }
              .bold { font-weight: bold; }
              .mt-10 { margin-top: 10px; }
            </style>
          </head>
          <body>
            ${printContent?.innerHTML}
            <script>
              window.onload = function() { window.print(); window.close(); };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold">Struk Transaksi</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          <div ref={receiptRef} className="font-mono text-sm space-y-4">
            <div className="text-center space-y-1">
              <h2 className="font-bold text-lg">SOLEFLOW</h2>
              <p className="text-xs">Jl. Sepatu Keren No. 123</p>
              <p className="text-xs">Jakarta, Indonesia</p>
              <p className="text-xs">Telp: 021-12345678</p>
            </div>

            <div className="border-t border-dashed border-slate-300 pt-4 space-y-1">
              <div className="flex justify-between text-xs">
                <span>No: #TX-${transaction.id?.toString().padStart(6, '0')}</span>
                <span>${format(transaction.timestamp, 'dd/MM/yy HH:mm')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Kasir: Admin</span>
                <span>Mode: Multi-Payment</span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-300 pt-4 space-y-2">
              {transaction.items.map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold">{item.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>{item.quantity} x ${formatCurrency(item.price)}</span>
                    <span>${formatCurrency(item.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-slate-300 pt-4 space-y-1">
              <div className="flex justify-between font-bold">
                <span>TOTAL</span>
                <span>${formatCurrency(transaction.totalAmount)}</span>
              </div>
              {transaction.payments.map((p, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="uppercase">{p.method}</span>
                  <span>${formatCurrency(p.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between text-xs pt-1 border-t border-slate-100 border-dotted">
                <span>KEMBALI</span>
                <span>${formatCurrency(transaction.change)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-300 pt-4 text-center space-y-1">
              <p className="text-xs">Terima Kasih</p>
              <p className="text-[10px]">Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"
          >
            <Printer className="w-4 h-4" />
            Cetak Struk
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};

export default function POS() {
  const products = useLiveQuery(() => db.products.toArray());
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activePaymentMethod, setActivePaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [isSuccess, setIsSuccess] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentAmount, setCurrentAmount] = useState<string>('');
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, {
        productId: product.id!,
        name: product.name,
        price: product.sellingPrice,
        quantity: 1,
        subtotal: product.sellingPrice
      }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const product = products?.find(p => p.id === productId);
        const newQty = Math.max(0, item.quantity + delta);
        if (product && newQty > product.stock) return item;
        return { ...item, quantity: newQty, subtotal: newQty * item.price };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const total = cart.reduce((acc, curr) => acc + curr.subtotal, 0);
  const totalPaid = payments.reduce((acc, curr) => acc + curr.amount, 0);
  const remaining = Math.max(0, total - totalPaid);
  const change = Math.max(0, totalPaid - total);

  const addPayment = () => {
    const amount = parseInputNumber(currentAmount);
    if (amount <= 0) return;
    
    setPayments(prev => [...prev, { method: activePaymentMethod, amount }]);
    setCurrentAmount('');
  };

  const removePayment = (index: number) => {
    setPayments(prev => prev.filter((_, i) => i !== index));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (totalPaid < total) {
      alert('Pembayaran belum mencukupi!');
      return;
    }

    const transaction: Transaction = {
      items: cart,
      totalAmount: total,
      payments,
      totalPaid,
      change,
      timestamp: Date.now(),
    };

    // Update stock
    for (const item of cart) {
      const product = await db.products.get(item.productId);
      if (product) {
        await db.products.update(item.productId, {
          stock: product.stock - item.quantity
        });
      }
    }

    const id = await db.transactions.add(transaction);
    setLastTransaction({ ...transaction, id });
    setCart([]);
    setPayments([]);
    setCurrentAmount('');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-12rem)] pb-6">
      {/* Product Selection */}
      <div className="flex-1 flex flex-col gap-8 overflow-hidden">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Scan SKU or search for premium models..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 shadow-sm text-lg font-medium transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-6 scrollbar-hide">
          {filteredProducts?.map((product) => (
            <button 
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={cn(
                "group relative bg-white border border-slate-100 rounded-[2rem] p-5 text-left transition-all hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-200",
                product.stock <= 0 && "opacity-60 grayscale cursor-not-allowed"
              )}
            >
              <div className="aspect-[4/5] bg-slate-50 rounded-2xl mb-5 overflow-hidden border border-slate-100">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{product.brand}</p>
                <h4 className="font-extrabold text-slate-950 truncate uppercase italic tracking-tight">{product.name}</h4>
                <div className="flex items-center justify-between mt-4">
                  <p className="font-black text-slate-950 text-lg">{formatCurrency(product.sellingPrice)}</p>
                  <p className={cn(
                    "text-[10px] font-black px-3 py-1 rounded-xl uppercase tracking-widest",
                    product.stock > 5 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                  )}>
                    Stock: {product.stock}
                  </p>
                </div>
              </div>
              {product.stock > 0 && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <div className="bg-slate-950 text-white p-3 rounded-2xl shadow-xl">
                    <Plus className="w-5 h-5" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cart / Checkout */}
      <div className="w-full lg:w-[450px] bg-white border border-slate-100 rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-slate-950 rounded-2xl rotate-3 shadow-lg shadow-slate-200">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-xl text-slate-950 uppercase italic tracking-tighter">Current Order</h3>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">Point of Sale Terminal</p>
            </div>
          </div>
          <span className="bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-200">
            {cart.length} Models
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {cart.map((item) => (
            <div key={item.productId} className="flex gap-5 group animate-in slide-in-from-right-4 duration-300">
              <div className="w-20 h-20 bg-slate-50 rounded-2xl flex-shrink-0 overflow-hidden border border-slate-100 ring-4 ring-transparent group-hover:ring-indigo-50 transition-all duration-300">
                <img 
                   src={products?.find(p => p.id === item.productId)?.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-950 truncate uppercase italic tracking-tight">{item.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 mb-3">{formatCurrency(item.price)}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 bg-slate-50 rounded-[1rem] px-3 py-1.5 border border-slate-100">
                    <button 
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-black w-6 text-center text-slate-950">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.productId)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20 grayscale opacity-40">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center border border-slate-100">
                <ShoppingCart className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed">Cart Is Empty.<br/>Select Products to Begin.</p>
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-50 space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <span>Subtotal Estimation</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between items-baseline pt-4 border-t border-slate-100 overflow-hidden">
              <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest">Order Total</span>
              <span className="text-4xl font-black text-slate-950 tracking-tighter italic">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">Payment Method</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'cash', icon: Banknote, label: 'Cash' },
                { id: 'card', icon: CreditCard, label: 'Card' },
                { id: 'transfer', icon: ArrowRight, label: 'Digital' },
              ].map((method) => (
                <button 
                  key={method.id}
                  onClick={() => setActivePaymentMethod(method.id as any)}
                  className={cn(
                    "flex flex-col items-center gap-3 p-5 rounded-[1.5rem] border-2 transition-all group",
                    activePaymentMethod === method.id 
                      ? "bg-slate-950 border-slate-950 text-white shadow-2xl shadow-slate-200 scale-105" 
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                  )}
                >
                  <method.icon className={cn("w-6 h-6", activePaymentMethod === method.id ? "text-indigo-400" : "text-slate-300 group-hover:text-slate-400")} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Received Amount</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {[remaining, 50000, 100000, 200000].map(amt => (
                  <button 
                    key={amt}
                    type="button"
                    onClick={() => setCurrentAmount(amt.toString())}
                    className="px-4 py-2 text-[9px] font-black uppercase tracking-widest bg-white border border-slate-100 rounded-xl hover:bg-slate-950 hover:text-white transition-all shadow-sm"
                  >
                    {amt === remaining ? 'Uang Pas' : formatCurrency(amt)}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter amount..."
                  className="flex-1 px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none font-black text-2xl tracking-tight text-slate-950"
                  value={formatInputNumber(currentAmount)}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                />
                <button 
                  onClick={addPayment}
                  disabled={!currentAmount || parseInputNumber(currentAmount) <= 0}
                  className="px-6 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>

            {payments.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                {payments.map((p, i) => (
                  <div key={i} className="flex justify-between items-center px-4 py-3 bg-white rounded-xl border border-slate-100 text-[10px] font-bold">
                    <div className="flex items-center gap-2">
                      <span className="uppercase text-indigo-600">{p.method}</span>
                      <span className="text-slate-950">{formatCurrency(p.amount)}</span>
                    </div>
                    <button onClick={() => removePayment(i)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 px-5 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid</span>
                <span className="font-black text-lg text-slate-950 tracking-tight">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex flex-col gap-1 px-5 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className={cn("absolute left-0 top-0 w-1 h-full", remaining > 0 ? "bg-amber-500" : "bg-emerald-500")} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{remaining > 0 ? 'Remaining' : 'Change'}</span>
                <span className={cn("font-black text-lg tracking-tight", remaining > 0 ? "text-amber-600" : "text-emerald-600")}>
                  {remaining > 0 ? formatCurrency(remaining) : formatCurrency(change)}
                </span>
              </div>
            </div>
          </div>

          <button 
            disabled={cart.length === 0 || totalPaid < total}
            onClick={handleCheckout}
            className={cn(
              "w-full py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95",
              cart.length > 0 && totalPaid >= total
                ? "bg-indigo-600 text-white hover:bg-slate-950 shadow-indigo-100" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
          >
            Finalize Transaction
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-500">
          <div className="bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
            <CheckCircle2 className="w-6 h-6" />
            <div>
              <p className="font-bold">Transaksi Berhasil!</p>
              <p className="text-xs text-emerald-100">Stok produk telah diperbarui otomatis.</p>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {lastTransaction && (
        <Receipt 
          transaction={lastTransaction} 
          onClose={() => setLastTransaction(null)} 
        />
      )}
    </div>
  );
}
