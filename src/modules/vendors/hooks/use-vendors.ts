"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/shared/lib/supabase";
import type { VendorCategory } from "@/shared/types";

export interface VendorRow {
  id: string;
  name: string;
  category: VendorCategory;
  tax_id: string;
  bank_code: string;
  bank_name: string;
  bank_account: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  created_at: string;
  updated_at: string;
}

/** Frontend-friendly shape (camelCase) */
export interface VendorRecord {
  id: string;
  name: string;
  category: VendorCategory;
  taxId: string;
  bankCode: string;
  bankName: string;
  bankAccount: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
}

function rowToRecord(r: VendorRow): VendorRecord {
  return {
    id: r.id,
    name: r.name,
    category: r.category as VendorCategory,
    taxId: r.tax_id,
    bankCode: r.bank_code,
    bankName: r.bank_name,
    bankAccount: r.bank_account,
    contactName: r.contact_name,
    contactPhone: r.contact_phone,
    contactEmail: r.contact_email,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export type VendorFormData = Omit<VendorRecord, "id" | "createdAt" | "updatedAt">;

export function useVendors() {
  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<VendorCategory | "all">("all");

  // Fetch on mount
  useEffect(() => {
    fetchVendors();
  }, []);

  async function fetchVendors() {
    setLoading(true);
    const { data, error } = await supabase
      .from("vendors")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setVendors(data.map(rowToRecord));
    }
    setLoading(false);
  }

  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      const matchSearch =
        !search ||
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.contactName.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        categoryFilter === "all" || v.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [vendors, search, categoryFilter]);

  const addVendor = useCallback(async (data: VendorFormData) => {
    const { data: row, error } = await supabase
      .from("vendors")
      .insert({
        name: data.name,
        category: data.category,
        tax_id: data.taxId,
        bank_code: data.bankCode,
        bank_name: data.bankName,
        bank_account: data.bankAccount,
        contact_name: data.contactName,
        contact_phone: data.contactPhone,
        contact_email: data.contactEmail,
      })
      .select()
      .single();
    if (!error && row) {
      setVendors((prev) => [rowToRecord(row), ...prev]);
      toast.success("廠商已新增");
    } else if (error) {
      toast.error("新增失敗");
    }
  }, []);

  const updateVendor = useCallback(async (id: string, updates: Partial<VendorFormData>) => {
    const patch: Record<string, unknown> = {};
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.category !== undefined) patch.category = updates.category;
    if (updates.taxId !== undefined) patch.tax_id = updates.taxId;
    if (updates.bankCode !== undefined) patch.bank_code = updates.bankCode;
    if (updates.bankName !== undefined) patch.bank_name = updates.bankName;
    if (updates.bankAccount !== undefined) patch.bank_account = updates.bankAccount;
    if (updates.contactName !== undefined) patch.contact_name = updates.contactName;
    if (updates.contactPhone !== undefined) patch.contact_phone = updates.contactPhone;
    if (updates.contactEmail !== undefined) patch.contact_email = updates.contactEmail;

    const { data: row, error } = await supabase
      .from("vendors")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (!error && row) {
      setVendors((prev) => prev.map((v) => (v.id === id ? rowToRecord(row) : v)));
      toast.success("廠商已更新");
    } else if (error) {
      toast.error("更新失敗");
    }
  }, []);

  const deleteVendor = useCallback(async (id: string) => {
    const { error } = await supabase.from("vendors").delete().eq("id", id);
    if (!error) {
      setVendors((prev) => prev.filter((v) => v.id !== id));
      toast.success("廠商已刪除");
    } else {
      toast.error("刪除失敗");
    }
  }, []);

  return {
    vendors: filtered,
    totalCount: vendors.length,
    loading,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    addVendor,
    updateVendor,
    deleteVendor,
  };
}
