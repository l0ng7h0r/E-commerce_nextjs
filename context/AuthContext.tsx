"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthResponse, RoleType } from "@/types";
import { authApi, LoginInput, RegisterInput } from "@/lib/api/auth";

interface AuthContextType {
  user: {
    id: string;
    email: string;
    roles: string[];
  } | null;
  activeRole: RoleType;
  setActiveRole: (role: RoleType) => void;
  isLoading: boolean;
  loginAs: (portal: RoleType, credentials: LoginInput) => Promise<AuthResponse>;
  register: (credentials: RegisterInput) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string; roles: string[] } | null>(null);
  const [activeRole, setActiveRole] = useState<RoleType>("user");
  const [isLoading, setIsLoading] = useState(true);

  const hydrateAuth = useCallback(() => {
    try {
      const storedUser = localStorage.getItem("ecommerce_user");
      const storedRole = localStorage.getItem("ecommerce_user_role") as RoleType | null;
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedRole) {
        setActiveRole(storedRole);
      }
    } catch (e) {
      console.error("Error loading auth session from localStorage", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateAuth();

    const handleExpired = () => {
      setUser(null);
      setActiveRole("user");
    };

    window.addEventListener("ecommerce_auth_expired", handleExpired);
    return () => window.removeEventListener("ecommerce_auth_expired", handleExpired);
  }, [hydrateAuth]);

  const saveSession = (authData: AuthResponse, portal: RoleType) => {
    localStorage.setItem("ecommerce_access_token", authData.access_token);
    localStorage.setItem("ecommerce_refresh_token", authData.refresh_token);
    localStorage.setItem("ecommerce_user_role", portal);

    const userInfo = {
      id: authData.user_id,
      email: authData.email,
      roles: authData.roles || [portal],
    };
    localStorage.setItem("ecommerce_user", JSON.stringify(userInfo));
    setUser(userInfo);
    setActiveRole(portal);
  };

  const loginAs = async (portal: RoleType, credentials: LoginInput) => {
    let authData: AuthResponse;
    if (portal === "seller") {
      authData = await authApi.sellerLogin(credentials);
    } else if (portal === "admin") {
      authData = await authApi.adminLogin(credentials);
    } else {
      authData = await authApi.userLogin(credentials);
    }

    saveSession(authData, portal);
    return authData;
  };

  const register = async (credentials: RegisterInput) => {
    const authData = await authApi.userRegister(credentials);
    saveSession(authData, "user");
    return authData;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("ecommerce_refresh_token");
    const role = activeRole;

    try {
      if (refreshToken) {
        if (role === "seller") {
          await authApi.sellerLogout(refreshToken);
        } else if (role === "admin") {
          await authApi.adminLogout(refreshToken);
        } else {
          await authApi.userLogout(refreshToken);
        }
      }
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      localStorage.removeItem("ecommerce_access_token");
      localStorage.removeItem("ecommerce_refresh_token");
      localStorage.removeItem("ecommerce_user");
      localStorage.removeItem("ecommerce_user_role");
      setUser(null);
      setActiveRole("user");
    }
  };

  const hasRole = (role: string) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        setActiveRole,
        isLoading,
        loginAs,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
