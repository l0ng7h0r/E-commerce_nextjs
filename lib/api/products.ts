import { apiClient } from "./client";
import { Category, Product } from "@/types";

export const productsApi = {
  getAllProducts: () =>
    apiClient<Product[]>("/user/products", {
      method: "GET",
      skipAuth: true,
    }),

  getProductByID: (id: string) =>
    apiClient<Product>(`/user/products/${id}`, {
      method: "GET",
      skipAuth: true,
    }),

  getCategories: () =>
    apiClient<Category[]>("/user/categories", {
      method: "GET",
      skipAuth: true,
    }),

  getProductsBySeller: (sellerId: string) =>
    apiClient<Product[]>(`/user/products/seller/${sellerId}`, {
      method: "GET",
      skipAuth: true,
    }),
};
