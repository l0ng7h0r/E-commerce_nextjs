import { apiClient } from "./client";
import { Payment, PaymentResponse } from "@/types";

export const paymentsApi = {
  createPayment: (orderId: string) =>
    apiClient<PaymentResponse>("/user/payments", {
      method: "POST",
      body: JSON.stringify({ order_id: orderId }),
    }),

  getPaymentByOrder: (orderId: string) =>
    apiClient<Payment>(`/user/payments/order/${orderId}`, {
      method: "GET",
    }),
};
