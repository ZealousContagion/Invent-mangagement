"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { AlertTriangle, RefreshCw, CheckCircle2 } from "lucide-react";
import StockAdjustmentModal from "@/components/StockAdjustmentModal";

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  category: { name: string };
}

export default function AlertsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchLowStock();
  }, []);

  const fetchLowStock = async () => {
    try {
      const response = await axios.get("http://localhost:3001/products/low-stock");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Low Stock Alerts</h2>
        <p className="text-slate-500 mt-1">Items requiring immediate attention (Stock &lt; 10).</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-red-50 border-b border-red-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-red-800 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-red-800 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-xs font-bold text-red-800 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-red-800 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-red-800 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 animate-pulse">
                    Checking stock levels...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <CheckCircle2 className="w-12 h-12 text-emerald-500 opacity-50" />
                      <p className="text-emerald-700 font-medium">All stock levels are healthy!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-red-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <span className="font-semibold text-slate-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">{product.sku}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {product.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-red-600">
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedProduct(product)}
                        className="inline-flex items-center space-x-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Restock</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProduct && (
        <StockAdjustmentModal
          product={selectedProduct}
          axios={axios}
          onClose={() => setSelectedProduct(null)}
          onSuccess={fetchLowStock}
        />
      )}
    </div>
  );
}
