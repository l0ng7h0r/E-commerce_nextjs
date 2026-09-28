"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Package,
  RefreshCw,
  Zap,
  Tag,
} from "lucide-react";
import { Product, Category } from "@/types";
import { productsApi } from "@/lib/api/products";
import ProductCard from "@/components/ProductCard";

export default function HomePage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("cat") || "all";
  const initialQuery = searchParams.get("q") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<"latest" | "price-asc" | "price-desc">("latest");

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (initialQuery !== undefined) setSearchQuery(initialQuery);
  }, [initialQuery]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [prodRes, catRes] = await Promise.allSettled([
        productsApi.getAllProducts(),
        productsApi.getCategories(),
      ]);
      if (prodRes.status === "fulfilled" && Array.isArray(prodRes.value)) {
        setProducts(prodRes.value);
      } else {
        setProducts([]);
      }
      if (catRes.status === "fulfilled" && Array.isArray(catRes.value)) {
        setCategories(catRes.value);
      } else {
        setCategories([]);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load products from API.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const filteredProducts = useMemo(() =>
    products
      .filter((p) => {
        const matchesCat = selectedCategory === "all" || p.category_id === selectedCategory;
        const matchesSearch =
          searchQuery === "" ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
      }),
    [products, selectedCategory, searchQuery, sortBy]
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F7FC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Eye-Comfort Modern Tech Hero Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 w-full">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#EBF2FF] via-[#F4F8FF] to-[#E5EFFF] dark:from-[#11192A] dark:via-[#0F1728] dark:to-[#0B1320] border border-blue-100 dark:border-blue-900/40 p-6 sm:p-10 overflow-hidden shadow-sm">
          
          {/* Subtle Circular Tech Glow */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-80 h-80 rounded-full border border-blue-400/20 pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0052FF] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
              <Zap className="w-3 h-3 fill-current" />
              <span>LongtechCart Platform</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
              Quality Tech Products & <span className="text-[#0052FF]">Hardware Store</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
              Explore authentic products from verified sellers with fast dispatch, secure escrow checkout, and real-time tracking.
            </p>

            {/* Quick Hero Search Input */}
            <div className="pt-2 max-w-md">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0052FF] shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 text-xs font-semibold text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {searchQuery ? `Search results for "${searchQuery}"` : "All Products"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {filteredProducts.length} items available
            </p>
          </div>

          <button
            onClick={loadData}
            title="Refresh listings"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Real Dynamic Categories Pills + Sort Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          {/* Category Filter Pills (loaded from API) */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:flex-1 pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategory === "all"
                  ? "bg-[#0052FF] text-white border-[#0052FF] shadow-sm shadow-blue-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:text-[#0052FF]"
              }`}
            >
              All ({products.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? "bg-[#0052FF] text-white border-[#0052FF] shadow-sm shadow-blue-500/20"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:text-[#0052FF]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0052FF] shadow-xs"
            >
              <option value="latest">Latest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800" />
                <div className="p-3.5 space-y-2.5">
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-8 max-w-lg mx-auto">
            <p className="text-rose-600 dark:text-rose-400 font-bold text-sm mb-2">Unable to load catalog</p>
            <p className="text-xs text-slate-500 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-[#0052FF] text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 bg-white dark:bg-slate-900/40">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Package className="w-7 h-7 stroke-1" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No products found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No products match query "${searchQuery}". Try different search terms.`
                : "No products available under this category."}
            </p>
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                className="mt-4 px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categoryName={product.category_id ? categoryMap.get(product.category_id) : undefined}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
