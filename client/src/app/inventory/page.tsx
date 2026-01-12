"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  RefreshCw,
  Download,
  Image as ImageIcon,
  X,
  QrCode,
  Edit2,
  Trash2
} from "lucide-react";
import StockAdjustmentModal from "@/components/StockAdjustmentModal";
import QRCodeModal from "@/components/QRCodeModal";
import { exportToCSV } from "@/lib/utils";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import api from "@/lib/api";

export default function InventoryPage() {
  const { data: products = [], isLoading: loading } = useProducts();
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedProductForQR, setSelectedProductForQR] = useState<any | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    price: "",
    quantity: "",
    categoryId: "",
    supplierId: "",
    reorderPoint: "10",
    targetStockLevel: "50"
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data } = await api.get('/suppliers');
      return data;
    },
  });

  const handleExport = () => {
    const dataToExport = filteredProducts.map(p => ({
      SKU: p.sku,
      Name: p.name,
      Category: p.category?.name || "N/A",
      Price: p.price,
      Stock: p.quantity,
    }));
    exportToCSV(dataToExport, `inventory_export_${new Date().toISOString().split('T')[0]}`);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = editingProduct?.imageUrl || null;
      if (selectedFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", selectedFile);
        const uploadRes = await api.post("/uploads", formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = uploadRes.data.url;
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        reorderPoint: parseInt(formData.reorderPoint),
        targetStockLevel: parseInt(formData.targetStockLevel),
        supplierId: formData.supplierId || null,
        imageUrl
      };

      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, data: productData });
      } else {
        await createProduct.mutateAsync(productData);
      }

      setFormData({
        sku: "", name: "", description: "", price: "", quantity: "",
        categoryId: "", supplierId: "", reorderPoint: "10", targetStockLevel: "50"
      });
      setSelectedFile(null);
      setIsAdding(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct.mutateAsync(id);
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product.");
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;
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

      {(isAdding || editingProduct) && (
        <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-slate-900 mb-6">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
          <form onSubmit={handleSubmitProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Supplier</label>
              <select
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-300 transition-all text-sm appearance-none"
              >
                <option value="">Select supplier...</option>
                {suppliers.map((sup: any) => <option key={sup.id} value={sup.id}>{sup.name}</option>)}
              </select>
            </div>
            {["reorderPoint", "targetStockLevel"].map((field) => (
              <div key={field} className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{field.replace(/([A-Z])/g, ' $1')}</label>
                <input
                  type="number"
                  required
                  value={(formData as any)[field]}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-300 transition-all text-sm"
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer border border-slate-200 rounded-lg bg-slate-50"
              />
            </div>
            <div className="lg:col-span-3 flex justify-end pt-4 gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingProduct(null);
                  setFormData({
                    sku: "", name: "", description: "", price: "", quantity: "",
                    categoryId: "", supplierId: "", reorderPoint: "10", targetStockLevel: "50"
                  });
                }}
                className="px-8 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createProduct.isPending || updateProduct.isPending}
                className="px-8 py-2.5 bg-black text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {editingProduct ? (updateProduct.isPending ? "Updating..." : "Update Product") : (createProduct.isPending ? "Save Product" : "Save Product")}
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
                        {product.category?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${product.quantity === 0 ? 'text-red-500' : product.quantity < product.reorderPoint ? 'text-amber-500' : 'text-slate-900'}`}>
                          {product.quantity}
                        </span>
                        {product.quantity < product.reorderPoint && (
                          <span className="text-[10px] text-amber-600 font-medium">Below reorder pt ({product.reorderPoint})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedProductForQR(product)} className="p-2 text-slate-400 hover:text-slate-900 rounded-lg transition-colors" title="QR Code"><QrCode className="w-4 h-4" /></button>
                        <button onClick={() => setSelectedProduct(product)} className="p-2 text-slate-400 hover:text-slate-900 rounded-lg transition-colors" title="Adjust Stock"><RefreshCw className="w-4 h-4" /></button>
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setFormData({
                              sku: product.sku,
                              name: product.name,
                              description: product.description || "",
                              price: product.price.toString(),
                              quantity: product.quantity.toString(),
                              categoryId: product.categoryId,
                              supplierId: product.supplierId || "",
                              reorderPoint: product.reorderPoint.toString(),
                              targetStockLevel: product.targetStockLevel.toString()
                            });
                            setIsAdding(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProduct && <StockAdjustmentModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      {selectedProductForQR && <QRCodeModal product={selectedProductForQR} onClose={() => setSelectedProductForQR(null)} />}
    </div>
  );
}