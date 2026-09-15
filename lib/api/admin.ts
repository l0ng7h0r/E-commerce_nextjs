import { apiClient } from "./client";
import { Category, Order, User } from "@/types";

export interface CreateUserInput {
  email: string;
  password: string;
  role: "user" | "seller" | "admin" | string;
}

export const adminApi = {
  // User Management
  getAllUsers: () =>
    apiClient<User[]>("/admin/users", {
      method: "GET",
    }),

  getUserByID: (id: string) =>
    apiClient<User>(`/admin/users/${id}`, {
      method: "GET",
    }),

  createUser: (input: CreateUserInput) =>
    apiClient<any>("/admin/users", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  deleteUser: (id: string) =>
    apiClient<{ message: string }>(`/admin/users/${id}`, {
      method: "DELETE",
    }),

  // Order Management
  getAllOrders: () =>
    apiClient<Order[]>("/admin/orders", {
      method: "GET",
    }),

  updateOrderStatus: (id: string, status: string) =>
    apiClient<{ message: string }>(`/admin/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Category Management
  createCategory: (name: string) =>
    apiClient<Category>("/admin/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
};
