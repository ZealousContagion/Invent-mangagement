"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  Bell,
  Users,
  LogOut,
  Package2,
  ShoppingCart,
  Receipt,
  Handshake,
  BarChart3,
  TrendingUp,
  History,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Package, label: "Inventory", href: "/inventory" },
  { icon: ShoppingCart, label: "Purchase Orders", href: "/purchase-orders" },
  { icon: Receipt, label: "Expenses", href: "/expenses" },
  { icon: TrendingUp, label: "Sales Orders", href: "/sales-orders" },
  { icon: Handshake, label: "Customers", href: "/customers" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
  { icon: Bell, label: "Alerts", href: "/alerts" },
  { icon: Tags, label: "Categories", href: "/categories" },
  { icon: Users, label: "Employees", href: "/employees" },
  { icon: Package2, label: "Suppliers", href: "/suppliers" },
  { icon: History, label: "Stock Movements", href: "/movements" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-full z-50">
      {/* Brand Logo - Minimalist */}
      <div className="h-16 flex items-center px-6 border-b border-slate-50">
        <div className="flex items-center space-x-2.5">
          <div className="bg-black text-white p-1.5 rounded-lg">
            <Package2 className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">Inventory.</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-slate-50 text-slate-900 font-semibold"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon
                className={cn(
                  "w-[18px] h-[18px] transition-colors",
                  isActive ? "text-black" : "text-slate-400 group-hover:text-slate-600"
                )}
                strokeWidth={2}
              />
              <span className="text-sm">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-black rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile - Minimalist */}
      <div className="p-4 border-t border-slate-50">
        <button className="flex items-center w-full space-x-3 hover:bg-slate-50 p-2 rounded-xl transition-colors text-left">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 truncate">Admin User</h4>
            <p className="text-xs text-slate-400 truncate">admin@company.com</p>
          </div>
          <LogOut className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </aside>
  );
}
