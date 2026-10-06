"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Check, PackageOpen, Heart, Star, Tag } from "lucide-react";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

interface ProductCardProps {
  product: Product;
  categoryName?: string;
}

export default function ProductCard({ product, categoryName }: ProductCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(`/login?redirect=/products/${product.id}`);
      return;
    }
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
    <div className="group relative rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700/60 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Product Image Area */}
      <Link href={`/products/${product.id}`} className="relative block overflow-hidden bg-slate-50/80 dark:bg-slate-900/60 aspect-[4/3] w-full">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            width={400}
            height={300}
            loading="eager"
            decoding="async"
            style={{ aspectRatio: "4/3" }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60";
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <PackageOpen className="w-9 h-9 stroke-1" />
            <span className="text-[11px] font-mono">No Image</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {isOutOfStock ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold text-white bg-slate-800 shadow-sm tracking-wider">
                OUT OF STOCK
              </span>
            ) : isLowStock ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold text-white bg-amber-500 shadow-sm tracking-wider">
                LOW STOCK ({product.stock})
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold text-white bg-[#0052FF] shadow-sm tracking-wider">
                VERIFIED
              </span>
            )}
          </div>

          <button
            onClick={handleWishlist}
            className="w-7 h-7 rounded-full bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center shadow hover:scale-110 transition-transform"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                wishlisted ? "fill-rose-500 text-rose-500" : "text-slate-500 dark:text-slate-400"
              }`}
            />
          </button>
        </div>
      </Link>

      {/* Product Content Details */}
      <div className="p-3.5 flex flex-col flex-1">
        {/* Category Tag */}
        {categoryName && (
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[10px] font-bold text-[#0052FF] dark:text-blue-400 uppercase tracking-wider truncate">
              {categoryName}
            </span>
          </div>
        )}

        {/* Title */}
        <Link href={`/products/${product.id}`} className="block mb-1.5">
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug min-h-[2.5rem] group-hover:text-[#0052FF] dark:group-hover:text-blue-400 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 mb-3 mt-1">
          <span className="text-base font-extrabold text-[#0052FF] dark:text-blue-400 tracking-tight">
            {formatCurrency(product.price)}
          </span>
          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">
            Stock: {product.stock}
          </span>
        </div>

        {/* Add to Cart Action Button */}
        <div className="mt-auto pt-1">
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock || isAdding}
            className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 ${
              isOutOfStock
                ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                : justAdded
                ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                : "bg-[#0052FF] hover:bg-[#0045D8] text-white shadow-sm shadow-blue-500/25"
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Added to Cart</span>
              </>
            ) : isAdding ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
