"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/shared/lib/supabase";
import type { VenueType, District } from "../constants";

export interface VenueImage {
  id: string;
  url: string;
  label: string;
}

export interface VenueRecord {
  id: string;
  name: string;
  type: VenueType;
  district: District;
  address: string;
  capacityMin: number | null;
  capacityMax: number | null;
  priceHalfDay: number | null;
  priceFullDay: number | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  website: string;
  nearestMRT: string;
  parkingInfo: string;
  minRentalHours: number | null;
  depositPolicy: string;
  equipment: string[];
  images: VenueImage[];
  notes: string;
  rating: number;
  vendorId: string | null;
  createdAt: string;
  updatedAt: string;
}

function rowToRecord(r: Record<string, unknown>, images: VenueImage[] = []): VenueRecord {
  return {
    id: r.id as string,
    name: r.name as string,
    type: r.type as VenueType,
    district: r.district as District,
    address: (r.address as string) ?? "",
    capacityMin: r.capacity_min as number | null,
    capacityMax: r.capacity_max as number | null,
    priceHalfDay: r.price_half_day as number | null,
    priceFullDay: r.price_full_day as number | null,
    contactName: (r.contact_name as string) ?? "",
    contactPhone: (r.contact_phone as string) ?? "",
    contactEmail: (r.contact_email as string) ?? "",
    website: (r.website as string) ?? "",
    nearestMRT: (r.nearest_mrt as string) ?? "",
    parkingInfo: (r.parking_info as string) ?? "",
    minRentalHours: r.min_rental_hours as number | null,
    depositPolicy: (r.deposit_policy as string) ?? "",
    equipment: (r.equipment as string[]) ?? [],
    images,
    notes: (r.notes as string) ?? "",
    rating: (r.rating as number) ?? 3,
    vendorId: (r.vendor_id as string) ?? null,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

export type VenueFormData = Omit<VenueRecord, "id" | "createdAt" | "updatedAt">;

export function useVenues() {
  const [venues, setVenues] = useState<VenueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<VenueType | "all">("all");
  const [districtFilter, setDistrictFilter] = useState<District | "all">("all");
  const [capacityFilter, setCapacityFilter] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: rows } = await supabase.from("venues").select("*").order("name");
      const { data: imgs } = await supabase.from("venue_images").select("*").order("sort_order");
      if (cancelled) return;
      if (rows) {
      const imageMap = new Map<string, VenueImage[]>();
      for (const img of imgs ?? []) {
        const list = imageMap.get(img.venue_id) ?? [];
        list.push({ id: img.id, url: img.url, label: img.caption ?? "" });
        imageMap.set(img.venue_id, list);
      }
      setVenues(rows.map((r) => rowToRecord(r, imageMap.get(r.id) ?? [])));
    }
    setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  async function fetchVenues() {
    setLoading(true);
    const { data: rows } = await supabase.from("venues").select("*").order("name");
    const { data: imgs } = await supabase.from("venue_images").select("*").order("sort_order");
    if (rows) {
      const imageMap = new Map<string, VenueImage[]>();
      for (const img of imgs ?? []) {
        const list = imageMap.get(img.venue_id) ?? [];
        list.push({ id: img.id, url: img.url, label: img.caption ?? "" });
        imageMap.set(img.venue_id, list);
      }
      setVenues(rows.map((r) => rowToRecord(r, imageMap.get(r.id) ?? [])));
    }
    setLoading(false);
  }

  const filtered = useMemo(() => {
    return venues.filter((v) => {
      const matchSearch =
        !search ||
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.address.toLowerCase().includes(search.toLowerCase()) ||
        v.notes.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || v.type === typeFilter;
      const matchDistrict = districtFilter === "all" || v.district === districtFilter;
      let matchCapacity = true;
      const cap = v.capacityMax ?? v.capacityMin;
      if (capacityFilter !== 0 && cap != null) {
        if (capacityFilter === -50) matchCapacity = cap <= 50;
        else if (capacityFilter === 50) matchCapacity = cap >= 50 && (v.capacityMin ?? cap) <= 150;
        else if (capacityFilter === 150) matchCapacity = cap >= 150 && (v.capacityMin ?? cap) <= 250;
        else if (capacityFilter === 250) matchCapacity = cap >= 250 && (v.capacityMin ?? cap) <= 350;
        else if (capacityFilter === 350) matchCapacity = cap >= 350;
      } else if (capacityFilter !== 0 && cap == null) {
        matchCapacity = false;
      }
      return matchSearch && matchType && matchDistrict && matchCapacity;
    });
  }, [venues, search, typeFilter, districtFilter, capacityFilter]);

  const addVenue = useCallback(async (data: VenueFormData): Promise<string | null> => {
    const { data: row, error } = await supabase.from("venues").insert({
      name: data.name, type: data.type, district: data.district, address: data.address,
      capacity_min: data.capacityMin, capacity_max: data.capacityMax,
      price_half_day: data.priceHalfDay, price_full_day: data.priceFullDay,
      contact_name: data.contactName, contact_phone: data.contactPhone, contact_email: data.contactEmail,
      website: data.website, nearest_mrt: data.nearestMRT, parking_info: data.parkingInfo,
      min_rental_hours: data.minRentalHours, deposit_policy: data.depositPolicy,
      equipment: data.equipment, notes: data.notes, rating: data.rating,
      vendor_id: data.vendorId || null,
    }).select().single();
    if (!error && row) {
      setVenues((prev) => [rowToRecord(row, []), ...prev]);
      toast.success("場地已新增");
      return row.id as string;
    } else if (error) {
      toast.error("新增失敗");
    }
    return null;
  }, []);

  const updateVenue = useCallback(async (id: string, updates: Partial<VenueFormData>) => {
    const patch: Record<string, unknown> = {};
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.type !== undefined) patch.type = updates.type;
    if (updates.district !== undefined) patch.district = updates.district;
    if (updates.address !== undefined) patch.address = updates.address;
    if (updates.capacityMin !== undefined) patch.capacity_min = updates.capacityMin;
    if (updates.capacityMax !== undefined) patch.capacity_max = updates.capacityMax;
    if (updates.priceHalfDay !== undefined) patch.price_half_day = updates.priceHalfDay;
    if (updates.priceFullDay !== undefined) patch.price_full_day = updates.priceFullDay;
    if (updates.contactName !== undefined) patch.contact_name = updates.contactName;
    if (updates.contactPhone !== undefined) patch.contact_phone = updates.contactPhone;
    if (updates.contactEmail !== undefined) patch.contact_email = updates.contactEmail;
    if (updates.website !== undefined) patch.website = updates.website;
    if (updates.nearestMRT !== undefined) patch.nearest_mrt = updates.nearestMRT;
    if (updates.parkingInfo !== undefined) patch.parking_info = updates.parkingInfo;
    if (updates.minRentalHours !== undefined) patch.min_rental_hours = updates.minRentalHours;
    if (updates.depositPolicy !== undefined) patch.deposit_policy = updates.depositPolicy;
    if (updates.equipment !== undefined) patch.equipment = updates.equipment;
    if (updates.notes !== undefined) patch.notes = updates.notes;
    if (updates.rating !== undefined) patch.rating = updates.rating;
    if (updates.vendorId !== undefined) patch.vendor_id = updates.vendorId || null;
    const { data: row, error } = await supabase.from("venues").update(patch).eq("id", id).select().single();
    if (!error && row) {
      setVenues((prev) => prev.map((v) => v.id === id ? rowToRecord(row, v.images) : v));
      toast.success("場地已更新");
    } else if (error) {
      toast.error("更新失敗");
    }
  }, []);

  const deleteVenue = useCallback(async (id: string) => {
    const { error } = await supabase.from("venues").delete().eq("id", id);
    if (!error) {
      setVenues((prev) => prev.filter((v) => v.id !== id));
      toast.success("場地已刪除");
    } else {
      toast.error("刪除失敗");
    }
  }, []);

  return {
    venues: filtered,
    totalCount: venues.length,
    loading,
    search, setSearch,
    typeFilter, setTypeFilter,
    districtFilter, setDistrictFilter,
    capacityFilter, setCapacityFilter,
    addVenue, updateVenue, deleteVenue,
  };
}
