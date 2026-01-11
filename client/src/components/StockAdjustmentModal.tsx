"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
}

interface Employee {
  id: string;
  name: string;
}

interface StockAdjustmentModalProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
  axios: any;
}

export default function StockAdjustmentModal({ product, onClose, onSuccess, axios }: StockAdjustmentModalProps) {
  const [formData, setFormData] = useState({
    quantity: "",
    type: "IN",
    reason: "",
    employeeId: ""
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch employees if needed
    if (formData.type === "CHECK_IN" || formData.type === "CHECK_OUT") {
      fetchEmployees();
    }
  }, [formData.type]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:3001/employees");
      setEmployees(res.data);
    } catch (error) {
      console.error("Error fetching employees", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`http://localhost:3001/products/${product.id}/adjust`, {
        quantity: parseInt(formData.quantity),
        type: formData.type,
        reason: formData.reason,
        employeeId: formData.employeeId || undefined
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adjusting stock:", error);
      alert("Failed to adjust stock.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Adjust Stock</h3>
            <p className="text-sm text-gray-500">{product.name} ({product.sku})</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Movement Type</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {["IN", "OUT", "ADJUSTMENT"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: t })}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                    formData.type === t
                      ? "bg-blue-600 border-blue-600 text-white shadow-md"
                      : "bg-white border-gray-200 text-gray-600 hover:border-blue-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {["CHECK_OUT", "CHECK_IN"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: t })}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                    formData.type === t
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                      : "bg-white border-gray-200 text-indigo-600 hover:border-indigo-200"
                  }`}
                >
                  {t.replace("_", " ")}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-gray-400 italic">
              {formData.type === "IN" && "Add to current stock"}
              {formData.type === "OUT" && "Subtract from current stock"}
              {formData.type === "ADJUSTMENT" && "Set stock to exact value"}
              {formData.type === "CHECK_OUT" && "Assign to an employee (Stock -)"}
              {formData.type === "CHECK_IN" && "Return from an employee (Stock +)"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.type === "ADJUSTMENT" ? "New Total Quantity" : "Quantity Change"}
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 1"
            />
          </div>

          {(formData.type === "CHECK_IN" || formData.type === "CHECK_OUT") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
              <select
                required
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Staff --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Note</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
              placeholder="e.g. Project X, Damaged return..."
            />
          </div>

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
