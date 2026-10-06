"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Package,
  Calendar,
  Truck,
  Phone,
  RefreshCw,
  MapPin,
  PackageOpen,
  Search,
  X,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Boxes,
  TrendingUp,
  DollarSign,
  Filter,
  Eye,
  EyeOff,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Order } from "@/types";
import { sellerApi } from "@/lib/api/seller";
import { formatCurrency, formatDate, getStatusBadgeClass } from "@/lib/utils";
import DashboardLayout from "@/components/DashboardLayout";

// ------- Status config -------
const STATUS_OPTIONS = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

// Status transitions: which statuses a seller can move an order to
const NEXT_STATUS_MAP: Record<string, { value: string; label: string }[]> = {
  pending: [
    { value: "processing", label: "Accept & Pack Order" },
    { value: "cancelled", label: "Cancel & Release Stock" },
  ],
  paid: [
    { value: "processing", label: "Mark as Processing / Packed" },
    { value: "shipped", label: "Mark as Shipped" },
    { value: "cancelled", label: "Cancel & Restore Stock" },
  ],
  processing: [
    { value: "shipped", label: "Mark as Shipped" },
    { value: "completed", label: "Mark as Completed" },
    { value: "cancelled", label: "Cancel & Restore Stock" },
  ],
  shipped: [{ value: "completed", label: "Mark as Completed" }],
};

// ------- Stat Card -------
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 flex items-start gap-4 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-xl font-extrabold text-slate-900 dark:text-slate-50 mt-0.5 truncate">{value}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ------- Status Update Dropdown -------
function StatusDropdown({
  order,
  onUpdate,
  isUpdating,
}: {
  order: Order;
  onUpdate: (orderId: string, status: string) => Promise<void>;
  isUpdating: boolean;
}) {
  const [open, setOpen] = useState(false);
  const nextOptions = NEXT_STATUS_MAP[order.status?.toLowerCase()] || [];

  if (nextOptions.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isUpdating}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0052FF] hover:bg-[#0045D8] text-white text-[11px] font-bold transition-all shadow-sm shadow-blue-500/20 disabled:opacity-60"
      >
        <Truck className="w-3.5 h-3.5" />
        <span>Update Status</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 min-w-[180px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden">
            {nextOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={async () => {
                  setOpen(false);
                  await onUpdate(order.id, opt.value);
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ------- Order Card -------
function OrderCard({
  order,
  onUpdateStatus,
  isUpdating,
}: {
  order: Order;
  onUpdateStatus: (orderId: string, status: string) => Promise<void>;
  isUpdating: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-3">
        {/* Left info */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
              #{order.id.substring(0, 8).toUpperCase()}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(order.status)}`}
            >
              {order.status.toUpperCase()}
            </span>
            {isUpdating && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                <span className="w-2.5 h-2.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                Updating...
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(order.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              {order.order_items?.length || 0} item(s)
            </span>
            {order.phone_number && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {order.phone_number}
              </span>
            )}
          </div>
        </div>

        {/* Right: amount + actions */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-[10px] text-slate-400">Total</p>
            <p className="text-base font-extrabold text-[#0052FF]">
              {formatCurrency(order.total_amount)}
            </p>
          </div>

          <StatusDropdown
            order={order}
            onUpdate={onUpdateStatus}
            isUpdating={isUpdating}
          />

          <button
            onClick={() => setExpanded((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
              expanded
                ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-[#0052FF]/40 hover:text-[#0052FF]"
            }`}
            aria-label={expanded ? "Hide order details" : "View order details"}
          >
            {expanded ? (
              <><EyeOff className="w-3.5 h-3.5" /><span>Hide</span></>
            ) : (
              <><Eye className="w-3.5 h-3.5" /><span>View Details</span></>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Details */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 space-y-4 pt-4">
          {/* Items */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
              Order Items
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {order.order_items?.map((it) => (
                <div
                  key={it.id || it.product_id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                    {it.product?.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.product.image_url}
                        alt={it.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <PackageOpen className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {it.product?.name || `Product #${it.product_id.substring(0, 6)}`}
                      </p>
                      <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 shrink-0">
                        {formatCurrency(it.price * it.quantity)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1 flex-wrap">
                      <p className="text-[11px] text-slate-500 font-medium">
                        Order Qty: <strong className="text-slate-900 dark:text-slate-100 font-bold">{it.quantity}</strong> &times; {formatCurrency(it.price)}
                      </p>
                      {it.product?.stock !== undefined && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          it.product.stock <= 0
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                            : it.product.stock <= 5
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                        }`}>
                          <Boxes className="w-3 h-3" />
                          Warehouse Stock: {it.product.stock}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Info */}
          {(order.logistic_company || order.logistic_branch || order.district) && (
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                Shipping Details
              </p>
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-600 dark:text-slate-400">
                {order.logistic_company && (
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    {order.logistic_company}
                    {order.logistic_branch ? ` — ${order.logistic_branch}` : ""}
                  </span>
                )}
                {order.district && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {order.district}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Fulfillment Timeline */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">
              Fulfillment Progress
            </p>
            <div className="flex items-center gap-1">
              {["pending", "paid", "processing", "shipped", "completed"].map((s, i, arr) => {
                const statusIndex = arr.indexOf(order.status?.toLowerCase());
                const isDone = i <= statusIndex;
                const isCurrent = i === statusIndex;
                return (
                  <React.Fragment key={s}>
                    <div
                      className={`flex flex-col items-center gap-1 min-w-[52px] ${isDone ? "opacity-100" : "opacity-30"}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isCurrent
                            ? "bg-[#0052FF] text-white ring-2 ring-[#0052FF]/30"
                            : isDone
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                        }`}
                      >
                        {isDone && !isCurrent ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                      </div>
                      <span className="text-[9px] font-semibold text-center capitalize text-slate-500 dark:text-slate-400">
                        {s}
                      </span>
                    </div>
                    {i < arr.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 min-w-[12px] rounded-full mb-4 ${
                          i < statusIndex ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700"
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ------- Main Page -------
export default function SellerOrdersPage() {
  const { user, hasRole } = useAuth();
  const { success, error } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await sellerApi.getSellerOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      error(err?.message || "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    if (user && hasRole("seller")) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      await sellerApi.updateOrderStatus(orderId, newStatus);
      success(`Order status updated to ${newStatus.toUpperCase()}`);
      await fetchOrders();
    } catch (err: any) {
      error(err?.message || "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = {
    total: orders.length,
    awaitingAction: orders.filter((o) =>
      ["pending", "paid"].includes(o.status?.toLowerCase())
    ).length,
    inProgress: orders.filter((o) =>
      ["processing", "shipped"].includes(o.status?.toLowerCase())
    ).length,
    revenue: orders
      .filter((o) => !["cancelled", "pending"].includes(o.status?.toLowerCase()))
      .reduce((sum, o) => sum + (o.total_amount || 0), 0),
  };

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === "all" || o.status?.toLowerCase() === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.phone_number?.toLowerCase().includes(q) ||
      o.district?.toLowerCase().includes(q) ||
      o.logistic_company?.toLowerCase().includes(q) ||
      o.order_items?.some((it) => it.product?.name?.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  if (!user || !hasRole("seller")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4 p-8">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Access Restricted</h2>
          <p className="text-sm text-slate-500">
            You need a <strong>Seller</strong> account to access the order management dashboard.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0052FF] text-white text-xs font-bold shadow-md shadow-blue-500/20"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout portal="seller" pageTitle="Orders & Fulfillment">
      <div className="space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
              Orders &amp; Fulfillment
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage and ship customer orders from your store
            </p>
          </div>
          <button
            onClick={fetchOrders}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Boxes}
            label="Total Orders"
            value={stats.total}
            sub="All time"
            color="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
          />
          <StatCard
            icon={Clock}
            label="Awaiting Action"
            value={stats.awaitingAction}
            sub="Paid / Pending"
            color="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
          />
          <StatCard
            icon={TrendingUp}
            label="In Progress"
            value={stats.inProgress}
            sub="Processing & Shipped"
            color="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
          />
          <StatCard
            icon={DollarSign}
            label="Confirmed Revenue"
            value={formatCurrency(stats.revenue)}
            sub="Excluding cancelled"
            color="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID, product, customer phone..."
              className="w-full pl-8 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0052FF]/40 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                  statusFilter === opt.value
                    ? "bg-[#0052FF] text-white border-[#0052FF] shadow-sm shadow-blue-500/20"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-[#0052FF]/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse space-y-4"
              >
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 stroke-1" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {searchQuery || statusFilter !== "all" ? "No orders match your filters" : "No orders yet"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or status filter."
                : "When customers place orders from your store, they will appear here."}
            </p>
            {(searchQuery || statusFilter !== "all") && (
              <button
                onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
                className="mt-4 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Showing{" "}
              <span className="font-bold text-slate-700 dark:text-slate-300">{filtered.length}</span>{" "}
              of {orders.length} orders
            </p>
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
                isUpdating={updatingId === order.id}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
