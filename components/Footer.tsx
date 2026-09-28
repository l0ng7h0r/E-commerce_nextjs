import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Truck, CreditCard, Headphones, Zap, Globe, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#0E1320] text-slate-600 dark:text-slate-400 mt-auto">
      {/* Feature Badges Banner */}
      <div className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">Bonded Express Dispatch</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Flash, Kerry, DHL & Thai Post</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">Escrow Protected Checkout</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Phajay Payment Gateway</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0052FF] flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">100% Genuine Guaranteed</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Verified Brand Distributors</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/50">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">24/7 SLA Support</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Real-time technical assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-blue-50 dark:bg-blue-950/40 p-0.5 border border-blue-500/20">
                <Image
                  src="/logo.png"
                  alt="LongtechCart Logo"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                Longtech<span className="text-[#0052FF]">Cart</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Next-generation technical marketplace and merchant governance platform powered by Next.js and Go Fiber REST architecture.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">Marketplace</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-[#0052FF] transition-colors">Browse Catalog</Link></li>
              <li><Link href="/cart" className="hover:text-[#0052FF] transition-colors">Shopping Cart</Link></li>
              <li><Link href="/orders" className="hover:text-[#0052FF] transition-colors">Order Tracking & Dispatch</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">Portals & Ecosystem</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/login" className="hover:text-[#0052FF] transition-colors">Sign In Portal</Link></li>
              <li><Link href="/seller" className="hover:text-[#0052FF] transition-colors">Seller Center // Merchant Portal</Link></li>
              <li><Link href="/admin" className="hover:text-[#0052FF] transition-colors">Admin Governance & Telemetry</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">System Architecture</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2.5">
              Go Fiber v3 RESTful API, PostgreSQL, Supabase Storage & Phajay Gateway.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>PRODUCTION v3.4.2 READY</span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-5 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} LongtechCart. All rights reserved.</p>
          <div className="flex items-center gap-4 font-mono text-[11px]">
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
