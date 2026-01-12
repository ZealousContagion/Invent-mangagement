"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Settings2,
  Calendar,
  History,
  Package,
  User
} from "lucide-react";
import { useMovements } from "@/hooks/useMovements";
import { format } from "date-fns";

export default function MovementsPage() {
  const { data: movements = [], isLoading } = useMovements();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredMovements = movements.filter(m => {
    const matchesSearch = m.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'IN': return 'bg-emerald-100 text-emerald-600 border-emerald-100';
      case 'OUT': return 'bg-red-100 text-red-600 border-red-100';
      case 'ADJUSTMENT': return 'bg-blue-100 text-blue-600 border-blue-100';
      default: return 'bg-slate-100 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Stock History</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium italic">Complete audit trail of every item moving through your warehouse.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product, SKU, or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border-none rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${typeFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
              }`}
          >
            All
          </button>
          <button
            onClick={() => setTypeFilter("IN")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${typeFilter === "IN" ? "bg-emerald-600 text-white" : "bg-slate-50 text-slate-400 hover:bg-emerald-50"
              }`}
          >
            Inbound
          </button>
          <button
            onClick={() => setTypeFilter("OUT")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${typeFilter === "OUT" ? "bg-red-600 text-white" : "bg-slate-50 text-slate-400 hover:bg-red-50"
              }`}
          >
            Outbound
          </button>
          <button
            onClick={() => setTypeFilter("ADJUSTMENT")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${typeFilter === "ADJUSTMENT" ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400 hover:bg-blue-50"
              }`}
          >
            Adjustments
          </button>
        </div>
      </div>

      {/* Movements List/Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
            <tr>
              <th className="px-10 py-6">Timestamp & Product</th>
              <th className="px-10 py-6">Reference / Reason</th>
              <th className="px-10 py-6 text-center">Type</th>
              <th className="px-10 py-6 text-right">Quantity</th>
              <th className="px-10 py-6 text-right">User</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              [1, 2, 3, 4, 5].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-10 py-6"><div className="h-4 bg-slate-50 rounded" /></td>
                </tr>
              ))
            ) : filteredMovements.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-10 py-20 text-center text-slate-400 font-bold italic">
                  No records found matching your filters.
                </td>
              </tr>
            ) : (
              filteredMovements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="text-[10px] font-black text-slate-400 tabular-nums">
                        {format(new Date(m.createdAt), 'MMM dd, HH:mm')}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-tight">{m.product.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{m.product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="text-xs font-bold text-slate-600 max-w-[300px] truncate group-hover:whitespace-normal">
                      {m.reason || "General Stock Update"}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getTypeStyles(m.type)}`}>
                      {m.type}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className={`text-sm font-black flex items-center justify-end gap-1.5 ${m.type === 'IN' ? 'text-emerald-600' : m.type === 'OUT' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                      {m.type === 'IN' ? '+' : ''}{m.quantity}
                      <span className="text-[10px] opacity-40">units</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="w-3 h-3 text-slate-400" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {m.employee?.name || "System"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 flex items-center gap-6">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <ArrowDownLeft className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Inbound</p>
            <p className="text-2xl font-black text-slate-900">{movements.filter(m => m.type === 'IN').length} Events</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 flex items-center gap-6">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
            <ArrowUpRight className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Outbound</p>
            <p className="text-2xl font-black text-slate-900">{movements.filter(m => m.type === 'OUT').length} Events</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 flex items-center gap-6">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
            <History className="w-7 h-7 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adjustments</p>
            <p className="text-2xl font-black text-slate-900">{movements.filter(m => m.type === 'ADJUSTMENT').length} Events</p>
          </div>
        </div>
      </div>
    </div>
  );
}