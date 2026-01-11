"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight,
  DollarSign
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    lowStockProducts: 0,
    recentMovements: 0,
    totalValue: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("http://localhost:3001/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Inventory Value", value: `$${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign },
    { label: "Total Products", value: stats.totalProducts, icon: Package },
    { label: "Low Stock Items", value: stats.lowStockProducts, icon: AlertTriangle },
    { label: "Recent Movements (7d)", value: stats.recentMovements, icon: ArrowUpRight },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h2>
        <p className="text-sm text-slate-500 mt-1">Real-time inventory metrics and performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <stat.icon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h3>
          <div className="flex flex-col items-center justify-center h-56 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-100">
             <ArrowUpRight className="w-6 h-6 mb-2 opacity-30" />
            <p className="text-sm">Activity history is monitored on the Movements page.</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Stock Analytics</h3>
          <div className="flex flex-col items-center justify-center h-56 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-100">
             <TrendingUp className="w-6 h-6 mb-2 opacity-30" />
            <p className="text-sm">Advanced data visualization coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}