import React, { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Product, type TransactionItem, type Transaction } from '../lib/db';
import { formatCurrency, cn } from '../lib/utils';
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
                <span>Mode: ${transaction.paymentMethod.toUpperCase()}</span>
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
              <div className="flex justify-between text-xs">
                <span>BAYAR</span>
                <span>${formatCurrency(transaction.customerName ? parseInt(transaction.customerName) : 0)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>KEMBALI</span>
                <span>${formatCurrency((transaction.customerName ? parseInt(transaction.customerName) : 0) - transaction.totalAmount)}</span>
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
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
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
        price: product.price,
        quantity: 1,
        subtotal: product.price
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
  const change = Math.max(0, (parseInt(paymentAmount) || 0) - total);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    const paymentVal = parseInt(paymentAmount) || 0;
    if (paymentMethod === 'cash' && paymentVal < total) {
      alert('Nominal bayar kurang!');
      return;
    }

    const transaction: Transaction = {
      items: cart,
      totalAmount: total,
      paymentMethod,
      timestamp: Date.now(),
      customerName: paymentMethod === 'cash' ? paymentAmount : total.toString() // Store payment amount
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
    setPaymentAmount('');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-12rem)]">
      {/* Product Selection */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari produk berdasarkan nama atau SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm text-lg"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
          {filteredProducts?.map((product) => (
            <button 
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={cn(
                "group relative bg-white border border-slate-200 rounded-2xl p-4 text-left transition-all hover:shadow-lg hover:border-indigo-200",
                product.stock <= 0 && "opacity-60 grayscale cursor-not-allowed"
              )}
            >
              <div className="aspect-square bg-slate-100 rounded-xl mb-4 overflow-hidden border border-slate-100">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{product.brand}</p>
                <h4 className="font-bold text-slate-900 truncate">{product.name}</h4>
                <div className="flex items-center justify-between mt-2">
                  <p className="font-bold text-slate-900">{formatCurrency(product.price)}</p>
                  <p className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    product.stock > 5 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  )}>
                    Stok: {product.stock}
                  </p>
                </div>
              </div>
              {product.stock > 0 && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cart / Checkout */}
      <div className="w-full lg:w-[400px] bg-white border border-slate-200 rounded-3xl flex flex-col shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-lg">Keranjang</h3>
          </div>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
            {cart.length} Item
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.map((item) => (
            <div key={item.productId} className="flex gap-4">
              <div className="w-16 h-16 bg-slate-100 rounded-xl flex-shrink-0 overflow-hidden border border-slate-200">
                <img 
                  src={products?.find(p => p.id === item.productId)?.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                <p className="text-xs text-slate-500 mb-2">{formatCurrency(item.price)}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 bg-slate-100 rounded-lg px-2 py-1">
                    <button 
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="p-1 hover:bg-white rounded-md transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="p-1 hover:bg-white rounded-md transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.productId)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-400 text-sm">Keranjang masih kosong.<br/>Pilih produk untuk memulai.</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50/80 border-t border-slate-100 space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-slate-500 text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold text-xl pt-3 border-t border-slate-200">
              <span>Total</span>
              <span className="text-indigo-600">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Metode Pembayaran</p>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setPaymentMethod('cash')}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                  paymentMethod === 'cash' ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-white border-slate-200 text-slate-500 hover:border-indigo-200"
                )}
              >
                <Banknote className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase">Tunai</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('card')}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                  paymentMethod === 'card' ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-white border-slate-200 text-slate-500 hover:border-indigo-200"
                )}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase">Kartu</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('transfer')}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                  paymentMethod === 'transfer' ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-white border-slate-200 text-slate-500 hover:border-indigo-200"
                )}
              >
                <ArrowRight className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase">QRIS</span>
              </button>
            </div>
          </div>

          {paymentMethod === 'cash' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nominal Bayar</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {[total, 50000, 100000, 200000].map(amt => (
                    <button 
                      key={amt}
                      type="button"
                      onClick={() => setPaymentAmount(amt.toString())}
                      className="px-3 py-1 text-[10px] font-bold bg-white border border-slate-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-all"
                    >
                      {amt === total ? 'Uang Pas' : formatCurrency(amt)}
                    </button>
                  ))}
                </div>
                <input 
                  type="number" 
                  placeholder="Masukkan jumlah uang..."
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-bold text-lg"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
              <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <span className="text-xs font-bold text-indigo-600 uppercase">Kembalian</span>
                <span className="font-black text-indigo-700">{formatCurrency(change)}</span>
              </div>
            </div>
          )}

          <button 
            disabled={cart.length === 0 || (paymentMethod === 'cash' && (parseInt(paymentAmount) || 0) < total)}
            onClick={handleCheckout}
            className={cn(
              "w-full py-4 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-3 shadow-xl",
              cart.length > 0 && (paymentMethod !== 'cash' || (parseInt(paymentAmount) || 0) >= total)
                ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200" 
                : "bg-slate-300 cursor-not-allowed"
            )}
          >
            Selesaikan Transaksi
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
