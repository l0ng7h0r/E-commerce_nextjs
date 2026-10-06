"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Tag,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  ShieldCheck,
  Store,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  badgeColor?: "blue" | "red";
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  /** "seller" or "admin" — controls which nav items and brand accent to show */
  portal: "seller" | "admin";
  /** Current section title, shown in topbar */
  pageTitle?: string;
}

const SELLER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/seller", icon: LayoutDashboard },
  { label: "Products", href: "/seller?tab=products", icon: Package },
  { label: "Orders & Fulfillment", href: "/seller/orders", icon: ShoppingCart, badge: 0, badgeColor: "blue" },
  { label: "Category & Brands", href: "/seller?tab=category", icon: Tag },
];

const ADMIN_NAV: NavItem[] = [
  { label: "User & Seller Management", href: "/admin?tab=users", icon: Users },
  { label: "Platform Orders (Audit)", href: "/admin?tab=orders", icon: ShieldCheck },
  { label: "Catalog Categories", href: "/admin?tab=categories", icon: Tag },
];

export default function DashboardLayout({ children, portal, pageTitle }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { success } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navItems = portal === "seller" ? SELLER_NAV : ADMIN_NAV;
  const brandSub = portal === "seller" ? "SELLER CENTER // MERCHANT PORTAL" : "ADMIN // GOVERNANCE";

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
    success("Signed out successfully");
    router.push("/login");
  };

  const userInitial = user?.email?.[0]?.toUpperCase() ?? "A";

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={`${
        mobile ? "w-full" : "w-64 hidden lg:flex"
      } flex-col h-full bg-white dark:bg-[#111726] border-r border-slate-200/90 dark:border-slate-800 shrink-0 relative z-10`}
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-blue-50 dark:bg-blue-950/40 p-1 border border-blue-500/20 group-hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="LongtechCart Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 dark:text-white leading-none">
                Longtech<span className="text-[#0052FF]">Cart</span>
              </div>
              <div className="font-mono text-[8px] font-bold text-[#0052FF] tracking-tight mt-1 uppercase">
                {brandSub}
              </div>
            </div>
          </Link>

          {mobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Store Active Status Pill */}
        <div className="mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{portal === "seller" ? "Store Active (Normal Ops)" : "System Active (Normal Ops)"}</span>
        </div>
      </div>

      {/* Operational Modules Section */}
      <div className="px-5 pt-4 pb-1">
        <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
          Operational Modules
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href.split("?")[0]));
          const Icon = item.icon;
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-[#0052FF] text-white shadow-sm shadow-blue-500/25"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>

              {item.badge !== undefined && (
                <span
                  className={`ml-auto px-1.5 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : item.badgeColor === "red"
                      ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                      : "bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer: Telemetry Stats */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            TELEMETRY PULSE
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">19ms</span>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
          <span>SYSTEM SYNC</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">99.98%</span>
        </div>

        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
          <Link
            href="/"
            className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-[#0052FF] flex items-center gap-1.5 w-full py-1 rounded-lg transition-colors"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Visit Storefront</span>
          </Link>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F7FC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-72 h-full">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Topbar */}
        <header className="h-16 bg-white dark:bg-[#111726] border-b border-slate-200/90 dark:border-slate-800 flex items-center justify-between px-5 shrink-0 shadow-xs">
          
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb path */}
            <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-800 dark:text-slate-200">LongtechCart</span>
              <span>&gt;</span>
              <span>{portal === "seller" ? "Merchant Portal" : "Governance"}</span>
              <span>&gt;</span>
              <span className="text-[#0052FF] font-semibold">{pageTitle || "Overview"}</span>
            </div>
          </div>

          {/* Center: Search */}
          <div className="hidden md:flex items-center max-w-sm flex-1 mx-6">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={portal === "seller" ? "Search orders, SKU, customer inquiries..." : "Search entities, tx, merchants..."}
                className="w-full pl-8 pr-12 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
              />
              <span className="absolute right-2.5 top-2 font-mono text-[10px] text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1">
                ⌘K
              </span>
            </div>
          </div>

          {/* Right: Status & Profile */}
          <div className="flex items-center gap-3">
            
            {/* Systems Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{portal === "seller" ? "Store Active" : "PRODUCTION (v3.4.2)"}</span>
            </div>

            {/* Notification */}
            <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            </button>

            {/* Profile Dropdown */}
            {user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800 hover:opacity-85 transition-opacity focus:outline-none cursor-pointer"
                  aria-label="User profile menu"
                >
                  <div className="text-right hidden md:block leading-tight">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                      {user.email.split("@")[0]}
                    </p>
                    <p className="font-mono text-[9px] text-slate-400 uppercase">
                      {user.roles?.[0] || portal} Portal
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-[#0052FF] flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-blue-500/20">
                    {userInitial}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {profileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-12 z-40 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 space-y-1">
                      {/* User Info */}
                      <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Signed in as</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">{user.email}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {user.roles?.map((r) => (
                            <span
                              key={r}
                              className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-50 text-[#0052FF] dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>

                      <Link
                        href="/"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <Store className="w-4 h-4 text-slate-400" />
                        <span>Visit Storefront</span>
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Page Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

