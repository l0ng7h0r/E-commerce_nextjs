"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, ArrowRight, ShieldCheck, Store, User, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { RoleType } from "@/types";

const ROLES: { value: RoleType; label: string; icon: React.ElementType }[] = [
  { value: "user", label: "Buyer", icon: User },
  { value: "seller", label: "Merchant / Seller", icon: Store },
  { value: "admin", label: "Admin / Governance", icon: ShieldCheck },
];

export default function LoginPage() {
  const router = useRouter();
  const { loginAs } = useAuth();
  const { success, error } = useToast();

  const [role, setRole] = useState<RoleType>("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error("Please enter both email and password");
      return;
    }

    try {
      setIsSubmitting(true);
      await loginAs(role, { email, password });
      success(`Signed in successfully as ${role}`);

      const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const redirectUrl = searchParams ? searchParams.get("redirect") : null;

      if (redirectUrl && redirectUrl.startsWith("/")) {
        router.push(redirectUrl);
      } else if (role === "seller") {
        router.push("/seller");
      } else if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      error(err?.message || "Sign in failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F4F7FC] dark:bg-[#0B0F19]">
      <div className="max-w-md w-full space-y-6">

        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-blue-50 dark:bg-blue-950/40 p-1.5 border border-blue-500/20 mx-auto shadow-md shadow-blue-500/10">
            <Image
              src="/logo.png"
              alt="LongtechCart Logo"
              width={48}
              height={48}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Sign In to Longtech<span className="text-[#0052FF]">Cart</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose your account portal to access platform services
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleLogin}
          className="p-7 sm:p-8 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-5"
        >
          {/* Email */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF] text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0052FF] text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/25 bg-[#0052FF] hover:bg-[#0045D8] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {role === "user" && (
            <div className="text-center pt-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-bold text-[#0052FF] dark:text-blue-400 hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
