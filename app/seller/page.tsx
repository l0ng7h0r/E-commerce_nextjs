"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Package,
  Upload,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Tag,
  Boxes,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  MoreHorizontal,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Product, Category } from "@/types";
import { sellerApi, CreateProductInput } from "@/lib/api/seller";
import { productsApi } from "@/lib/api/products";
import { formatCurrency } from "@/lib/utils";
import Modal from "@/components/Modal";
import DashboardLayout from "@/components/DashboardLayout";

function StatusBadge({ stock }: { stock: number }) {
  if (stock <= 0)
    return (
      <span className="px-3 py-1 rounded-full text-[11px] font-semibold border border-rose-200 text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-400">
        Out of Stock
      </span>
    );
  if (stock < 10)
    return (
      <span className="px-3 py-1 rounded-full text-[11px] font-semibold border border-amber-200 text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400">
        Low Stock
      </span>
    );
  return (
    <span className="px-3 py-1 rounded-full text-[11px] font-semibold border border-emerald-200 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400">
      Active
    </span>
  );
}

export default function SellerDashboardPage() {
  const { user, hasRole } = useAuth();
  const { success, error } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Create Product Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [newProduct, setNewProduct] = useState<CreateProductInput>({
    name: "",
    description: "",
    price: 0,
    stock: 10,
    category_id: "",
    image_url: "",
  });

  // Edit Product Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const fetchSellerData = async () => {
    try {
      setIsLoading(true);
      const [prodRes, catRes] = await Promise.all([
        sellerApi.getMyProducts(),
        productsApi.getCategories().catch(() => []),
      ]);
      setProducts(Array.isArray(prodRes) ? prodRes : []);
      setCategories(Array.isArray(catRes) ? catRes : []);
    } catch (err: any) {
      error(err?.message || "Failed to load seller products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && hasRole("seller")) {
      fetchSellerData();
    }
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingImage(true);
      const res = await sellerApi.uploadImage(file);
      if (res && res.image_url) {
        if (isEdit && editingProduct) {
          setEditingProduct({ ...editingProduct, image_url: res.image_url });
        } else {
          setNewProduct((prev) => ({ ...prev, image_url: res.image_url }));
        }
        success("Image uploaded to Supabase Storage successfully!");
      }
    } catch (err: any) {
      error(err?.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim()) { error("Please provide a product name"); return; }
    if (newProduct.price <= 0) { error("Price must be greater than 0"); return; }
    try {
      setIsCreating(true);
      await sellerApi.createProduct(newProduct);
      success("Product created successfully!");
      setCreateModalOpen(false);
      setNewProduct({ name: "", description: "", price: 0, stock: 10, category_id: "", image_url: "" });
      fetchSellerData();
    } catch (err: any) {
      error(err?.message || "Failed to create product");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      setIsUpdating(true);
      await sellerApi.updateProduct(editingProduct.id, {
        name: editingProduct.name,
        description: editingProduct.description,
        price: Number(editingProduct.price),
        stock: Number(editingProduct.stock),
        category_id: editingProduct.category_id,
        image_url: editingProduct.image_url,
      });
      success("Product updated successfully!");
      setEditModalOpen(false);
      setEditingProduct(null);
      fetchSellerData();
    } catch (err: any) {
      error(err?.message || "Failed to update product");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await sellerApi.deleteProduct(id);
      success("Product deleted successfully");
      fetchSellerData();
    } catch (err: any) {
      error(err?.message || "Failed to delete product");
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      setIsCreatingCategory(true);
      const cat = await sellerApi.createCategory(newCategoryName.trim());
      success(`Category "${cat.name}" created successfully!`);
      setNewCategoryName("");
      setCategoryModalOpen(false);
      const freshCats = await productsApi.getCategories();
      setCategories(freshCats);
    } catch (err: any) {
      error(err?.message || "Failed to create category");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  if (!user || !hasRole("seller")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6fa] dark:bg-zinc-950">
        <div className="max-w-md w-full mx-4 p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">Seller Account Required</h2>
          <p className="text-xs text-zinc-500 mb-6">
            Your account does not have seller permissions. Please sign in with a seller account.
          </p>
          <Link
            href="/login"
            className="px-6 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-500/20 hover:bg-amber-600 transition-all"
          >
            Sign in as Seller
          </Link>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  return (
    <DashboardLayout portal="seller" pageTitle="Products">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        {[
          { label: "Total Products", value: products.length, icon: Package, color: "bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400" },
          { label: "Total Stock", value: `${totalStock} pcs`, icon: Boxes, color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" },
          { label: "Out of Stock", value: outOfStockCount, icon: AlertTriangle, color: "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400" },
        ].map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800/70 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-zinc-400 font-medium">{s.label}</p>
              <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">{s.value}</p>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Products Panel */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800/70 shadow-sm overflow-hidden">
        {/* Panel Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-100">All Products</h3>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs w-44 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              />
            </div>

            <button
              onClick={() => setCategoryModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Tag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Category</span>
            </button>

            <button
              onClick={fetchSellerData}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="py-3.5 px-6 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  <input type="checkbox" className="rounded accent-violet-600" />
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Product ↕
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Category ↕
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Stock ↕
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Price ↕
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Status ↕
                </th>
                <th className="py-3.5 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide text-right">
                  Action ↕
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-400">
                    <span className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin inline-block mb-3" />
                    <p className="text-sm">Loading products...</p>
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-400">
                    <Package className="w-10 h-10 mx-auto stroke-1 mb-2 opacity-40" />
                    <p className="font-semibold text-zinc-600 dark:text-zinc-400">No products found</p>
                    <p className="text-xs mt-1">Click &ldquo;Add Product&rdquo; to list your first item.</p>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const cat = categories.find((c) => c.id === p.category_id);
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <input type="checkbox" className="rounded accent-violet-600" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-200/60 dark:border-zinc-700/60">
                            {p.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                <ImageIcon className="w-4 h-4 stroke-1" />
                              </div>
                            )}
                          </div>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm max-w-[180px] truncate">
                            {p.name}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-zinc-600 dark:text-zinc-400 text-sm">
                        {cat?.name || "—"}
                      </td>
                      <td className="py-4 px-4 text-zinc-700 dark:text-zinc-300 font-semibold text-sm">
                        {p.stock}
                      </td>
                      <td className="py-4 px-4 font-bold text-zinc-800 dark:text-zinc-200 text-sm">
                        {formatCurrency(p.price)}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge stock={p.stock} />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setEditingProduct(p); setEditModalOpen(true); }}
                            className="p-2 rounded-xl text-zinc-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
                            title="Edit product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredProducts.length > 0 && (
          <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <p className="text-xs text-zinc-400">
              Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredProducts.length)}–
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of{" "}
              {filteredProducts.length} entries
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                    currentPage === page
                      ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create Product */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Add New Product" maxWidth="lg">
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text" required
              placeholder="e.g. Wireless Noise-Cancelling Headphones..."
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Price <span className="text-rose-500">*</span>
              </label>
              <input
                type="number" step="0.01" required min="1"
                value={newProduct.price || ""}
                onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Stock <span className="text-rose-500">*</span>
              </label>
              <input
                type="number" required min="0"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Category</label>
            <select
              value={newProduct.category_id}
              onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Select a category...</option>
              {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Features, specifications, and details..."
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
              Product Image (Supabase)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer text-xs font-medium text-zinc-600 dark:text-zinc-300 transition-colors">
                <Upload className="w-4 h-4 text-violet-500" />
                <span>{isUploadingImage ? "Uploading..." : "Choose Image File"}</span>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, false)} disabled={isUploadingImage} className="hidden" />
              </label>
              {newProduct.image_url && (
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                </span>
              )}
            </div>
            {newProduct.image_url && (
              <div className="w-20 h-20 rounded-xl overflow-hidden border border-zinc-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={newProduct.image_url} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
            <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100">Cancel</button>
            <button type="submit" disabled={isCreating} className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-600/20">
              {isCreating ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Product */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Product" maxWidth="lg">
        {editingProduct && (
          <form onSubmit={handleUpdateProduct} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Product Name</label>
              <input
                type="text" required
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Price</label>
                <input
                  type="number" step="0.01" required
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Stock</label>
                <input
                  type="number" required min="0"
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Category</label>
              <select
                value={editingProduct.category_id || ""}
                onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">Select category...</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Description</label>
              <textarea
                rows={3}
                value={editingProduct.description}
                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">Update Product Image</label>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer text-xs font-medium text-zinc-600 dark:text-zinc-300 transition-colors">
                <Upload className="w-4 h-4 text-violet-500" />
                <span>{isUploadingImage ? "Uploading..." : "Upload New Image"}</span>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} disabled={isUploadingImage} className="hidden" />
              </label>
              {editingProduct.image_url && (
                <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-zinc-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={editingProduct.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
              <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold">Cancel</button>
              <button type="submit" disabled={isUpdating} className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md">
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal: Create Category */}
      <Modal isOpen={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} title="Create New Category">
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text" required
              placeholder="e.g. Consumer Electronics, Fashion..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
            <button type="button" onClick={() => setCategoryModalOpen(false)} className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold">Cancel</button>
            <button type="submit" disabled={isCreatingCategory} className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-600/20">
              {isCreatingCategory ? "Creating..." : "Create Category"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
