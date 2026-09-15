import { apiClient } from "./client";
import { AuthResponse } from "@/types";

export interface RegisterInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authApi = {
  // Customer Auth
  userRegister: (input: RegisterInput) =>
    apiClient<AuthResponse>("/user/register", {
      method: "POST",
      body: JSON.stringify(input),
      skipAuth: true,
    }),

  userLogin: (input: LoginInput) =>
    apiClient<AuthResponse>("/user/login", {
      method: "POST",
      body: JSON.stringify(input),
      skipAuth: true,
    }),

  userLogout: (refreshToken: string) =>
    apiClient<{ message: string }>("/user/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  // Seller Auth
  sellerLogin: (input: LoginInput) =>
    apiClient<AuthResponse>("/seller/login", {
      method: "POST",
      body: JSON.stringify(input),
      skipAuth: true,
    }),

  sellerLogout: (refreshToken: string) =>
    apiClient<{ message: string }>("/seller/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  // Admin Auth
  adminLogin: (input: LoginInput) =>
    apiClient<AuthResponse>("/admin/login", {
      method: "POST",
      body: JSON.stringify(input),
      skipAuth: true,
    }),

  adminLogout: (refreshToken: string) =>
    apiClient<{ message: string }>("/admin/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),
};
