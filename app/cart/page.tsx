"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  User,
  PackageOpen,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items,
    itemCount,
    totalAmount,
    isLoading,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Please Sign In
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
          Sign in to view items in your shopping cart, save favorite products, and place orders.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
          >
            Sign In Now
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-200 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Shopping Cart
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            You have {itemCount} items in your cart
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Are you sure you want to clear your cart?")) {
                clearCart();
              }
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 mt-8">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 stroke-1" />
          </div>
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
            Your cart is currently empty
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            Discover great products at the best prices and add them to your cart.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0052FF] text-white text-xs font-semibold hover:bg-[#0045D8] shadow-md shadow-blue-500/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const product = item.product;
              return (
                <div
                  key={item.id || item.product_id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm gap-4"
                >
                  {/* Image & Product info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200/60 dark:border-zinc-800/60">
                      {product?.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <PackageOpen className="w-6 h-6 stroke-1" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Link
                        href={`/products/${item.product_id}`}
                        className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1"
                      >
                        {product?.name || `Product ID: ${item.product_id}`}
                      </Link>
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(product?.price || 0)} / item
                      </p>
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:justify-end">
                    {/* Quantity controls */}
                    <div className="inline-flex items-center border border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        disabled={isLoading}
                        className="p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        disabled={isLoading}
                        className="p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right min-w-[90px]">
                      <span className="text-xs text-zinc-400 block font-medium">Total</span>
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {formatCurrency((product?.price || 0) * item.quantity)}
                      </span>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      disabled={isLoading}
                      className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Card */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-md space-y-5 sticky top-24">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                Order Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600">Free (Promotion)</span>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Total Amount</span>
                <span className="text-2xl font-extrabold text-[#0052FF] dark:text-blue-400">
                  {formatCurrency(totalAmount)}
                </span>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                disabled={items.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-xs font-bold text-white bg-[#0052FF] hover:bg-[#0045D8] active:scale-98 shadow-lg shadow-blue-500/25 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-[11px] text-zinc-500 pt-2 justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Protected by Phajay Payment Gateway</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
