import React from "react";
import Link from "next/link";
import { ShoppingBag, ShieldCheck, Truck, CreditCard, Headphones } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 mt-auto">
      {/* Feature Badges Banner */}
      <div className="border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Fast Shipping</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Kerry, Flash, Thai Post & DHL</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Secure Checkout</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Phajay Payment Gateway</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">100% Authentic</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Verified Quality Guaranteed</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">24/7 Support</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Dedicated customer care</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">NovaCart</span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Modern high-performance e-commerce platform connecting buyers, sellers, and administrators.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-3">Customer</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Shop Products</Link></li>
              <li><Link href="/cart" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Shopping Cart</Link></li>
              <li><Link href="/orders" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Track Orders</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-3">Portals & Tools</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Sign In Portal</Link></li>
              <li><Link href="/seller" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Seller Studio</Link></li>
              <li><Link href="/admin" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Admin Center</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-3">Backend Architecture</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-2">
              Powered by Go Fiber v3 RESTful API, PostgreSQL, Phajay Payment Gateway, and Supabase Storage.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              API v2 Ready (Port 3000)
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} NovaCart Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Next.js 16</span>
            <span>•</span>
            <span>React 19</span>
            <span>•</span>
            <span>Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
