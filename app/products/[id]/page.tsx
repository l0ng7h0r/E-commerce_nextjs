"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  PackageOpen,
  Store,
  Tag,
  Plus,
  Minus,
} from "lucide-react";
import { Product, Category } from "@/types";
import { productsApi } from "@/lib/api/products";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [prod, cats] = await Promise.all([
          productsApi.getProductByID(id),
          productsApi.getCategories().catch(() => []),
        ]);
        setProduct(prod);
        setCategories(cats);
      } catch (err: any) {
        setError(err?.message || "Product not found.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      router.push(`/login?redirect=/products/${id}`);
      return;
    }
    if (!product || product.stock <= 0) return;
    setIsAdding(true);
    const ok = await addToCart(product.id, quantity);
    setIsAdding(false);
    if (ok) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      router.push(`/login?redirect=/products/${id}`);
      return;
    }
    if (!product || product.stock <= 0) return;
    const ok = await addToCart(product.id, quantity);
    if (ok) {
      router.push("/cart");
    }
  };

  const categoryName = categories.find((c) => c.id === product?.category_id)?.name;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 w-full">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
            <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
            <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
            <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <PackageOpen className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Product Not Found</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">{error || "This product may have been removed or does not exist."}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
        {/* Product Image Section */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800/80 shadow-md">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-2">
                <PackageOpen className="w-16 h-16 stroke-1" />
                <span className="text-sm">No image available</span>
              </div>
            )}

            {/* Stock pill */}
            <div className="absolute top-4 left-4">
              {isOutOfStock ? (
                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-rose-600 text-white shadow-md">
                  Out of stock
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-md">
                  In stock ({product.stock} available)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Product Information Section */}
        <div className="flex flex-col justify-between">
          <div className="space-y-4">
            {categoryName && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-[#0052FF] dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                <Tag className="w-3.5 h-3.5" />
                <span>{categoryName}</span>
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="pt-2">
              <span className="text-xs text-zinc-600 dark:text-zinc-400 block font-medium">Price</span>
              <span className="text-3xl sm:text-4xl font-extrabold text-[#0052FF] dark:text-blue-400">
                {formatCurrency(product.price)}
              </span>
            </div>

            {/* Seller info */}
            <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 pt-1">
              <Store className="w-4 h-4 text-zinc-500" />
              <span>Seller ID:</span>
              <span className="font-mono text-zinc-700 dark:text-zinc-300">{product.seller_id}</span>
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Product Description
              </h2>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                {product.description || "No additional description available for this product."}
              </p>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="pt-4">
                <label htmlFor="product-qty" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                      className="p-2.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span id="product-qty" aria-live="polite" className="w-12 text-center text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      aria-label="Increase quantity"
                      className="p-2.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    of {product.stock} available
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-8 mt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className={`flex-1 w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm font-bold shadow-lg transition-all active:scale-98 ${
                  isOutOfStock
                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none"
                    : justAdded
                    ? "bg-emerald-600 text-white shadow-emerald-600/20"
                    : "bg-[#0052FF] hover:bg-[#0045D8] text-white shadow-blue-500/25"
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Added to Cart</span>
                  </>
                ) : isAdding ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`flex-1 w-full flex items-center justify-center py-3.5 px-6 rounded-2xl text-sm font-bold border transition-all active:scale-98 ${
                  isOutOfStock
                    ? "border-zinc-200 dark:border-zinc-800 text-zinc-500 cursor-not-allowed"
                    : "border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                }`}
              >
                Buy Now
              </button>
            </div>

            {/* Service guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-4 text-center">
              <div className="p-3 rounded-xl bg-zinc-100/60 dark:bg-zinc-800/40 text-xs">
                <Truck className="w-4 h-4 mx-auto text-indigo-500 mb-1" />
                <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">Express Delivery</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-100/60 dark:bg-zinc-800/40 text-xs">
                <ShieldCheck className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
                <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">100% Authentic</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-100/60 dark:bg-zinc-800/40 text-xs">
                <RotateCcw className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">7-Day Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
