"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Mail, Lock, ArrowRight, KeyRound, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { RoleType } from "@/types";

const ROLES: { value: RoleType; label: string; desc: string; color: string }[] = [
  { value: "user", label: "Customer", desc: "Shop & track orders", color: "#6366f1" },
  { value: "seller", label: "Seller", desc: "Manage your store", color: "#f59e0b" },
  { value: "admin", label: "Administrator", desc: "System control panel", color: "#e11d48" },
];

export default function LoginPage() {
  const router = useRouter();
  const { loginAs } = useAuth();
  const { success, error } = useToast();

  const [role, setRole] = useState<RoleType>("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedRole = ROLES.find((r) => r.value === role)!;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error("Please enter both email and password");
      return;
    }

    try {
      setIsSubmitting(true);
      await loginAs(role, { email, password });
      success(`Signed in successfully`);

      if (role === "seller") {
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

  const fillAdminCredentials = () => {
    setRole("admin");
    setEmail("admin@gmail.com");
    setPassword("admin@123");
    setDropdownOpen(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-zinc-50 via-white to-indigo-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950/20">
      <div className="max-w-md w-full space-y-8">
        {/* Brand header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-600/25">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
              Sign in to NovaCart
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Select your account type and sign in below
            </p>
          </div>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleLogin}
          className="p-7 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl shadow-zinc-200/40 dark:shadow-none space-y-5"
        >
          {/* Role Dropdown */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Account Type
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: selectedRole.color }}
                  />
                  <div className="text-left">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                      {selectedRole.label}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400 text-xs ml-2">
                      — {selectedRole.desc}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-zinc-950/50 overflow-hidden">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => {
                        setRole(r.value);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors ${
                        role === r.value ? "bg-zinc-50 dark:bg-zinc-800/40" : ""
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: r.color }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {r.label}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{r.desc}</p>
                      </div>
                      {role === r.value && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl text-white text-sm font-bold shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25"
            style={{
              background:
                role === "seller"
                  ? "linear-gradient(135deg, #f59e0b, #d97706)"
                  : role === "admin"
                  ? "linear-gradient(135deg, #e11d48, #be123c)"
                  : "linear-gradient(135deg, #6366f1, #4f46e5)",
            }}
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  Sign In as {selectedRole.label}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick Admin Demo Helper */}
          <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex items-center justify-center gap-1.5 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              <span>Autofill default Admin credentials (admin@gmail.com)</span>
            </button>
          </div>

          {role === "user" && (
            <div className="text-center">
              <p className="text-xs text-zinc-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
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
