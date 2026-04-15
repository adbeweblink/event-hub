"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/shared/lib/supabase";
import type { FYSystem, FiscalQuarter, EventType, EventFormat, EventStatus } from "../constants";

export interface EventRecord {
  id: string;
  fySystem: FYSystem;
  year: number;
  quarter: FiscalQuarter;
  name: string;
  type: EventType;
  format: EventFormat;
  status: EventStatus;
  expectedAttendees: number;
  tentativeDates: string[];
  confirmedDate: string;
  startTime: string;
  endTime: string;
  completionPercent: number;
  createdAt: string;
  updatedAt: string;
}

function rowToRecord(r: Record<string, unknown>): EventRecord {
  return {
    id: r.id as string,
    fySystem: r.fy_system as FYSystem,
    year: r.year as number,
    quarter: r.quarter as FiscalQuarter,
    name: (r.name as string) ?? "",
    type: r.type as EventType,
    format: r.format as EventFormat,
    status: r.status as EventStatus,
    expectedAttendees: (r.expected_attendees as number) ?? 0,
    tentativeDates: (r.tentative_dates as string[]) ?? [],
    confirmedDate: (r.confirmed_date as string) ?? "",
    startTime: (r.start_time as string) ?? "",
    endTime: (r.end_time as string) ?? "",
    completionPercent: (r.completion_percent as number) ?? 0,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

export function useEvents() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("events").select("id, fy_system, year, quarter, name, type, format, status, expected_attendees, tentative_dates, confirmed_date, start_time, end_time, completion_percent, created_at").order("created_at", { ascending: false });
      if (cancelled) return;
      if (data) setEvents(data.map(rowToRecord));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  async function fetchEvents() {
    setLoading(true);
    const { data } = await supabase.from("events").select("id, fy_system, year, quarter, name, type, format, status, expected_attendees, tentative_dates, confirmed_date, start_time, end_time, completion_percent, created_at").order("created_at", { ascending: false });
    if (data) setEvents(data.map(rowToRecord));
    setLoading(false);
  }

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchSearch =
        !search ||
        e.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || e.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [events, search, statusFilter]);

  const deleteEvent = useCallback(async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (!error) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success("活動已刪除");
    } else {
      toast.error("刪除失敗");
    }
  }, []);

  return {
    events: filtered,
    totalCount: events.length,
    loading,
    search, setSearch,
    statusFilter, setStatusFilter,
    deleteEvent,
    refetch: fetchEvents,
  };
}
