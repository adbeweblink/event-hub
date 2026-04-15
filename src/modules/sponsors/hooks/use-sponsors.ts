"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/shared/lib/supabase";
import type { SponsorTier, SponsorStatus } from "../constants";

export interface SponsorRecord {
  id: string;
  name: string;
  tier: SponsorTier;
  status: SponsorStatus;
  logo: string;
  website: string;
  industry: string;
  contactName: string;
  contactTitle: string;
  contactPhone: string;
  contactEmail: string;
  sponsorFee: number | null;
  sponsorBenefits: string;
  contractNote: string;
  notes: string;
  vendorId: string | null;
  pastEvents: string[];
  createdAt: string;
  updatedAt: string;
}

function rowToRecord(r: Record<string, unknown>, pastEvents: string[] = []): SponsorRecord {
  return {
    id: r.id as string,
    name: r.name as string,
    tier: r.tier as SponsorTier,
    status: r.status as SponsorStatus,
    logo: (r.logo as string) ?? "",
    website: (r.website as string) ?? "",
    industry: (r.industry as string) ?? "",
    contactName: (r.contact_name as string) ?? "",
    contactTitle: (r.contact_title as string) ?? "",
    contactPhone: (r.contact_phone as string) ?? "",
    contactEmail: (r.contact_email as string) ?? "",
    sponsorFee: r.sponsor_fee as number | null,
    sponsorBenefits: (r.sponsor_benefits as string) ?? "",
    contractNote: (r.contract_note as string) ?? "",
    notes: (r.notes as string) ?? "",
    vendorId: (r.vendor_id as string) ?? null,
    pastEvents,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

export type SponsorFormData = Omit<SponsorRecord, "id" | "createdAt" | "updatedAt">;

export function useSponsors() {
  const [sponsors, setSponsors] = useState<SponsorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<SponsorTier | "all">("all");
  const [statusFilter, setStatusFilter] = useState<SponsorStatus | "all">("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: rows } = await supabase.from("sponsors").select("*").order("name");
      const { data: events } = await supabase.from("sponsor_past_events").select("*");
      if (cancelled) return;
      if (rows) {
        const eventMap = new Map<string, string[]>();
        for (const e of events ?? []) {
          const list = eventMap.get(e.sponsor_id) ?? [];
          list.push(e.event_name);
          eventMap.set(e.sponsor_id, list);
        }
        setSponsors(rows.map((r) => rowToRecord(r, eventMap.get(r.id) ?? [])));
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  async function fetchSponsors() {
    setLoading(true);
    const { data: rows } = await supabase.from("sponsors").select("*").order("name");
    const { data: events } = await supabase.from("sponsor_past_events").select("*");
    if (rows) {
      const eventMap = new Map<string, string[]>();
      for (const e of events ?? []) {
        const list = eventMap.get(e.sponsor_id) ?? [];
        list.push(e.event_name);
        eventMap.set(e.sponsor_id, list);
      }
      setSponsors(rows.map((r) => rowToRecord(r, eventMap.get(r.id) ?? [])));
    }
    setLoading(false);
  }

  const filtered = useMemo(() => {
    return sponsors.filter((s) => {
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.industry.toLowerCase().includes(search.toLowerCase()) ||
        s.contactName.toLowerCase().includes(search.toLowerCase()) ||
        s.notes.toLowerCase().includes(search.toLowerCase());
      const matchTier = tierFilter === "all" || s.tier === tierFilter;
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      return matchSearch && matchTier && matchStatus;
    });
  }, [sponsors, search, tierFilter, statusFilter]);

  const addSponsor = useCallback(async (data: SponsorFormData) => {
    const { data: row, error } = await supabase.from("sponsors").insert({
      name: data.name, tier: data.tier, status: data.status,
      logo: data.logo, website: data.website, industry: data.industry,
      contact_name: data.contactName, contact_title: data.contactTitle,
      contact_phone: data.contactPhone, contact_email: data.contactEmail,
      sponsor_fee: data.sponsorFee, sponsor_benefits: data.sponsorBenefits,
      contract_note: data.contractNote, notes: data.notes,
      vendor_id: data.vendorId || null,
    }).select().single();
    if (!error && row) {
      setSponsors((prev) => [rowToRecord(row, []), ...prev]);
      toast.success("贊助商已新增");
    } else if (error) {
      toast.error("新增失敗");
    }
  }, []);

  const updateSponsor = useCallback(async (id: string, updates: Partial<SponsorFormData>) => {
    const patch: Record<string, unknown> = {};
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.tier !== undefined) patch.tier = updates.tier;
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.logo !== undefined) patch.logo = updates.logo;
    if (updates.website !== undefined) patch.website = updates.website;
    if (updates.industry !== undefined) patch.industry = updates.industry;
    if (updates.contactName !== undefined) patch.contact_name = updates.contactName;
    if (updates.contactTitle !== undefined) patch.contact_title = updates.contactTitle;
    if (updates.contactPhone !== undefined) patch.contact_phone = updates.contactPhone;
    if (updates.contactEmail !== undefined) patch.contact_email = updates.contactEmail;
    if (updates.sponsorFee !== undefined) patch.sponsor_fee = updates.sponsorFee;
    if (updates.sponsorBenefits !== undefined) patch.sponsor_benefits = updates.sponsorBenefits;
    if (updates.contractNote !== undefined) patch.contract_note = updates.contractNote;
    if (updates.notes !== undefined) patch.notes = updates.notes;
    if (updates.vendorId !== undefined) patch.vendor_id = updates.vendorId || null;
    const { data: row, error } = await supabase.from("sponsors").update(patch).eq("id", id).select().single();
    if (!error && row) {
      setSponsors((prev) => prev.map((s) => s.id === id ? { ...rowToRecord(row, s.pastEvents) } : s));
      toast.success("贊助商已更新");
    } else if (error) {
      toast.error("更新失敗");
    }
  }, []);

  const deleteSponsor = useCallback(async (id: string) => {
    const { error } = await supabase.from("sponsors").delete().eq("id", id);
    if (!error) {
      setSponsors((prev) => prev.filter((s) => s.id !== id));
      toast.success("贊助商已刪除");
    } else {
      toast.error("刪除失敗");
    }
  }, []);

  return {
    sponsors: filtered,
    totalCount: sponsors.length,
    loading,
    search, setSearch,
    tierFilter, setTierFilter,
    statusFilter, setStatusFilter,
    addSponsor, updateSponsor, deleteSponsor,
  };
}
