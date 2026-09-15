import { apiClient } from "./client";
import { Category, Product } from "@/types";

export interface CreateProductInput {
  category_id?: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
}

export interface UpdateProductInput {
  category_id?: string;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  image_url?: string;
}

export const sellerApi = {
  getMyProducts: () =>
    apiClient<Product[]>("/seller/products", {
      method: "GET",
    }),

  createProduct: (input: CreateProductInput) =>
    apiClient<Product>("/seller/products", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateProduct: (id: string, input: UpdateProductInput) =>
    apiClient<Product>(`/seller/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  deleteProduct: (id: string) =>
    apiClient<{ message: string }>(`/seller/products/${id}`, {
      method: "DELETE",
    }),

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return apiClient<{ image_url: string }>("/seller/products/upload-image", {
      method: "POST",
      body: formData,
    });
  },

  createCategory: (name: string) =>
    apiClient<Category>("/seller/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
};
