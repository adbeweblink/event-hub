"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/shared/lib/supabase";
import type { ExpenseCategory } from "../constants";

export interface ServiceRecord {
  id: string;
  category: ExpenseCategory;
  serviceName: string;
  description: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  vendorId: string;
  vendorName: string;
  price: number;
  priceNote: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

function rowToRecord(r: Record<string, unknown>): ServiceRecord {
  return {
    id: r.id as string,
    category: r.category as ExpenseCategory,
    serviceName: (r.service_name as string) ?? "",
    description: (r.description as string) ?? "",
    contactName: (r.contact_name as string) ?? "",
    contactPhone: (r.contact_phone as string) ?? "",
    contactEmail: (r.contact_email as string) ?? "",
    vendorId: (r.vendor_id as string) ?? "",
    vendorName: (r.vendor_name as string) ?? "",
    price: (r.price as number) ?? 0,
    priceNote: (r.price_note as string) ?? "",
    notes: (r.notes as string) ?? "",
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

export type ServiceFormData = Omit<ServiceRecord, "id" | "createdAt" | "updatedAt">;

export function useServices() {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "all">("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("services").select("*").order("service_name");
      if (cancelled) return;
      if (data) setServices(data.map(rowToRecord));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  async function fetchServices() {
    setLoading(true);
    const { data } = await supabase.from("services").select("*").order("service_name");
    if (data) setServices(data.map(rowToRecord));
    setLoading(false);
  }

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const matchSearch =
        !search ||
        s.serviceName.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase()) ||
        s.contactName.toLowerCase().includes(search.toLowerCase()) ||
        s.vendorName.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === "all" || s.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [services, search, categoryFilter]);

  const addService = useCallback(async (data: ServiceFormData) => {
    const { data: row, error } = await supabase.from("services").insert({
      category: data.category, service_name: data.serviceName, description: data.description,
      contact_name: data.contactName, contact_phone: data.contactPhone, contact_email: data.contactEmail,
      vendor_id: data.vendorId || null, vendor_name: data.vendorName,
      price: data.price ?? 0, price_note: data.priceNote ?? "", notes: data.notes,
    }).select().single();
    if (!error && row) {
      setServices((prev) => [rowToRecord(row), ...prev]);
      toast.success("服務已新增");
    } else if (error) {
      toast.error("新增失敗");
    }
  }, []);

  const updateService = useCallback(async (id: string, updates: Partial<ServiceFormData>) => {
    const patch: Record<string, unknown> = {};
    if (updates.category !== undefined) patch.category = updates.category;
    if (updates.serviceName !== undefined) patch.service_name = updates.serviceName;
    if (updates.description !== undefined) patch.description = updates.description;
    if (updates.contactName !== undefined) patch.contact_name = updates.contactName;
    if (updates.contactPhone !== undefined) patch.contact_phone = updates.contactPhone;
    if (updates.contactEmail !== undefined) patch.contact_email = updates.contactEmail;
    if (updates.vendorId !== undefined) patch.vendor_id = updates.vendorId || null;
    if (updates.vendorName !== undefined) patch.vendor_name = updates.vendorName;
    if (updates.price !== undefined) patch.price = updates.price;
    if (updates.priceNote !== undefined) patch.price_note = updates.priceNote;
    if (updates.notes !== undefined) patch.notes = updates.notes;
    const { data: row, error } = await supabase.from("services").update(patch).eq("id", id).select().single();
    if (!error && row) {
      setServices((prev) => prev.map((s) => s.id === id ? rowToRecord(row) : s));
      toast.success("服務已更新");
    } else if (error) {
      toast.error("更新失敗");
    }
  }, []);

  const deleteService = useCallback(async (id: string) => {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (!error) {
      setServices((prev) => prev.filter((s) => s.id !== id));
      toast.success("服務已刪除");
    } else {
      toast.error("刪除失敗");
    }
  }, []);

  return {
    services: filtered,
    totalCount: services.length,
    loading,
    search, setSearch,
    categoryFilter, setCategoryFilter,
    addService, updateService, deleteService,
  };
}
