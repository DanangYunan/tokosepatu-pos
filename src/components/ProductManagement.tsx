import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Product } from '../lib/db';
import { formatCurrency } from '../lib/utils';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Image as ImageIcon,
  X
} from 'lucide-react';

export default function ProductManagement() {
  const products = useLiveQuery(() => db.products.toArray());
  const settings = useLiveQuery(() => db.settings.toCollection().first());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    brand: '',
    category: 'Running',
    purchasePrice: 0,
    sellingPrice: 0,
    stock: 0,
    size: '',
    sku: '',
  });

  const calculateSellingPrice = (purchasePrice: number) => {
    if (!settings) return purchasePrice;
    if (settings.marginType === 'percentage') {
      return purchasePrice + (purchasePrice * settings.marginValue / 100);
    } else {
      return purchasePrice + settings.marginValue;
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({ 
        name: '', 
        brand: '', 
        category: 'Running', 
        purchasePrice: 0, 
        sellingPrice: 0, 
        stock: 0, 
        size: '', 
        sku: '' 
      });
    }
    setIsModalOpen(true);
  };

  const formatInputNumber = (val: number | string) => {
    if (!val && val !== 0) return '';
    const num = typeof val === 'string' ? val.replace(/\D/g, '') : val.toString();
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseInputNumber = (val: string) => {
    return Number(val.replace(/\D/g, '')) || 0;
  };

  const handlePurchasePriceChange = (val: string) => {
    const rawValue = parseInputNumber(val);
    const selling = calculateSellingPrice(rawValue);
    setFormData({ ...formData, purchasePrice: rawValue, sellingPrice: selling });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      ...formData as Product,
      imageUrl: formData.imageUrl || `https://picsum.photos/seed/${formData.name}/400/400`,
      createdAt: formData.createdAt || Date.now()
    };

    if (editingProduct?.id) {
      await db.products.update(editingProduct.id, productData);
    } else {
      await db.products.add(productData);
    }
    
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await db.products.delete(id);
    }
  };

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-950 tracking-tight underline decoration-indigo-500 decoration-4 underline-offset-8">Inventory</h2>
          <p className="text-slate-500 font-medium mt-4">Manage your high-end footwear collection and stock levels.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="group flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-950 transition-all shadow-2xl shadow-indigo-200"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Add New Product
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row gap-6 items-center justify-between bg-slate-50/30">
          <div className="relative w-full sm:w-[28rem]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search by SKU, Model, or Brand..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all text-sm font-medium"
            />
          </div>
          <button className="flex items-center gap-3 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-slate-500 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
                <th className="px-8 py-6">Product Details</th>
                <th className="px-8 py-6">Reference No</th>
                <th className="px-8 py-6">Category</th>
                <th className="px-8 py-6">Buy / Sell</th>
                <th className="px-8 py-6">Availability</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts?.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex-shrink-0 overflow-hidden border border-slate-100 group-hover:scale-105 transition-transform duration-500">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-black text-slate-950 uppercase italic tracking-tight">{product.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{product.brand} • Size {product.size}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs font-black text-slate-400 tracking-widest">{product.sku}</td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Buy: {formatCurrency(product.purchasePrice)}</span>
                      <span className="text-sm font-black text-indigo-600 uppercase tracking-tight">Sell: {formatCurrency(product.sellingPrice)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${product.stock > 5 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'}`}></div>
                      <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{product.stock} Units</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(product);
                        }}
                        className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Edit Item"
                      >
                        <Edit2 className="w-4.5 h-4.5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (product.id) handleDelete(product.id);
                        }}
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!filteredProducts || filteredProducts.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                    No inventory records found. Add your first item.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-xl">
          <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white">
            <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div>
                <h3 className="font-black text-2xl text-slate-950 uppercase italic tracking-tighter">{editingProduct ? 'Update Collection' : 'Archive New Entry'}</h3>
                <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase mt-1">Footwear Management System</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Product Designation</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Air Jordan 1 Retro High"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-medium text-slate-950"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Brand Entity</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Nike"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-medium text-slate-950"
                    value={formData.brand}
                    onChange={e => setFormData({...formData, brand: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Reference ID (SKU)</label>
                  <input 
                    required
                    type="text" 
                    placeholder="NK-AJ1-01"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-black text-slate-950 tracking-widest uppercase italic"
                    value={formData.sku}
                    onChange={e => setFormData({...formData, sku: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Buy Price (IDR)</label>
                  <input 
                    required
                    type="text" 
                    placeholder="0"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-black text-slate-900"
                    value={formatInputNumber(formData.purchasePrice || 0)}
                    onChange={e => handlePurchasePriceChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Sell Price (IDR) – Auto Computed</label>
                  <input 
                    required
                    type="text" 
                    placeholder="0"
                    className="w-full px-6 py-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-black text-indigo-600"
                    value={formatInputNumber(formData.sellingPrice || 0)}
                    onChange={e => setFormData({...formData, sellingPrice: parseInputNumber(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Availability (Qty)</label>
                  <input 
                    required
                    type="number" 
                    placeholder="0"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-black text-slate-950"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Sizing Matrix</label>
                  <input 
                    required
                    type="text" 
                    placeholder="EU 42"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-medium text-slate-950"
                    value={formData.size}
                    onChange={e => setFormData({...formData, size: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Classification</label>
                  <select 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 outline-none transition-all font-black uppercase text-xs tracking-widest text-slate-950"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option>Running</option>
                    <option>Casual</option>
                    <option>Basketball</option>
                    <option>Formal</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-slate-950 rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                >
                  Commit Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
