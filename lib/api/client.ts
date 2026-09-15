const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v2";

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
}

export class ApiClientError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.data = data;
  }
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const refreshToken = localStorage.getItem("ecommerce_refresh_token");
  const userRole = localStorage.getItem("ecommerce_user_role") || "user";

  if (!refreshToken) return null;

  try {
    let refreshEndpoint = `${API_BASE_URL}/user/refresh`;
    if (userRole === "seller") refreshEndpoint = `${API_BASE_URL}/seller/refresh`;
    if (userRole === "admin") refreshEndpoint = `${API_BASE_URL}/admin/refresh`;

    const res = await fetch(refreshEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      // Clear tokens
      localStorage.removeItem("ecommerce_access_token");
      localStorage.removeItem("ecommerce_refresh_token");
      localStorage.removeItem("ecommerce_user");
      window.dispatchEvent(new Event("ecommerce_auth_expired"));
      return null;
    }

    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem("ecommerce_access_token", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("ecommerce_refresh_token", data.refresh_token);
      }
      return data.access_token;
    }
    return null;
  } catch (err) {
    console.error("Failed to refresh token:", err);
    return null;
  }
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, skipAuth = false, headers = {}, ...customConfig } = options;

  let url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const reqHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string>),
  };

  if (!(customConfig.body instanceof FormData)) {
    reqHeaders["Content-Type"] = "application/json";
  }

  if (!skipAuth && typeof window !== "undefined") {
    const token = localStorage.getItem("ecommerce_access_token");
    if (token) {
      reqHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  let response = await fetch(url, {
    ...customConfig,
    headers: reqHeaders,
  });

  // Check 401 and try refresh token once
  if (response.status === 401 && !skipAuth && typeof window !== "undefined") {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;
    if (newToken) {
      reqHeaders["Authorization"] = `Bearer ${newToken}`;
      response = await fetch(url, {
        ...customConfig,
        headers: reqHeaders,
      });
    }
  }

  const contentType = response.headers.get("content-type");
  let data: any = null;
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
      (typeof data === "object" && (data?.error || data?.message)) ||
      `Request failed with status ${response.status}`;
    throw new ApiClientError(response.status, errorMessage, data);
  }

  return data as T;
}
