"use client";

import { useState, useCallback } from "react";

export type UserRole = "viewer" | "executor" | "pm" | "admin" | "super_admin";

export interface CurrentUser {
  name: string;
  email: string;
  role: UserRole;
}

// 暫時用 localStorage 模擬，之後換 Supabase Auth + RLS
const STORAGE_KEY = "event-hub-current-user";

const DEFAULT_USER: CurrentUser = {
  name: "Mark",
  email: "mark@weblink.com.tw",
  role: "super_admin",
};

export function useAuth() {
  const [user] = useState<CurrentUser>(() => {
    if (typeof window === "undefined") return DEFAULT_USER;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULT_USER, ...JSON.parse(raw) } : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const isSuperAdmin = user.role === "super_admin";
  const isAdmin = user.role === "admin" || isSuperAdmin;

  return { user, isSuperAdmin, isAdmin };
}
