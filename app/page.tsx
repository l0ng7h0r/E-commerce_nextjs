"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  Package,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { Product, Category } from "@/types";
import { productsApi } from "@/lib/api/products";
import ProductCard from "@/components/ProductCard";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"latest" | "price-asc" | "price-desc">("latest");

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [prodRes, catRes] = await Promise.allSettled([
        productsApi.getAllProducts(),
        productsApi.getCategories(),
      ]);
      if (prodRes.status === "fulfilled" && Array.isArray(prodRes.value)) setProducts(prodRes.value);
      else setProducts([]);
      if (catRes.status === "fulfilled" && Array.isArray(catRes.value)) setCategories(catRes.value);
      else setCategories([]);
    } catch (err: any) {
      setError(err?.message || "Failed to load products.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

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
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-indigo-600 to-sky-500 py-16 sm:py-24">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold border border-white/20 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen E-Commerce Platform 2026</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-md">
              Discover Quality Products
              <br />
              <span className="text-yellow-300">At The Best Prices</span>
            </h1>

            <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed">
              Wide range of authentic goods directly from verified sellers — with real-time order tracking.
            </p>

            {/* Search */}
            <div className="pt-4 max-w-xl mx-auto">
              <div className="relative flex items-center shadow-2xl shadow-violet-900/30">
                <Search className="absolute left-4 w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search products, brands, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-10 py-4 rounded-2xl bg-white dark:bg-zinc-900 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 text-zinc-900 dark:text-zinc-100"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {searchQuery ? `Results for "${searchQuery}"` : "Best Seller"}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {filteredProducts.length} products found
            </p>
          </div>
          <Link
            href="#"
            onClick={(e) => e.preventDefault()}
            className="flex items-center gap-0.5 text-xs font-bold text-zinc-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors uppercase tracking-wide"
          >
            VIEW ALL <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Category Pills + Sort Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:flex-1 pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === "all"
                  ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-600/25"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-violet-400 hover:text-violet-600"
              }`}
            >
              Top {products.length > 30 ? "30" : "All"}
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-600/25"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-violet-400 hover:text-violet-600"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort & Refresh */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="latest">Latest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
            <button
              onClick={loadData}
              title="Refresh products"
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-zinc-200 dark:bg-zinc-800" />
                <div className="p-3.5 space-y-2.5">
                  <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
                  <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-8 max-w-lg mx-auto">
            <p className="text-rose-600 dark:text-rose-400 font-semibold text-sm mb-3">Error loading products</p>
            <p className="text-xs text-zinc-500 mb-4">{error}</p>
            <button onClick={loadData} className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 transition-all">
              Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-8">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 stroke-1" />
            </div>
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">No products found</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No products match "${searchQuery}". Try different keywords.`
                : "No products available yet."}
            </p>
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                className="mt-5 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
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
