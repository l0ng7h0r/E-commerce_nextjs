import { apiClient } from "./client";
import { Cart } from "@/types";

export const cartApi = {
  getCart: () =>
    apiClient<Cart>("/user/cart", {
      method: "GET",
    }),

  addItem: (productId: string, quantity: number = 1) =>
    apiClient<Cart>("/user/cart/items", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, quantity }),
    }),

  updateItem: (productId: string, quantity: number) =>
    apiClient<Cart>(`/user/cart/items/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }),

  removeItem: (productId: string) =>
    apiClient<Cart>(`/user/cart/items/${productId}`, {
      method: "DELETE",
    }),

  clearCart: () =>
    apiClient<{ message: string }>("/user/cart", {
      method: "DELETE",
    }),
};
