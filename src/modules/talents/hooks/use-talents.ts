"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/shared/lib/supabase";
import type { SpeakerSubType, FeeUnit } from "../constants";

export interface TalentRecord {
  id: string;
  name: string;
  subType: SpeakerSubType;
  title: string;
  company: string;
  specialties: string[];
  bio: string;
  avatarUrl: string;
  fee: number | null;
  feeUnit: FeeUnit;
  contactPhone: string;
  contactEmail: string;
  socialLinks: string[];
  notes: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

function rowToRecord(r: Record<string, unknown>): TalentRecord {
  return {
    id: r.id as string,
    name: r.name as string,
    subType: (r.sub_type as SpeakerSubType) ?? "",
    title: (r.title as string) ?? "",
    company: (r.company as string) ?? "",
    specialties: (r.specialties as string[]) ?? [],
    bio: (r.bio as string) ?? "",
    avatarUrl: (r.avatar_url as string) ?? "",
    fee: r.fee as number | null,
    feeUnit: ((r.fee_unit as string) ?? "per_event") as FeeUnit,
    contactPhone: (r.contact_phone as string) ?? "",
    contactEmail: (r.contact_email as string) ?? "",
    socialLinks: (r.social_links as string[]) ?? [],
    notes: (r.notes as string) ?? "",
    rating: (r.rating as number) ?? 3,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

export type TalentFormData = Omit<TalentRecord, "id" | "createdAt" | "updatedAt">;

export function useTalents() {
  const [talents, setTalents] = useState<TalentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subTypeFilter, setSubTypeFilter] = useState<SpeakerSubType | "all">("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("speakers").select("*").order("name");
      if (cancelled) return;
      if (data) setTalents(data.map(rowToRecord));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  async function fetchTalents() {
    setLoading(true);
    const { data } = await supabase.from("speakers").select("*").order("name");
    if (data) setTalents(data.map(rowToRecord));
    setLoading(false);
  }

  const filtered = useMemo(() => {
    return talents.filter((t) => {
      const matchSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.company.toLowerCase().includes(search.toLowerCase()) ||
        t.specialties.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
        t.bio.toLowerCase().includes(search.toLowerCase());
      const matchSubType = subTypeFilter === "all" || t.subType === subTypeFilter;
      return matchSearch && matchSubType;
    });
  }, [talents, search, subTypeFilter]);

  const addTalent = useCallback(async (data: TalentFormData) => {
    const { data: row, error } = await supabase.from("speakers").insert({
      name: data.name, sub_type: data.subType || null, title: data.title, company: data.company,
      specialties: data.specialties, bio: data.bio, avatar_url: data.avatarUrl,
      fee: data.fee, fee_unit: data.feeUnit,
      contact_phone: data.contactPhone, contact_email: data.contactEmail,
      social_links: data.socialLinks, notes: data.notes, rating: data.rating,
    }).select().single();
    if (!error && row) {
      setTalents((prev) => [rowToRecord(row), ...prev]);
      toast.success("講者已新增");
    } else if (error) {
      toast.error("新增失敗");
    }
  }, []);

  const updateTalent = useCallback(async (id: string, updates: Partial<TalentFormData>) => {
    const patch: Record<string, unknown> = {};
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.subType !== undefined) patch.sub_type = updates.subType || null;
    if (updates.title !== undefined) patch.title = updates.title;
    if (updates.company !== undefined) patch.company = updates.company;
    if (updates.specialties !== undefined) patch.specialties = updates.specialties;
    if (updates.bio !== undefined) patch.bio = updates.bio;
    if (updates.avatarUrl !== undefined) patch.avatar_url = updates.avatarUrl;
    if (updates.fee !== undefined) patch.fee = updates.fee;
    if (updates.feeUnit !== undefined) patch.fee_unit = updates.feeUnit;
    if (updates.contactPhone !== undefined) patch.contact_phone = updates.contactPhone;
    if (updates.contactEmail !== undefined) patch.contact_email = updates.contactEmail;
    if (updates.socialLinks !== undefined) patch.social_links = updates.socialLinks;
    if (updates.notes !== undefined) patch.notes = updates.notes;
    if (updates.rating !== undefined) patch.rating = updates.rating;
    const { data: row, error } = await supabase.from("speakers").update(patch).eq("id", id).select().single();
    if (!error && row) {
      setTalents((prev) => prev.map((t) => t.id === id ? rowToRecord(row) : t));
      toast.success("講者已更新");
    } else if (error) {
      toast.error("更新失敗");
    }
  }, []);

  const deleteTalent = useCallback(async (id: string) => {
    const { error } = await supabase.from("speakers").delete().eq("id", id);
    if (!error) {
      setTalents((prev) => prev.filter((t) => t.id !== id));
      toast.success("講者已刪除");
    } else {
      toast.error("刪除失敗");
    }
  }, []);

  return {
    talents: filtered,
    totalCount: talents.length,
    loading,
    search, setSearch,
    subTypeFilter, setSubTypeFilter,
    addTalent, updateTalent, deleteTalent,
  };
}
