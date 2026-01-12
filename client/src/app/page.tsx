"use client";

import {
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  DollarSign,
  ShoppingCart,
  Clock,
  ChevronRight,
  Loader2,
  Plus
} from "lucide-react";
import { useStats } from "@/hooks/useStats";
import { useReorderSuggestions, useProducts } from "@/hooks/useProducts";
import { useCreatePurchaseOrder } from "@/hooks/usePurchaseOrders";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const CHART_COLORS = ['#0f172a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const { data: products = [] } = useProducts();
  const { data: stats = {
    totalProducts: 0,
    totalCategories: 0,
    lowStockProducts: 0,
    recentMovements: 0,
    totalValue: 0,
    categoryData: []
  }, isLoading: statsLoading } = useStats();

  const { data: suggestions = [], isLoading: suggestionsLoading } = useReorderSuggestions();
  const createPO = useCreatePurchaseOrder();

  const handleQuickOrder = async (suggestion: any) => {
    if (!suggestion.supplierId) return;

    try {
      await createPO.mutateAsync({
        supplierId: suggestion.supplierId,
        items: [{
          productId: suggestion.id,
          quantity: suggestion.suggestedOrderQuantity,
          unitPrice: suggestion.price
        }]
      });
      alert(`Purchase order created for ${suggestion.name}!`);
    } catch (error) {
      console.error("Failed to create quick order:", error);
    }
  };

  const statCards = [
    { label: "Total Inventory Value", value: `$${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign },
    { label: "Total Products", value: stats.totalProducts, icon: Package },
    { label: "Low Stock Items", value: stats.lowStockProducts, icon: AlertTriangle },
    { label: "Recent Movements (7d)", value: stats.recentMovements, icon: ArrowUpRight },
  ];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          <p className="text-slate-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time inventory metrics and performance.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-lg border border-slate-100 shadow-sm">
          <Clock className="w-3.5 h-3.5" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-slate-200 group">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 group-hover:bg-slate-900 group-hover:border-slate-900 transition-colors">
                <stat.icon className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reorder Suggestions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Reorder Suggestions</h3>
              <p className="text-xs text-slate-500 mt-0.5">Automated procurement recommendations.</p>
            </div>
            <ShoppingCart className="w-5 h-5 text-slate-400" />
          </div>

          <div className="flex-1 overflow-y-auto max-h-[400px]">
            {suggestionsLoading ? (
              <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 text-slate-300 animate-spin" /></div>
            ) : suggestions.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Package className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm">All stock levels are optimal.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {suggestions.map((p) => (
                  <div key={p.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                      {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover rounded-lg" /> : p.sku.substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{p.name}</h4>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-bold text-amber-600 bg-amber-50 px-1.5 rounded">Stock: {p.quantity}</span>
                        <span>•</span>
                        <span>Supplier: {p.supplier?.name || "None"}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Suggest</p>
                        <span className="bg-slate-50 text-slate-900 text-xs font-black px-2.5 py-1 rounded-full border border-slate-200">
                          +{p.suggestedOrderQuantity}
                        </span>
                      </div>
                      <button
                        onClick={() => handleQuickOrder(p)}
                        disabled={!p.supplierId || createPO.isPending}
                        className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-95 transition-all disabled:opacity-20 disabled:shadow-none"
                        title={p.supplierId ? "Create Purchase Order" : "No supplier assigned"}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <Link href="/inventory" className="text-xs font-bold text-slate-600 flex items-center justify-center gap-2 hover:text-slate-900 transition-colors">
              Manage Inventory <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-slate-400" />
            Inventory Value by Category
          </h3>

          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categoryData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                  itemStyle={{ fontWeight: 800, fontSize: '12px', color: '#0f172a' }}
                  labelStyle={{ fontWeight: 800, fontSize: '10px', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}
                  formatter={(value: any) => [`$${value.toLocaleString()}`, 'Value']}
                />
                <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={32}>
                  {(stats.categoryData || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}