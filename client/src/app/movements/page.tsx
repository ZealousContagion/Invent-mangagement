"use client";

import { ArrowDownLeft, ArrowUpRight, RefreshCw, Download, Calendar, Package } from "lucide-react";
import { exportToCSV } from "@/lib/utils";
import { useMovements } from "@/hooks/useMovements";

export default function StockMovementsPage() {
  const { data: movements = [], isLoading: loading } = useMovements();

  const handleExport = () => {
    const dataToExport = movements.map(m => ({
      Date: new Date(m.createdAt).toLocaleDateString(),
      Time: new Date(m.createdAt).toLocaleTimeString(),
      Product: m.product.name,
      SKU: m.product.sku,
      Type: m.type,
      Quantity: m.quantity,
      Employee: m.employee?.name || "-",
      Reason: m.reason || ""
    }));
    exportToCSV(dataToExport, `stock_movements_export_${new Date().toISOString().split('T')[0]}`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "IN":
      case "CHECK_IN":
        return <ArrowDownLeft className="w-4 h-4 text-emerald-600" />;
      case "OUT":
      case "CHECK_OUT":
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      default:
        return <RefreshCw className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "IN":
      case "CHECK_IN":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "OUT":
      case "CHECK_OUT":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Stock Movements</h2>
          <p className="text-slate-500 mt-1">Audit trail of all inventory adjustments.</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center space-x-2 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 font-medium transition-colors bg-white shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export History</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity Change</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 animate-pulse">
                    Loading history...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Calendar className="w-8 h-8 opacity-20" />
                      <p>No movements recorded yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{new Date(movement.createdAt).toLocaleDateString()}</span>
                        <span className="text-xs text-slate-500">{new Date(movement.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-slate-100 p-2 rounded-lg">
                          <Package className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{movement.product.name}</div>
                          <div className="text-xs text-slate-400 font-mono">{movement.product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getTypeStyle(movement.type)}`}>
                        {getTypeIcon(movement.type)}
                        <span>{movement.type.replace("_", " ")}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`font-mono font-bold ${movement.quantity > 0 ? "text-emerald-600" : "text-slate-900"}`}>
                          {movement.quantity > 0 ? "+" : ""}{movement.quantity}
                        </span>
                        {movement.employee && (
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-1 w-fit">
                            {movement.employee.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                      {movement.reason || <span className="text-slate-300 italic">No reason provided</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}