"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ShoppingCart, Check, PackageOpen, Heart, Star } from "lucide-react";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
  categoryName?: string;
}

/** Deterministically derive display badges from product data */
function getBadges(product: Product): { type: "NEW" | "BEST SELLER" | "TOP RATED" | "0% Instalment"; color: string }[] {
  const badges: { type: "NEW" | "BEST SELLER" | "TOP RATED" | "0% Instalment"; color: string }[] = [];
  const idSum = product.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);

  // "New" if created within last 30 days or low id hash
  const isNew = product.created_at
    ? Date.now() - new Date(product.created_at).getTime() < 30 * 24 * 3600 * 1000
    : idSum % 5 === 0;
  if (isNew) badges.push({ type: "NEW", color: "bg-sky-500" });

  if (idSum % 3 === 1) badges.push({ type: "BEST SELLER", color: "bg-violet-600" });
  if (idSum % 7 === 0) badges.push({ type: "TOP RATED", color: "bg-emerald-500" });
  if (product.price > 100 && idSum % 4 === 0)
    badges.push({ type: "0% Instalment", color: "bg-rose-500" });

  return badges.slice(0, 2);
}

/** Generate a fake-but-stable star rating from product id */
function getStarRating(product: Product): { rating: number; count: number } {
  const hash = product.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const rating = 3.5 + (hash % 30) / 20; // 3.5–5.0
  const count = 2 + (hash % 98); // 2–99 reviews
  return { rating: Math.round(rating * 10) / 10, count };
}

function StarRow({ rating, count }: { rating: number; count: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < full
                ? "fill-amber-400 text-amber-400"
                : i === full && half
                ? "fill-amber-400/50 text-amber-400"
                : "fill-zinc-200 text-zinc-300"
            }`}
          />
        ))}
      </div>
      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">({count})</span>
    </div>
  );
}

export default function ProductCard({ product, categoryName }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const badges = useMemo(() => getBadges(product), [product]);
  const { rating, count } = useMemo(() => getStarRating(product), [product]);
  const isOutOfStock = product.stock <= 0;

  // Fake original price (show 15% OFF for products with price divisible by specific value)
  const idSum = product.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const hasDiscount = idSum % 6 === 0 && product.price > 50;
  const originalPrice = hasDiscount ? Math.round(product.price * 1.15) : null;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setIsAdding(true);
    const ok = await addToCart(product.id, 1);
    setIsAdding(false);
    if (ok) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((w) => !w);
  };

  return (
    <div className="group relative rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Area */}
      <Link href={`/products/${product.id}`} className="relative block overflow-hidden bg-zinc-50 dark:bg-zinc-800/50 aspect-[4/3]">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60";
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-2">
            <PackageOpen className="w-10 h-10 stroke-1" />
            <span className="text-xs">No image</span>
          </div>
        )}

        {/* Top overlay row */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between">
          {/* Instalment / Discount badge (top-left) */}
          <div className="flex flex-col gap-1">
            {hasDiscount && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white bg-rose-500 shadow-sm">
                15% OFF
              </span>
            )}
            {badges.find((b) => b.type === "0% Instalment") && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white bg-rose-500 shadow-sm">
                0% Instalment
              </span>
            )}
          </div>

          {/* Wishlist heart (top-right) */}
          <button
            onClick={handleWishlist}
            className="w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 transition-all"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                wishlisted ? "fill-rose-500 text-rose-500" : "text-zinc-400"
              }`}
            />
          </button>
        </div>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-full bg-zinc-800/90 text-white text-[11px] font-bold">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-3.5 flex flex-col flex-1">
        {/* Bottom label badges (BEST SELLER, NEW, TOP RATED) */}
        {badges.filter((b) => b.type !== "0% Instalment").length > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            {badges
              .filter((b) => b.type !== "0% Instalment")
              .map((b) => (
                <span
                  key={b.type}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${b.color}`}
                >
                  {b.type}
                </span>
              ))}
          </div>
        )}

        {/* Product name */}
        <Link href={`/products/${product.id}`} className="block">
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Stars */}
        <StarRow rating={rating} count={count} />

        {/* Price row */}
        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <div>
            <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(product.price)}
            </span>
            {originalPrice && (
              <span className="ml-2 text-xs text-zinc-400 line-through">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock || isAdding}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 shrink-0 ${
              isOutOfStock
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                : justAdded
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                : "bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/25"
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : isAdding ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
