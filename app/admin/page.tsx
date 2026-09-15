"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Package,
  Users,
  Tag,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Plus,
  Trash2,
  Search,
  MoreHorizontal,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Order, User as UserType, Category } from "@/types";
import { adminApi, CreateUserInput } from "@/lib/api/admin";
import { productsApi } from "@/lib/api/products";
import { formatCurrency, formatDate, getStatusBadgeClass } from "@/lib/utils";
import Modal from "@/components/Modal";
import DashboardLayout from "@/components/DashboardLayout";

export default function AdminDashboardPage() {
  const { user, hasRole } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<"orders" | "users" | "categories">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState<CreateUserInput>({ email: "", password: "", role: "seller" });

  const [createCategoryModalOpen, setCreateCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [isCreatingCat, setIsCreatingCat] = useState(false);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const [orderRes, userRes, catRes] = await Promise.all([
        adminApi.getAllOrders().catch(() => []),
        adminApi.getAllUsers().catch(() => []),
        productsApi.getCategories().catch(() => []),
      ]);
      setOrders(Array.isArray(orderRes) ? orderRes : []);
      setUsers(Array.isArray(userRes) ? userRes : []);
      setCategories(Array.isArray(catRes) ? catRes : []);
    } catch (err: any) {
      error(err?.message || "Failed to load system data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && hasRole("admin")) fetchAdminData();
  }, [user]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      success(`Updated order status to "${newStatus}" successfully`);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err: any) {
      error(err?.message || "Failed to update order status");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password) { error("Please provide both email and password"); return; }
    try {
      setIsCreatingUser(true);
      await adminApi.createUser(newUser);
      success(`Created user account (${newUser.role}) successfully!`);
      setCreateUserModalOpen(false);
      setNewUser({ email: "", password: "", role: "seller" });
      const freshUsers = await adminApi.getAllUsers();
      setUsers(freshUsers);
    } catch (err: any) {
      error(err?.message || "Failed to create user");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user account "${email}"?`)) return;
    try {
      await adminApi.deleteUser(userId);
      success("User account deleted successfully");
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      error(err?.message || "Failed to delete user");
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      setIsCreatingCat(true);
      const cat = await adminApi.createCategory(newCatName.trim());
      success(`Created category "${cat.name}" successfully`);
      setNewCatName("");
      setCreateCategoryModalOpen(false);
      const freshCats = await productsApi.getCategories();
      setCategories(freshCats);
    } catch (err: any) {
      error(err?.message || "Failed to create category");
    } finally {
      setIsCreatingCat(false);
    }
  };

  if (!user || !hasRole("admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6fa] dark:bg-zinc-950">
        <div className="max-w-md w-full mx-4 p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">Administrator Access Required</h2>
          <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
            Please log in with an administrator account.
            <br />
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              Default Admin: admin@gmail.com / admin@123
            </span>
          </p>
          <Link
            href="/login"
            className="px-6 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-600/20 hover:bg-rose-700 transition-all"
          >
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === "pending").length;

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const matchesSearch =
      orderSearch === "" ||
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.user_id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone_number?.includes(orderSearch);
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const TABS = [
    { key: "orders", label: `Orders (${orders.length})`, icon: Package },
    { key: "users", label: `Users (${users.length})`, icon: Users },
    { key: "categories", label: `Categories (${categories.length})`, icon: Tag },
  ] as const;

  return (
    <DashboardLayout portal="admin" pageTitle="Admin Dashboard">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {[
          { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: DollarSign, color: "bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400" },
          { label: "Total Orders", value: `${orders.length} orders`, icon: Package, color: "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400" },
          { label: "Pending Processing", value: `${pendingOrdersCount} orders`, icon: TrendingUp, color: "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" },
          { label: "Registered Users", value: `${users.length} accounts`, icon: Users, color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800/70 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 font-medium">{s.label}</p>
              <p className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">{s.value}</p>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Panel */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800/70 shadow-sm overflow-hidden">
        {/* Tabs Header */}
        <div className="flex items-center border-b border-zinc-100 dark:border-zinc-800 px-6 pt-4 gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === t.key
                  ? "border-violet-600 text-violet-600 dark:text-violet-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}

          {/* Right controls */}
          <div className="ml-auto flex items-center gap-2 pb-2">
            <button onClick={fetchAdminData} className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            {activeTab === "users" && (
              <button
                onClick={() => setCreateUserModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-600/25 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New User</span>
              </button>
            )}
            {activeTab === "categories" && (
              <button
                onClick={() => setCreateCategoryModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-600/25 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Category</span>
              </button>
            )}
          </div>
        </div>

        {/* ── ORDERS TAB ── */}
        {activeTab === "orders" && (
          <>
            {/* Filters */}
            <div className="flex items-center gap-3 px-6 py-3 border-b border-zinc-100 dark:border-zinc-800/60">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search by order ID, phone..."
                  value={orderSearch}
                  onChange={(e) => { setOrderSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Order ID & Date</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Customer & Shipping</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Total</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
                    <th className="py-3.5 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide text-right">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-zinc-400 text-sm">
                        No orders match the current filter
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-xs">#{o.id.substring(0, 8)}</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{formatDate(o.created_at)}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium text-zinc-800 dark:text-zinc-200 text-xs">{o.phone_number || "No phone"}</p>
                          <p className="text-[11px] text-zinc-400">{o.logistic_company || "Standard"} • {o.district || "—"}</p>
                        </td>
                        <td className="py-4 px-4 font-bold text-violet-600 dark:text-violet-400 text-sm">
                          {formatCurrency(o.total_amount)}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusBadgeClass(o.status)}`}>
                            {o.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                            className="px-2.5 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredOrders.length > 0 && (
              <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                  Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredOrders.length)}–
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length} entries
                </p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 disabled:opacity-40 transition-colors">Prev</button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${currentPage === page ? "bg-violet-600 text-white shadow-md shadow-violet-600/25" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"}`}>
                      {page}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 disabled:opacity-40 transition-colors">Next</button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === "users" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wide">ID & Email</th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Roles</th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Created</th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{u.email}</p>
                      <p className="font-mono text-[10px] text-zinc-400 mt-0.5">ID: {u.id.substring(0, 12)}...</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {u.roles?.map((r) => (
                          <span key={r} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            r === "admin" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                            : r === "seller" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                            : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                          }`}>{r}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-zinc-500 text-xs">{formatDate(u.created_at)}</td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id, u.email)}
                        className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete this user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── CATEGORIES TAB ── */}
        {activeTab === "categories" && (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((c) => (
              <div key={c.id} className="p-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-700/70 bg-zinc-50 dark:bg-zinc-800/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-violet-600 flex items-center justify-center shadow-sm shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">{c.name}</p>
                  <p className="font-mono text-[10px] text-zinc-400">ID: {c.id.substring(0, 8)}...</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Create User */}
      <Modal isOpen={createUserModalOpen} onClose={() => setCreateUserModalOpen(false)} title="Add New User Account">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Email Address <span className="text-rose-500">*</span></label>
            <input type="email" required placeholder="user@example.com" value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Password <span className="text-rose-500">*</span></label>
            <input type="password" required placeholder="At least 6 characters" value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Account Role</label>
            <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="seller">Seller</option>
              <option value="admin">Administrator (Admin)</option>
              <option value="user">Customer (User)</option>
            </select>
          </div>
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
            <button type="button" onClick={() => setCreateUserModalOpen(false)} className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold">Cancel</button>
            <button type="submit" disabled={isCreatingUser} className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-600/20">
              {isCreatingUser ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Category */}
      <Modal isOpen={createCategoryModalOpen} onClose={() => setCreateCategoryModalOpen(false)} title="Create New Category">
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Category Name <span className="text-rose-500">*</span></label>
            <input type="text" required placeholder="e.g. Electronics, Home & Kitchen..."
              value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
            <button type="button" onClick={() => setCreateCategoryModalOpen(false)} className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold">Cancel</button>
            <button type="submit" disabled={isCreatingCat} className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-600/20">
              {isCreatingCat ? "Creating..." : "Create Category"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
