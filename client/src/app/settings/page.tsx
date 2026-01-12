"use client";

import { useState, useEffect } from "react";
import { Save, Building, AlertTriangle } from "lucide-react";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";

export default function SettingsPage() {
  const { data: rawSettings = [], isLoading: loading } = useSettings();
  const updateSettings = useUpdateSettings();
  
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (rawSettings.length > 0) {
      const map: Record<string, string> = {};
      rawSettings.forEach((s) => {
        map[s.key] = s.value;
      });
      setSettingsMap(map);
    }
  }, [rawSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const settingsArray = Object.entries(settingsMap).map(([key, value]) => ({ key, value }));
      await updateSettings.mutateAsync(settingsArray);
      alert("Settings saved successfully.");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings.");
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettingsMap(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading configuration...</div>;

  const saving = updateSettings.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Configure global application parameters.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Company Settings */}
        <section className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center space-x-3">
            <div className="bg-slate-50 p-2 rounded-lg">
              <Building className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Company Profile</h3>
              <p className="text-xs text-slate-400">Used for reports and documents.</p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Company Name</label>
              <input
                type="text"
                value={settingsMap["companyName"] || ""}
                onChange={(e) => handleChange("companyName", e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-300 transition-all text-sm"
                placeholder="My Company Inc."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Support Email</label>
              <input
                type="email"
                value={settingsMap["supportEmail"] || ""}
                onChange={(e) => handleChange("supportEmail", e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-300 transition-all text-sm"
                placeholder="support@example.com"
              />
            </div>
            <div className="col-span-full space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Address</label>
              <textarea
                value={settingsMap["address"] || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-300 transition-all text-sm h-24 resize-none"
                placeholder="123 Business St, Tech City..."
              />
            </div>
          </div>
        </section>

        {/* Inventory Settings */}
        <section className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center space-x-3">
            <div className="bg-slate-50 p-2 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Inventory Logic</h3>
              <p className="text-xs text-slate-400">Configure thresholds and automated behaviors.</p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Threshold</label>
              <div className="relative">
                <input
                  type="number"
                  value={settingsMap["lowStockThreshold"] || "10"}
                  onChange={(e) => handleChange("lowStockThreshold", e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-300 transition-all text-sm"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">units</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Products below this amount will appear in Alerts.</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Currency Symbol</label>
              <select
                value={settingsMap["currency"] || "$"}
                onChange={(e) => handleChange("currency", e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-300 transition-all text-sm appearance-none"
              >
                <option value="$">USD ($)</option>
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
                <option value="¥">JPY (¥)</option>
              </select>
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center space-x-2 px-8 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
