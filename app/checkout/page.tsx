"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Truck,
  Phone,
  Building,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  PackageCheck,
  ExternalLink,
  QrCode,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { ordersApi, CreateOrderInput } from "@/lib/api/orders";
import { paymentsApi } from "@/lib/api/payments";
import { formatCurrency } from "@/lib/utils";
import Modal from "@/components/Modal";
import QRPaymentModal from "@/components/QRPaymentModal";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, itemCount, totalAmount, refreshCart } = useCart();
  const { success, error } = useToast();

  const [formData, setFormData] = useState<CreateOrderInput>({
    phone_number: "",
    logistic_company: "HAL Express",
    logistic_branch: "",
    district: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"qr" | "link">("qr");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold mb-2">Please sign in before checking out</h2>
        <Link href="/login" className="text-indigo-600 font-semibold text-sm hover:underline">
          Sign In
        </Link>
      </div>
    );
  }

  if (items.length === 0 && !createdOrder) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-xs text-zinc-500 mb-6">Please add items to your cart before proceeding to checkout.</p>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone_number?.trim()) {
      error("Please enter a contact phone number");
      return;
    }
    if (!formData.district?.trim()) {
      error("Please enter your delivery address");
      return;
    }

    try {
      setIsSubmitting(true);
      // 1. Create order
      const order = await ordersApi.createOrder(formData);
      setCreatedOrder(order);

      // Preload legacy payment url in background if needed
      try {
        const payRes = await paymentsApi.createPayment(order.id);
        if (payRes && payRes.payment_url) {
          setPaymentUrl(payRes.payment_url);
        }
      } catch (payErr: any) {
        console.warn("Payment initiation note:", payErr?.message);
      }

      await refreshCart();
      success("Order created successfully!");

      if (paymentMethod === "qr") {
        setShowQRModal(true);
      } else {
        setShowSuccessModal(true);
      }
    } catch (err: any) {
      error(err?.message || "Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Cart
      </Link>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-8">
        Checkout & Shipping
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Shipping Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmitOrder}
            className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-md space-y-6"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Shipping Information
                </h2>
                <p className="text-xs text-zinc-500">Enter recipient details and select shipping courier</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Phone */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  Recipient Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="LA +856 ..."
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Logistic Company */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-zinc-400" />
                  Courier / Carrier
                </label>
                <select
                  value={formData.logistic_company}
                  onChange={(e) => setFormData({ ...formData, logistic_company: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="HAL Express">HAL Express</option>
                  <option value="ANS Express">ANS Express</option>
                  <option value="Unitel Express">Unitel Express</option>
                  <option value="Mexay Express">Mexay Express</option>
                </select>
              </div>

              {/* Logistic Branch */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-zinc-400" />
                  Branch / Delivery Station
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vientiane Main Station"
                  value={formData.logistic_branch}
                  onChange={(e) => setFormData({ ...formData, logistic_branch: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* District / Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  District & Recipient Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="District & Recipient Address ..."
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Payment Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("qr")}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-3 ${
                    paymentMethod === "qr"
                      ? "border-[#0052FF] bg-blue-50/50 dark:bg-blue-950/40 shadow-sm"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-[#0052FF]" />
                      <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        Scan QR Code
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0052FF] text-white">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-snug">
                    Scan QR to pay via banking apps
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("link")}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-3 ${
                    paymentMethod === "link"
                      ? "border-[#0052FF] bg-blue-50/50 dark:bg-blue-950/40 shadow-sm"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-indigo-600" />
                      <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        Payment Link
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-snug">
                    Open the link to Payment Gateway to pay
                  </p>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-[#0052FF] hover:bg-[#0045D8] active:scale-98 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <PackageCheck className="w-5 h-5" />
                  <span>Place Order ({formatCurrency(totalAmount)})</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary sidebar */}
        <div className="lg:col-span-1 space-y-5">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-md space-y-4">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              Order Items ({itemCount} items)
            </h3>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((it) => (
                <div key={it.id || it.product_id} className="flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-600 shrink-0">
                      {it.quantity}x
                    </span>
                    <span className="truncate text-zinc-800 dark:text-zinc-200 font-medium">
                      {it.product?.name || "Product"}
                    </span>
                  </div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 shrink-0">
                    {formatCurrency((it.product?.price || 0) * it.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Items Subtotal</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Estimated Shipping</span>
                <span className="text-emerald-600 font-semibold">Free</span>
              </div>
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between font-bold text-base text-zinc-900 dark:text-zinc-100">
                <span>Total Due</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-100/70 dark:bg-zinc-800/40 text-xs text-zinc-500 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>Your personal data and order are protected with high-level encryption standards.</span>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/orders");
        }}
        title="Order Placed Successfully!"
      >
        <div className="space-y-5 text-center py-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Order #{createdOrder?.id?.substring(0, 8)}
            </h4>
            <p className="text-xs text-zinc-500 mt-1">
              Amount Due: {formatCurrency(createdOrder?.total_amount || totalAmount)}
            </p>
          </div>

          {paymentUrl ? (
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-left space-y-3">
              <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                Phajay Payment Gateway link is ready:
              </p>
              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
              >
                <span>Open Phajay Payment Gateway</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <p className="text-xs text-zinc-500">
              Your order has been recorded. You can view details or pay later from your order history.
            </p>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => {
                setShowSuccessModal(false);
                setShowQRModal(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0052FF] hover:bg-[#0045D8] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan QR Code to Pay Now</span>
            </button>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                router.push("/orders");
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-colors"
            >
              View Order History
            </button>
          </div>
        </div>
      </Modal>

      {/* Direct In-App QR Payment Modal */}
      {createdOrder && (
        <QRPaymentModal
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            router.push("/orders");
          }}
          orderId={createdOrder.id}
          orderAmount={createdOrder.total_amount || totalAmount}
          onPaymentSuccess={() => {
            success("Payment successful!");
            setShowQRModal(false);
            router.push("/orders");
          }}
        />
      )}
    </div>
  );
}
