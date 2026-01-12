"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Package,
    ShoppingCart,
    ArrowUpRight,
    ArrowDownRight,
    Filter
} from "lucide-react";
import { useStats } from "@/hooks/useStats";

const COLORS = ["#000000", "#1e293b", "#475569", "#94a3b8", "#cbd5e1"];

export default function ReportsPage() {
    const { data: stats, isLoading } = useStats();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    const totalRevenue = stats?.monthlyData.reduce((sum, d) => sum + d.revenue, 0) || 0;
    const totalExpenses = stats?.monthlyData.reduce((sum, d) => sum + d.expenses, 0) || 0;
    const netProfit = totalRevenue - totalExpenses;

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Financial Reports</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Detailed breakdown of your business performance over the last 6 months.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">
                        <Filter className="w-4 h-4" /> Filter Period
                    </button>
                    <button className="px-5 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:shadow-xl hover:shadow-slate-900/20 transition-all">
                        Export PDF
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card
                    label="Total Revenue"
                    value={`$${totalRevenue.toLocaleString()}`}
                    icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
                    trend="+12.5%"
                    trendUp={true}
                    color="bg-emerald-50"
                />
                <Card
                    label="Total Expenses"
                    value={`$${totalExpenses.toLocaleString()}`}
                    icon={<TrendingDown className="w-5 h-5 text-red-500" />}
                    trend="+5.2%"
                    trendUp={false}
                    color="bg-red-50"
                />
                <Card
                    label="Net Profit"
                    value={`$${netProfit.toLocaleString()}`}
                    icon={<DollarSign className="w-5 h-5 text-slate-900" />}
                    trend="+18.3%"
                    trendUp={true}
                    color="bg-slate-100"
                />
                <Card
                    label="Inventory Value"
                    value={`$${(stats?.totalValue || 0).toLocaleString()}`}
                    icon={<Package className="w-5 h-5 text-slate-900" />}
                    trend="-2.4%"
                    trendUp={false}
                    color="bg-slate-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Monthly Trend Chart */}
                <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Revenue vs Expenses</h3>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-900 rounded-full" /> Revenue</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-300 rounded-full" /> Expenses</div>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.monthlyData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#0f172a"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expenses"
                                    stroke="#cbd5e1"
                                    strokeWidth={4}
                                    fill="transparent"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Top Products</h3>
                    <div className="space-y-6 flex-1">
                        {stats?.topProducts.map((product, idx) => (
                            <div key={idx} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">{product.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{product.quantity} Units Sold</p>
                                    </div>
                                </div>
                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-slate-900 rounded-full"
                                        style={{ width: `${(product.quantity / (stats.topProducts[0]?.quantity || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 p-6 bg-slate-50 rounded-[32px]">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 text-center">Best Seller</p>
                        <h4 className="text-lg font-black text-slate-900 text-center leading-tight mb-1">{stats?.topProducts[0]?.name}</h4>
                        <div className="flex items-center justify-center gap-2 text-emerald-600 font-black text-sm">
                            <TrendingUp className="w-4 h-4" /> Core Growth Asset
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inventory Valuation by Category */}
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Asset Allocation</h3>
                    <div className="h-[300px] flex items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats?.categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats?.categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend
                                    verticalAlign="middle"
                                    align="right"
                                    layout="vertical"
                                    formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Operations Summary */}
                <div className="bg-slate-900 p-10 rounded-[40px] text-white flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-white/10 rounded-2xl">
                                <ShoppingCart className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight">Operation Efficiency</h3>
                        </div>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10">
                            Your inventory turnover has increased by 8.4% compared to the previous period. High demand products are being restocked in under 12 days on average.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-2">
                        <div className="p-6 bg-white/5 rounded-[32px] border border-white/5">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Recent Turnovers</p>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-black">{stats?.recentMovements}</span>
                                <span className="text-xs font-bold text-emerald-400 mb-2">High</span>
                            </div>
                        </div>
                        <div className="p-6 bg-white/5 rounded-[32px] border border-white/5">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Low Stock Risks</p>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-black">{stats?.lowStockProducts}</span>
                                <span className="text-xs font-bold text-red-400 mb-2">Critical</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Card({ label, value, icon, trend, trendUp, color }: any) {
    return (
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 ${color} rounded-bl-full opacity-50 -mr-8 -mt-8 transition-all group-hover:scale-110`} />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl">
                        {icon}
                    </div>
                    <div className={`flex items-center text-[10px] font-black ${trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
                        {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trend}
                    </div>
                </div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</h4>
                <p className="text-2xl font-black text-slate-900">{value}</p>
            </div>
        </div>
    );
}
