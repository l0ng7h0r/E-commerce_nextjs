"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Tag,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
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
  { label: "Products", href: "/seller", icon: Package },
  { label: "Category", href: "/seller?tab=category", icon: Tag },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Settings", href: "/seller?tab=settings", icon: Settings },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin?tab=orders", icon: ShoppingCart },
  { label: "Users", href: "/admin?tab=users", icon: Users },
  { label: "Category", href: "/admin?tab=categories", icon: Tag },
  { label: "Settings", href: "/admin?tab=settings", icon: Settings },
];

export default function DashboardLayout({ children, portal, pageTitle }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { success } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = portal === "seller" ? SELLER_NAV : ADMIN_NAV;
  const accentColor = portal === "seller" ? "#f59e0b" : "#8b5cf6";
  const brandLabel = portal === "seller" ? "Seller Studio" : "Admin Center";
  const BrandIcon = portal === "seller" ? Store : ShieldCheck;

  const handleLogout = async () => {
    await logout();
    success("Signed out successfully");
    router.push("/login");
  };

  const userInitial = user?.email?.[0]?.toUpperCase() ?? "U";

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={`${
        mobile ? "w-full" : "w-60 hidden lg:flex"
      } flex-col h-full bg-[#1a1a2e] text-white shrink-0 relative z-10`}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shrink-0"
          style={{ background: `linear-gradient(135deg, ${accentColor}cc, ${accentColor})` }}
        >
          <BrandIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-extrabold text-sm text-white leading-tight">NovaCart</p>
          <p className="text-[10px] text-white/40 font-medium">{brandLabel}</p>
        </div>
        {mobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href.split("?")[0]));
          const Icon = item.icon;
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                isActive
                  ? "text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
              style={isActive ? { background: `${accentColor}22` } : {}}
            >
              {/* Active indicator line */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                  style={{ backgroundColor: accentColor }}
                />
              )}
              <Icon
                className="w-4.5 h-4.5 shrink-0"
                style={isActive ? { color: accentColor } : {}}
              />
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-600 text-white">
                  {item.badge}
                </span>
              )}
              {!isActive && (
                <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom User */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all"
        >
          <Store className="w-4 h-4" />
          <span>Go to Storefront</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>

        {user && (
          <div className="flex items-center gap-3 px-3 pt-3 mt-1 border-t border-white/10">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.email}</p>
              <p className="text-[10px] text-white/40 capitalize">{portal}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6fa] dark:bg-zinc-950">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-72 h-full">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center gap-4 px-5 shrink-0 shadow-sm">
          {/* Hamburger (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page title */}
          <h2 className="font-bold text-zinc-800 dark:text-zinc-100 text-base hidden sm:block">
            {pageTitle || brandLabel}
          </h2>

          {/* Search */}
          <div className="flex-1 max-w-xs hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              />
            </div>
          </div>

          {/* Right controls */}
          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            </button>

            {user && (
              <div className="flex items-center gap-2 pl-3 border-l border-zinc-200 dark:border-zinc-800">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: accentColor }}
                >
                  {userInitial}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 max-w-[120px] truncate">
                    {user.email}
                  </p>
                  <p className="text-[10px] text-zinc-400 capitalize">@{portal}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
