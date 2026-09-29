import { apiClient } from "./client";
import { Payment, PaymentResponse, QRCodeResponse, PaymentStatusResponse } from "@/types";

export const paymentsApi = {
  /** Legacy redirect-link flow */
  createPayment: (orderId: string) =>
    apiClient<PaymentResponse>("/user/payments", {
      method: "POST",
      body: JSON.stringify({ order_id: orderId }),
    }),

  /** Generate an in-app QR Code (no redirect) */
  generateQR: (orderId: string, bank: string = "BCEL") =>
    apiClient<QRCodeResponse>("/user/payments/generate-qr", {
      method: "POST",
      body: JSON.stringify({ order_id: orderId, bank }),
    }),

  /** Poll Phajay & sync DB – used by frontend polling every few seconds */
  checkPaymentStatus: (orderId: string) =>
    apiClient<PaymentStatusResponse>(`/user/payments/order/${orderId}/status`, {
      method: "GET",
    }),

  /** Get stored payment record */
  getPaymentByOrder: (orderId: string) =>
    apiClient<Payment>(`/user/payments/order/${orderId}`, {
      method: "GET",
    }),
};
