"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  RefreshCw, 
  Download, 
  Image as ImageIcon,
  X,
  QrCode
} from "lucide-react";
import StockAdjustmentModal from "@/components/StockAdjustmentModal";
import QRCodeModal from "@/components/QRCodeModal";
import { exportToCSV } from "@/lib/utils";

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  category: { id: string; name: string };
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductForQR, setSelectedProductForQR] = useState<Product | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    price: "",
    quantity: "",
    categoryId: ""
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:3001/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:3001/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleExport = () => {
    const dataToExport = filteredProducts.map(p => ({
      SKU: p.sku,
      Name: p.name,
      Category: p.category.name,
      Price: p.price,
      Stock: p.quantity,
    }));
    exportToCSV(dataToExport, `inventory_export_${new Date().toISOString().split('T')[0]}`);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = null;
      if (selectedFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", selectedFile);
        const uploadRes = await axios.post("http://localhost:3001/uploads", formDataUpload);
        imageUrl = uploadRes.data.url;
      }
      await axios.post("http://localhost:3001/products", {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        imageUrl
      });
      setFormData({ sku: "", name: "", description: "", price: "", quantity: "", categoryId: "" });
      setSelectedFile(null);
      setIsAdding(false);
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory</h2>
          <p className="text-sm text-slate-500 mt-1">Manage and track your products.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`
            flex items-center space-x-2 px-5 py-2 rounded-lg font-medium transition-all text-sm
            ${isAdding 
              ? "bg-slate-100 text-slate-700 hover:bg-slate-200" 
              : "bg-black text-white hover:bg-slate-800 shadow-sm"
            }
          `}
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isAdding ? "Cancel" : "Add Product"}</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-slate-900 mb-6">New Product</h3>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {["sku", "name", "price", "quantity"].map((field) => (
              <div key={field} className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{field}</label>
                <input
                  type={field === "price" || field === "quantity" ? "number" : "text"}
                  step={field === "price" ? "0.01" : "1"}
                  required
                  value={(formData as any)[field]}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-300 transition-all text-sm"
                  placeholder={`Enter ${field}...`}
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-300 transition-all text-sm appearance-none"
              >
                <option value="">Select category...</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer border border-slate-200 rounded-lg bg-slate-50"
              />
            </div>
            <div className="lg:col-span-3 flex justify-end pt-4">
              <button type="submit" className="px-8 py-2.5 bg-black text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-all">
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-200 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-3 pr-8 py-2 border border-slate-100 rounded-lg bg-white text-xs font-bold text-slate-600 appearance-none focus:outline-none focus:border-slate-300"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <button onClick={handleExport} className="p-2 border border-slate-100 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                {["Product", "SKU", "Category", "Price", "Stock", ""].map((h) => (
                  <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm animate-pulse">Loading...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">No products found.</td></tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-slate-300" />}
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{product.sku}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {product.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-bold ${product.quantity === 0 ? 'text-red-500' : product.quantity < 10 ? 'text-amber-500' : 'text-slate-900'}`}>{product.quantity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedProductForQR(product)} className="p-2 text-slate-400 hover:text-slate-900 rounded-lg transition-colors"><QrCode className="w-4 h-4" /></button>
                        <button onClick={() => setSelectedProduct(product)} className="p-2 text-slate-400 hover:text-slate-900 rounded-lg transition-colors"><RefreshCw className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProduct && <StockAdjustmentModal product={selectedProduct} axios={axios} onClose={() => setSelectedProduct(null)} onSuccess={fetchProducts} />}
      {selectedProductForQR && <QRCodeModal product={selectedProductForQR} onClose={() => setSelectedProductForQR(null)} />}
    </div>
  );
}