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
  Plus,
  ArrowRight,
  Receipt,
  CheckCircle2,
  TrendingDown
} from "lucide-react";
import { useStats } from "@/hooks/useStats";
import { useReorderSuggestions, useProducts } from "@/hooks/useProducts";
import { useCreatePurchaseOrder } from "@/hooks/usePurchaseOrders";
import { useSalesOrders } from "@/hooks/useSalesOrders";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { format } from "date-fns";

const CHART_COLORS = ['#0f172a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: suggestions = [], isLoading: suggestionsLoading } = useReorderSuggestions();
  const { data: salesOrders = [] } = useSalesOrders();
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

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          <p className="text-slate-500 font-medium font-black uppercase text-[10px] tracking-widest">Loading business intelligence...</p>
        </div>
      </div>
    );
  }

  const recentSales = salesOrders.slice(0, 5);
  const totalRevenue = stats?.monthlyData.reduce((sum, d) => sum + d.revenue, 0) || 0;
  const totalExpenses = stats?.monthlyData.reduce((sum, d) => sum + d.expenses, 0) || 0;

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">System Overview</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium italic">Welcome back! Here's what's happening in your warehouse today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
            <Clock className="w-3.5 h-3.5" />
            Live Sync: <span className="text-slate-900">{format(new Date(), 'HH:mm:ss')}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          label="Estimated Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
          trend="Last 6 Months"
          color="bg-emerald-50"
        />
        <KPICard
          label="Total Expenses"
          value={`$${totalExpenses.toLocaleString()}`}
          icon={<Receipt className="w-5 h-5 text-red-500" />}
          trend="Operational Costs"
          color="bg-red-50"
        />
        <KPICard
          label="Inventory Assets"
          value={`$${(stats?.totalValue || 0).toLocaleString()}`}
          icon={<Package className="w-5 h-5 text-slate-900" />}
          trend={`${stats?.totalProducts} SKUs Active`}
          color="bg-slate-100"
        />
        <KPICard
          label="Risk Alerts"
          value={stats?.lowStockProducts || 0}
          icon={<AlertTriangle className="w-5 h-5 text-orange-500" />}
          trend="Low Stock Items"
          color="bg-orange-50"
          valueColor="text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Analytics */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Growth Analytics</h3>
            <Link href="/reports" className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 tracking-widest flex items-center gap-1 transition-colors">
              Full Report <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex-1 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.monthlyData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0f172a"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Sales Feed */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Live Sales Feed</h3>
          <div className="space-y-5 flex-1 overflow-y-auto">
            {recentSales.map((so) => (
              <div key={so.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-3xl border border-slate-50 group hover:border-slate-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${so.status === 'SHIPPED' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                    }`}>
                    {so.customer.name[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 leading-tight">{so.customer.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold">{so.orderNumber} • {format(new Date(so.date), 'MMM d')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">${so.totalAmount.toLocaleString()}</p>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${so.status === 'SHIPPED' ? 'text-emerald-500' : 'text-slate-400'
                    }`}>{so.status}</span>
                </div>
              </div>
            ))}
            {recentSales.length === 0 && (
              <div className="py-10 text-center opacity-30">
                <TrendingDown className="w-8 h-8 mx-auto mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">No recent sales</p>
              </div>
            )}
          </div>
          <Link href="/sales-orders" className="mt-8 py-4 bg-slate-900 text-white rounded-[24px] text-center text-xs font-black uppercase tracking-widest hover:shadow-xl hover:shadow-slate-900/20 active:scale-95 transition-all">
            Manage All Sales
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reorder Table */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-10 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Smart Restock Suggestions</h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full text-[9px] font-black text-amber-600 uppercase tracking-widest">
              <AlertTriangle className="w-3 h-3" /> Stock Priority
            </div>
          </div>
          <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar">
            {suggestions.length === 0 ? (
              <div className="p-20 text-center text-slate-300">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-4 opacity-10" />
                <p className="text-sm font-bold uppercase tracking-widest">Stock optimal</p>
              </div>
            ) : (
              suggestions.map((p) => (
                <div key={p.id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all overflow-hidden">
                    {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : p.sku.substring(0, 3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-black text-slate-900 truncate">{p.name}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      Current: <span className="text-red-500">{p.quantity}</span> • Ideal: {p.suggestedOrderQuantity + p.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => handleQuickOrder(p)}
                    disabled={!p.supplierId || createPO.isPending}
                    className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:shadow-slate-900/20 active:scale-95 transition-all disabled:opacity-20"
                  >
                    Quick Order <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Visualization */}
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col h-[600px] lg:h-auto">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Asset Liquidity by Category</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categoryData || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#0f172a', fontSize: 10, fontWeight: 900 }}
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`$${value.toLocaleString()}`, 'Total Value']}
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={40}>
                  {(stats.categoryData || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-50">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50/50 rounded-3xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Categories</p>
                <p className="text-2xl font-black text-slate-900">{stats?.totalCategories || 0}</p>
              </div>
              <div className="p-6 bg-slate-50/50 rounded-3xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Recent Activity</p>
                <p className="text-2xl font-black text-slate-900">+{stats?.recentMovements || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, icon, trend, color, valueColor = "text-slate-900" }: any) {
  return (
    <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm relative group transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-slate-200">
      <div className={`absolute top-0 right-0 w-24 h-24 ${color} rounded-bl-full opacity-50 -mr-8 -mt-8 transition-transform group-hover:scale-125`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl">
            {icon}
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
            {trend}
          </div>
        </div>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <h3 className={`text-3xl font-black tracking-tighter ${valueColor}`}>{value}</h3>
      </div>
    </div>
  );
}