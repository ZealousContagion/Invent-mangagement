"use client";

import { Search, Bell, Settings, Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white/50 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100 px-4 md:px-8 h-16 flex items-center justify-between">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all mr-2"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" strokeWidth={2} />
      </button>

      {/* Search Bar - Minimalist */}
      <div className="flex items-center flex-1 max-w-sm">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-2 bg-transparent border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:border-slate-200 focus:shadow-sm text-slate-700 transition-all placeholder:text-slate-400 hover:bg-white/50"
          />
        </div>
      </div>

      {/* Right Actions - Minimalist */}
      <div className="flex items-center space-x-2">
        <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all relative">
          <Bell className="w-[18px] h-[18px]" strokeWidth={2} />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>
        <div className="h-4 w-px bg-slate-200 mx-2"></div>
        <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
          <Settings className="w-[18px] h-[18px]" strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}