"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { Cart, CartItem } from "@/types";
import { cartApi } from "@/lib/api/cart";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      setIsLoading(true);
      const data = await cartApi.getCart();
      setCart(data);
    } catch (err: any) {
      // If no cart exists yet or empty, ignore silent error
      console.warn("Cart fetch info:", err?.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const items = useMemo(() => cart?.items || [], [cart]);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [items]);

  const addToCart = async (productId: string, quantity: number = 1): Promise<boolean> => {
    if (!user) {
      error("Please sign in before ordering products");
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        const redirectParam = currentPath && currentPath !== "/login" ? `?redirect=${encodeURIComponent(currentPath)}` : "";
        window.location.href = `/login${redirectParam}`;
      }
      return false;
    }

    try {
      setIsLoading(true);
      const updatedCart = await cartApi.addItem(productId, quantity);
      setCart(updatedCart);
      success("Added to cart successfully");
      return true;
    } catch (err: any) {
      error(err?.message || "Failed to add item to cart");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number): Promise<boolean> => {
    if (!user) return false;
    if (quantity <= 0) {
      return removeFromCart(productId);
    }

    try {
      setIsLoading(true);
      const updatedCart = await cartApi.updateItem(productId, quantity);
      setCart(updatedCart);
      return true;
    } catch (err: any) {
      error(err?.message || "Failed to update item quantity");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setIsLoading(true);
      const updatedCart = await cartApi.removeItem(productId);
      setCart(updatedCart);
      success("Item removed from cart");
      return true;
    } catch (err: any) {
      error(err?.message || "Failed to remove item from cart");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user) return false;

    try {
      setIsLoading(true);
      await cartApi.clearCart();
      setCart((prev) => (prev ? { ...prev, items: [] } : null));
      success("Cart cleared successfully");
      return true;
    } catch (err: any) {
      error(err?.message || "Failed to clear cart");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount,
        totalAmount,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
