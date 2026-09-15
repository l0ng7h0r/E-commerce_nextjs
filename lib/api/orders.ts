import { apiClient } from "./client";
import { Order } from "@/types";

export interface CreateOrderInput {
  phone_number?: string;
  logistic_company?: string;
  logistic_branch?: string;
  district?: string;
}

export const ordersApi = {
  createOrder: (input: CreateOrderInput) =>
    apiClient<Order>("/user/orders", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  getMyOrders: () =>
    apiClient<Order[]>("/user/orders", {
      method: "GET",
    }),

  getOrderByID: (id: string) =>
    apiClient<Order>(`/user/orders/${id}`, {
      method: "GET",
    }),
};
