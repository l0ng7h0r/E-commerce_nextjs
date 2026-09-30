"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Calendar,
  Truck,
  Phone,
  CreditCard,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  PackageOpen,
  MapPin,
  QrCode,
  Clock,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Order } from "@/types";
import { ordersApi } from "@/lib/api/orders";
import { paymentsApi } from "@/lib/api/payments";
import { formatCurrency, formatDate, getStatusBadgeClass } from "@/lib/utils";
import Modal from "@/components/Modal";
import QRPaymentModal from "@/components/QRPaymentModal";

function PendingOrderTimer({
  createdAt,
  onExpire,
}: {
  createdAt: string;
  onExpire: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState<{ formatted: string; isExpired: boolean; isWarning: boolean }>({
    formatted: "",
    isExpired: false,
    isWarning: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const created = new Date(createdAt).getTime();
      const expiresAt = created + 15 * 60 * 1000; // 15-minute expiration
      const diff = Math.max(0, expiresAt - Date.now());

      if (diff <= 0) {
        setTimeLeft({ formatted: "00:00", isExpired: true, isWarning: true });
        onExpire();
        return;
      }

      const totalSec = Math.floor(diff / 1000);
      const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
      const ss = String(totalSec % 60).padStart(2, "0");

      setTimeLeft({
        formatted: `${mm}:${ss}`,
        isExpired: false,
        isWarning: totalSec < 3 * 60,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [createdAt, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
        <Clock className="w-3 h-3" /> Expired
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border ${
        timeLeft.isWarning
          ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 animate-pulse"
          : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800"
      }`}
    >
      <Clock className="w-3 h-3" />
      Pay within {timeLeft.formatted}
    </span>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancellingId, setIsCancellingId] = useState<string | null>(null);

  // Direct QR modal state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrOrder, setQrOrder] = useState<Order | null>(null);

  // Legacy Payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await ordersApi.getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      error(err?.message || "Failed to load order history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to cancel this order? The reserved items will be returned to stock.")) {
      return;
    }

    try {
      setIsCancellingId(orderId);
      await ordersApi.cancelOrder(orderId);
      success("Order cancelled and stock restored to inventory.");
      await fetchOrders();
    } catch (err: any) {
      error(err?.message || "Failed to cancel order");
    } finally {
      setIsCancellingId(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handlePayWithQR = (order: Order) => {
    setQrOrder(order);
    setQrModalOpen(true);
  };

  const handlePayNow = async (order: Order) => {
    setSelectedOrder(order);
    setIsProcessingPayment(true);
    setPaymentModalOpen(true);
    setPaymentUrl(null);
    setPaymentStatus(null);

    try {
      // Create Phajay payment session
      const res = await paymentsApi.createPayment(order.id);
      if (res && res.payment_url) {
        setPaymentUrl(res.payment_url);
        setPaymentStatus(res.status);
      }
    } catch (err: any) {
      // Check existing payment status if session creation fails
      try {
        const existing = await paymentsApi.getPaymentByOrder(order.id);
        if (existing) {
          setPaymentUrl(existing.payment_url || null);
          setPaymentStatus(existing.status);
        }
      } catch (innerErr) {
        error("Failed to initiate payment session");
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCheckPaymentStatus = async (orderId: string) => {
    try {
      const pay = await paymentsApi.getPaymentByOrder(orderId);
      if (pay) {
        setPaymentStatus(pay.status);
        success(`Payment status: ${pay.status}`);
        fetchOrders();
      }
    } catch (err: any) {
      error(err?.message || "No payment information available");
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold mb-2">Please Sign In</h2>
        <p className="text-xs text-zinc-500 mb-6">Sign in to view your complete order history and track deliveries.</p>
        <Link
          href="/login"
          className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
            My Order History
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Track shipping updates and review your purchase history
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4 mt-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse space-y-4"
            >
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
              <div className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 mt-8">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 stroke-1" />
          </div>
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
            No order history found
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            You haven&apos;t placed any orders yet. Discover great products in our store today!
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0052FF] text-white text-xs font-semibold hover:bg-[#0045D8] shadow-md shadow-blue-500/20 transition-all"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6 mt-8">
          {orders.map((order) => {
            const isPending =
              order.status?.toLowerCase() === "pending" ||
              order.status?.toLowerCase() === "waiting_payment";
            return (
              <div
                key={order.id}
                className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-5"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        #{order.id.substring(0, 8)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                      {isPending && (
                        <PendingOrderTimer
                          createdAt={order.created_at}
                          onExpire={fetchOrders}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Ordered on {formatDate(order.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right sm:pr-2">
                      <span className="text-[11px] text-zinc-400 block">Total</span>
                      <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <button
                          onClick={() => handlePayWithQR(order)}
                          className="px-3.5 py-2 rounded-xl bg-[#0052FF] hover:bg-[#0045D8] text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
                        >
                          <QrCode className="w-4 h-4" />
                          <span>Scan QR</span>
                        </button>
                        <button
                          onClick={() => handlePayNow(order)}
                          className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                          title="Payment Link"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Gateway</span>
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={isCancellingId === order.id}
                          className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                          title="Cancel Order & Release Stock"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{isCancellingId === order.id ? "Cancelling..." : "Cancel"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Order Items ({order.order_items?.length || 0}):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {order.order_items?.map((it) => (
                      <div
                        key={it.id || it.product_id}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800"
                      >
                        <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-700 overflow-hidden shrink-0 flex items-center justify-center">
                          {it.product?.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={it.product.image_url}
                              alt={it.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <PackageOpen className="w-5 h-5 text-zinc-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                            {it.product?.name || `Item ID: ${it.product_id}`}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Qty: {it.quantity} • {formatCurrency(it.price)} / item
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Logistic & Shipping Information */}
                {(order.phone_number || order.logistic_company || order.district) && (
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-zinc-500 dark:text-zinc-400">
                    {order.phone_number && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{order.phone_number}</span>
                      </div>
                    )}
                    {order.logistic_company && (
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-zinc-400" />
                        <span>
                          {order.logistic_company} {order.logistic_branch ? `(${order.logistic_branch})` : ""}
                        </span>
                      </div>
                    )}
                    {order.district && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{order.district}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Gateway Phajay Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Phajay Payment Gateway"
      >
        <div className="space-y-4 py-2">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-zinc-500">Order ID:</span>
              <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                #{selectedOrder?.id?.substring(0, 8)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Amount Due:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                {formatCurrency(selectedOrder?.total_amount || 0)}
              </span>
            </div>
            {paymentStatus && (
              <div className="flex justify-between">
                <span className="text-zinc-500">Payment Status:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {paymentStatus}
                </span>
              </div>
            )}
          </div>

          {isProcessingPayment ? (
            <div className="py-8 text-center space-y-2">
              <span className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin inline-block" />
              <p className="text-xs text-zinc-500">Connecting to Phajay Payment Gateway...</p>
            </div>
          ) : paymentUrl ? (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                  Payment session active. Click below to complete checkout.
                </p>
              </div>

              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all"
              >
                <span>Proceed to Phajay Checkout</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => selectedOrder && handleCheckPaymentStatus(selectedOrder.id)}
                className="w-full py-2.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                Check Payment Status
              </button>
            </div>
          ) : (
            <div className="text-center py-4 space-y-3">
              <p className="text-xs text-zinc-500">
                No active payment session found or order has already been paid.
              </p>
              <button
                onClick={() => selectedOrder && handleCheckPaymentStatus(selectedOrder.id)}
                className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold"
              >
                Refresh Status
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Direct In-App QR Payment Modal */}
      {qrOrder && (
        <QRPaymentModal
          isOpen={qrModalOpen}
          onClose={() => {
            setQrModalOpen(false);
            setQrOrder(null);
            fetchOrders();
          }}
          orderId={qrOrder.id}
          orderAmount={qrOrder.total_amount}
          onPaymentSuccess={() => {
            success("Payment successful");
            setQrModalOpen(false);
            setQrOrder(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}
