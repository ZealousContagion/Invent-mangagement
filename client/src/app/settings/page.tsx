"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Bell,
  Shield,
  Globe,
  Zap,
  RefreshCcw,
  CheckCircle2,
  Image as ImageIcon,
  Plus
} from "lucide-react";
import { useSettings, useUpdateManySettings } from "@/hooks/useSettings";
import api from "@/lib/api";

export default function SettingsPage() {
  const { data: remoteSettings, isLoading } = useSettings();
  const updateSettings = useUpdateManySettings();
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (remoteSettings) {
      const mapped = remoteSettings.reduce((acc, s: any) => ({ ...acc, [s.key]: s.value }), {});
      setLocalSettings(mapped);
    }
  }, [remoteSettings]);

  const handleSave = async () => {
    const settingsArray = Object.entries(localSettings).map(([key, value]) => ({ key, value }));
    try {
      await updateSettings.mutateAsync(settingsArray);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/uploads", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setLocalSettings(prev => ({ ...prev, companyLogo: data.url }));
    } catch (error) {
      console.error("Logo upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Configuration</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium italic">Fine-tune the inventory engine to match your operational rhythms.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:shadow-2xl hover:shadow-slate-900/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {updateSettings.isPending ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaved ? "Settings Saved" : "Save Changes"}
        </button>
      </div>

      <div className="space-y-8">
        {/* Branding Section */}
        <section className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-indigo-50 rounded-2xl">
              <Zap className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Brand Identity</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Logo & Presentation</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="relative group">
              <div className="w-32 h-32 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-slate-300">
                {localSettings.companyLogo ? (
                  <img src={localSettings.companyLogo} alt="Logo Preview" className="w-full h-full object-contain p-4" />
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                    <span className="text-[10px] font-black text-slate-400 uppercase">No Logo</span>
                  </>
                )}
                <label className="absolute inset-0 cursor-pointer opacity-0 group-hover:opacity-100 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center transition-all">
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  <div className="text-white text-[10px] font-black uppercase flex items-center gap-2">
                    <Plus className="w-3 h-3" /> {uploading ? "..." : "Change"}
                  </div>
                </label>
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
                <input
                  type="text"
                  value={localSettings.companyName || "Inventory Pro"}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full px-6 py-4 bg-slate-50/50 border-none rounded-2xl text-lg font-black focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                  placeholder="Your Company Co."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Inventory Section */}
        <section className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-amber-50 rounded-2xl">
              <Bell className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Inventory Thresholds</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Stock Alert Parameters</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Low Stock Threshold</label>
              <input
                type="number"
                value={localSettings.lowStockThreshold || "10"}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, lowStockThreshold: e.target.value }))}
                className="w-full px-6 py-4 bg-slate-50/50 border-none rounded-2xl text-lg font-black focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
              />
              <p className="text-[10px] text-slate-400 font-medium ml-1">Items below this quantity will trigger red alert badges across the system.</p>
            </div>
          </div>
        </section>

        {/* Company Profile Section */}
        <section className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">System Identity</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Instance Branding</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
              <input
                type="text"
                value={localSettings.companyName || "Inventory Pro"}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, companyName: e.target.value }))}
                className="w-full px-6 py-4 bg-slate-50/50 border-none rounded-2xl text-lg font-black focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instance URL</label>
              <input
                type="text"
                value={localSettings.instanceUrl || "http://localhost:3000"}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, instanceUrl: e.target.value }))}
                className="w-full px-6 py-4 bg-slate-50/50 border-none rounded-2xl text-lg font-black focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
              />
            </div>
          </div>
        </section>

        {/* Automation Section */}
        <section className="bg-slate-900 p-10 rounded-[40px] text-white">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Advanced Automation</h3>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Operational Efficiency</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
            <div>
              <h4 className="text-sm font-black">Auto-validate Purchase Orders</h4>
              <p className="text-xs text-white/40 mt-1">Automatically mark POs as RECEIVED upon creation (Demo mode only).</p>
            </div>
            <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-not-allowed">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white/20 rounded-full" />
            </div>
          </div>
        </section>
      </div>

      {isSaved && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-4 bg-emerald-500 text-white rounded-3xl shadow-2xl shadow-emerald-500/40 animate-bounce duration-700">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-widest">Configuration Synchronized</span>
        </div>
      )}
    </div>
  );
}
