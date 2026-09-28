"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCart,
  User,
  LogOut,
  Package,
  Store,
  ShieldCheck,
  Menu,
  X,
  Search,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Category } from "@/types";
import { productsApi } from "@/lib/api/products";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, hasRole } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  const isSeller = hasRole("seller");
  const isAdmin = hasRole("admin");

  useEffect(() => {
    productsApi.getCategories().then((cats) => {
      if (Array.isArray(cats)) setCategories(cats);
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    router.push("/");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0E1320]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors shadow-[0_2px_10px_rgba(0,82,255,0.03)]">
      {/* Primary Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-blue-50 dark:bg-blue-950/40 p-1 border border-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/logo.png"
                alt="LongtechCart Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[17px] tracking-tight text-slate-900 dark:text-white flex items-center leading-none">
                Longtech<span className="text-[#0052FF]">Cart</span>
              </span>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-0.5">
                Modern E-Commerce
              </span>
            </div>
          </Link>

          {/* Search Bar connected to Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-xl hidden md:flex items-center rounded-xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/80 p-1 focus-within:border-[#0052FF] focus-within:ring-2 focus-within:ring-[#0052FF]/15 transition-all"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name or description..."
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs text-slate-400 hover:text-slate-600 px-1.5"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="bg-[#0052FF] hover:bg-[#0045D8] text-white p-2 rounded-lg ml-1 shadow-sm shadow-blue-500/20 active:scale-95 transition-all"
              aria-label="Search"
            >
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </form>

          {/* Navigation & Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Nav links (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  pathname === "/"
                    ? "text-[#0052FF] bg-blue-50 dark:bg-blue-950/50"
                    : "text-slate-600 dark:text-slate-400 hover:text-[#0052FF] hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                Home
              </Link>

              <Link
                href="/orders"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  pathname.startsWith("/orders")
                    ? "text-[#0052FF] bg-blue-50 dark:bg-blue-950/50"
                    : "text-slate-600 dark:text-slate-400 hover:text-[#0052FF] hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>My Orders</span>
              </Link>

              {isSeller && (
                <Link
                  href="/seller"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    pathname.startsWith("/seller")
                      ? "text-amber-600 bg-amber-50 dark:bg-amber-950/50"
                      : "text-amber-600 dark:text-amber-400 hover:bg-amber-50/70"
                  }`}
                >
                  <Store className="w-3.5 h-3.5 text-amber-500" />
                  <span>Seller Studio</span>
                </Link>
              )}

              {isAdmin && (
                <Link
                  href="/admin"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    pathname.startsWith("/admin")
                      ? "text-[#0052FF] bg-blue-50 dark:bg-blue-950/50"
                      : "text-[#0052FF] dark:text-blue-400 hover:bg-blue-50/70"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0052FF]" />
                  <span>Admin Center</span>
                </Link>
              )}
            </nav>

            {/* Cart Icon with real count */}
            <Link
              href="/cart"
              className="relative p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-[#0052FF] transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-4.5 h-4.5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-[#0052FF] px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-in zoom-in">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            {/* Auth Dropdown or Sign In Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/70 dark:border-slate-800"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#0052FF] flex items-center justify-center text-white text-[11px] font-bold uppercase shadow-sm shadow-blue-500/20">
                    {user.email.substring(0, 2)}
                  </div>
                  <span className="hidden sm:inline-block text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                    {user.email.split("@")[0]}
                  </span>
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] text-slate-400 font-medium">Signed in as</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {user.email}
                        </p>
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

                      <div className="py-1">
                        <Link
                          href="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Package className="w-3.5 h-3.5 text-slate-400" />
                          Order History
                        </Link>
                        {isSeller && (
                          <Link
                            href="/seller"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                          >
                            <Store className="w-3.5 h-3.5 text-amber-500" />
                            Seller Studio
                          </Link>
                        )}
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg text-[#0052FF] hover:bg-blue-50 transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-[#0052FF]" />
                            Admin Center
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#0052FF] hover:bg-[#0045D8] active:scale-95 shadow-sm shadow-blue-500/25 transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Categories Bar loaded directly from API */}
      {categories.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-9 text-xs">
              <nav className="flex items-center gap-5 font-medium text-slate-600 dark:text-slate-300 overflow-x-auto scrollbar-none py-1">
                <Link href="/" className="font-bold text-[#0052FF] hover:underline shrink-0">
                  All Products
                </Link>
                {categories.slice(0, 7).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/?cat=${cat.id}`}
                    className="hover:text-[#0052FF] transition-colors shrink-0"
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 font-medium uppercase tracking-wider shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0052FF]" />
                <span>100% Genuine Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-3 animate-in slide-in-from-top duration-200">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#0052FF] text-slate-900 dark:text-slate-100"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          <div className="space-y-1 pt-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-blue-50 hover:text-[#0052FF]"
            >
              <Zap className="w-4 h-4 text-[#0052FF]" />
              Storefront
            </Link>
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-blue-50 hover:text-[#0052FF]"
            >
              <Package className="w-4 h-4 text-[#0052FF]" />
              My Orders
            </Link>
            {isSeller && (
              <Link
                href="/seller"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-amber-600 hover:bg-amber-50"
              >
                <Store className="w-4 h-4" />
                Seller Studio
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#0052FF] hover:bg-blue-50"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Center
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
