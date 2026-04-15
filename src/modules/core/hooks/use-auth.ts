"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/shared/lib/supabase";
import type { User } from "@supabase/supabase-js";

export type UserRole = "viewer" | "executor" | "pm" | "admin" | "super_admin";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/login";
  }, []);

  const [role, setRole] = useState<UserRole>("viewer");

  // Fetch role from users table
  useEffect(() => {
    if (!user?.email) return;
    (async () => {
      const { data } = await supabase.from("users").select("role").eq("email", user.email).single();
      if (data?.role) setRole(data.role as UserRole);
    })();
  }, [user?.email]);

  const isAuthenticated = !!user;
  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Guest";
  const email = user?.email ?? "";
  const isSuperAdmin = role === "super_admin";
  const isAdmin = isSuperAdmin || role === "admin";
  const isPM = isAdmin || role === "pm";
  const canViewFinancials = isAdmin; // 一般用戶看不到金額

  return {
    user, loading, isAuthenticated,
    displayName, email, role, isSuperAdmin, isAdmin, isPM, canViewFinancials,
    signIn, signUp, signOut,
  };
}
