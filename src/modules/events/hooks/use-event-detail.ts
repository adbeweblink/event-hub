"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/shared/lib/supabase";
import type { FYSystem, FiscalQuarter, EventType, EventFormat, EventStatus } from "../constants";

export interface EventDetail {
  id: string;
  fySystem: FYSystem;
  year: number;
  quarter: FiscalQuarter;
  name: string;
  type: EventType;
  format: EventFormat;
  status: EventStatus;
  eventUrl: string;
  subtitle: string;
  description: string;
  highlights: string;
  audienceKeywords: string;
  audienceDescription: string;
  expectedAttendees: number;
  tentativeDates: string[];
  confirmedDate: string;
  setupTime: string;
  startTime: string;
  endTime: string;
  keyVisualUrl: string;
  marketingChannels: string[];
  registrationMethod: string;
  promotionStartDate: string;
  calendarEmails: string;
  calendarSubject: string;
  calendarBody: string;
  completionPercent: number;
  actualAttendees: number | null;
  satisfactionScore: number | null;
  postEventNotes: string;
  registrationUrl: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  venues: { id: string; name: string }[];
  sponsors: { id: string; name: string; fee: number | null; contactName: string; contactPhone: string; role: string }[];
  rundown: { id: string; type: string; durationMin: number; speakerName: string; speakerStatus: string; note: string; sortOrder: number }[];
  services: { id: string; serviceName: string }[];
}

function mapRow(r: Record<string, unknown>): Omit<EventDetail, "venues" | "sponsors" | "rundown" | "services"> {
  return {
    id: r.id as string,
    fySystem: r.fy_system as FYSystem,
    year: r.year as number,
    quarter: r.quarter as FiscalQuarter,
    name: (r.name as string) ?? "",
    type: r.type as EventType,
    format: r.format as EventFormat,
    status: r.status as EventStatus,
    eventUrl: (r.event_url as string) ?? "",
    subtitle: (r.subtitle as string) ?? "",
    description: (r.description as string) ?? "",
    highlights: (r.highlights as string) ?? "",
    audienceKeywords: (r.audience_keywords as string) ?? "",
    audienceDescription: (r.audience_description as string) ?? "",
    expectedAttendees: (r.expected_attendees as number) ?? 0,
    tentativeDates: (r.tentative_dates as string[]) ?? [],
    confirmedDate: (r.confirmed_date as string) ?? "",
    setupTime: (r.setup_time as string) ?? "",
    startTime: (r.start_time as string) ?? "",
    endTime: (r.end_time as string) ?? "",
    keyVisualUrl: (r.key_visual_url as string) ?? "",
    marketingChannels: (r.marketing_channels as string[]) ?? [],
    registrationMethod: (r.registration_method as string) ?? "",
    promotionStartDate: (r.promotion_start_date as string) ?? "",
    calendarEmails: (r.calendar_emails as string) ?? "",
    calendarSubject: (r.calendar_subject as string) ?? "",
    calendarBody: (r.calendar_body as string) ?? "",
    completionPercent: (r.completion_percent as number) ?? 0,
    actualAttendees: (r.actual_attendees as number) ?? null,
    satisfactionScore: (r.satisfaction_score as number) ?? null,
    postEventNotes: (r.post_event_notes as string) ?? "",
    registrationUrl: (r.registration_url as string) ?? "",
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

export function useEventDetail(eventId: string) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    (async () => {
      await fetchEvent(cancelled);
    })();
    return () => { cancelled = true; };
  }, [eventId]);

  // Realtime subscription — auto-refetch on changes to this event
  useEffect(() => {
    if (!eventId) return;
    const channel = supabase.channel(`event-detail-${eventId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "events", filter: `id=eq.${eventId}` }, () => {
        fetchEvent(false, true);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "event_rundown", filter: `event_id=eq.${eventId}` }, () => {
        fetchEvent(false, true);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "event_sponsors", filter: `event_id=eq.${eventId}` }, () => {
        fetchEvent(false, true);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "event_checklist", filter: `event_id=eq.${eventId}` }, () => {
        fetchEvent(false, true);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [eventId]);

  async function fetchEvent(cancelled = false, silent = false) {
    if (!silent) setLoading(true);
    const { data: row } = await supabase.from("events").select("*").eq("id", eventId).single();
    if (cancelled || !row) { if (!cancelled) setLoading(false); return; }

    const [venuesRes, sponsorsRes, rundownRes, servicesRes, checklistRes] = await Promise.all([
      supabase.from("event_venues").select("venue_id, venues(id, name)").eq("event_id", eventId),
      supabase.from("event_sponsors").select("sponsor_id, fee, contact_name, contact_phone, role, sponsors(id, name)").eq("event_id", eventId),
      supabase.from("event_rundown").select("*").eq("event_id", eventId).order("sort_order"),
      supabase.from("event_services").select("service_id, services(id, service_name)").eq("event_id", eventId),
      supabase.from("event_checklist").select("done").eq("event_id", eventId),
    ]);

    if (cancelled) return;

    // Dynamic completion calculation
    const checklist = (checklistRes.data ?? []) as { done: boolean }[];
    const checkDone = checklist.filter((c) => c.done).length;
    const checkTotal = checklist.length;
    const fields = [
      !!row.name,
      !!(venuesRes.data?.length),
      !!((row.tentative_dates as string[])?.length),
      !!row.audience_description,
      !!(rundownRes.data?.length),
      !!(sponsorsRes.data?.length),
      !!((row.marketing_channels as string[])?.length),
      !!row.registration_method,
      !!row.confirmed_date,
      !!row.description,
    ];
    const fieldPercent = fields.filter(Boolean).length / fields.length;
    const checkPercent = checkTotal > 0 ? checkDone / checkTotal : 0;
    const computedPercent = Math.round((fieldPercent * 60 + checkPercent * 40));

    // Write back to DB if changed (fire-and-forget)
    if (computedPercent !== (row.completion_percent ?? 0)) {
      supabase.from("events").update({ completion_percent: computedPercent }).eq("id", eventId).then();
    }

    setEvent({
      ...mapRow(row),
      completionPercent: computedPercent,
      venues: (venuesRes.data ?? []).map((v: any) => ({ id: v.venues?.id ?? v.venue_id, name: v.venues?.name ?? "" })),
      sponsors: (sponsorsRes.data ?? []).map((s: any) => ({ id: s.sponsors?.id ?? s.sponsor_id, name: s.sponsors?.name ?? "", fee: s.fee, contactName: s.contact_name ?? "", contactPhone: s.contact_phone ?? "", role: s.role ?? "partner" })),
      rundown: (rundownRes.data ?? []).map((r: any) => ({ id: r.id, type: r.type, durationMin: r.duration_min, speakerName: r.speaker_name ?? "", speakerStatus: r.speaker_status ?? "pending", note: r.note ?? "", sortOrder: r.sort_order })),
      services: (servicesRes.data ?? []).map((s: any) => ({ id: s.services?.id ?? s.service_id, serviceName: s.services?.service_name ?? "" })),
    });
    setLoading(false);
  }

  const updateStatus = useCallback(async (status: EventStatus) => {
    const { error } = await supabase.from("events").update({ status }).eq("id", eventId);
    if (!error) {
      setEvent((prev) => prev ? { ...prev, status } : null);
      toast.success("狀態已更新");
    } else {
      toast.error("更新失敗");
    }
  }, [eventId]);

  /** Update any event field(s) — camelCase keys auto-mapped to snake_case */
  const updateEvent = useCallback(async (patch: Record<string, unknown>) => {
    const snakePatch: Record<string, unknown> = {};
    const keyMap: Record<string, string> = {
      name: "name", type: "type", format: "format", eventUrl: "event_url",
      subtitle: "subtitle", description: "description", highlights: "highlights",
      audienceKeywords: "audience_keywords", audienceDescription: "audience_description",
      expectedAttendees: "expected_attendees", confirmedDate: "confirmed_date",
      setupTime: "setup_time", startTime: "start_time", endTime: "end_time",
      keyVisualUrl: "key_visual_url", registrationMethod: "registration_method",
      promotionStartDate: "promotion_start_date",
      calendarEmails: "calendar_emails", calendarSubject: "calendar_subject", calendarBody: "calendar_body",
      tentativeDates: "tentative_dates", marketingChannels: "marketing_channels",
      actualAttendees: "actual_attendees", satisfactionScore: "satisfaction_score",
      postEventNotes: "post_event_notes", registrationUrl: "registration_url",
    };
    for (const [k, v] of Object.entries(patch)) {
      if (!keyMap[k]) continue;
      snakePatch[keyMap[k]] = v;
    }
    const { error } = await supabase.from("events").update(snakePatch).eq("id", eventId);
    if (!error) {
      setEvent((prev) => prev ? { ...prev, ...patch } as EventDetail : null);
      toast.success("已儲存");
    } else {
      toast.error("儲存失敗");
    }
  }, [eventId]);

  return { event, loading, updateStatus, updateEvent, refetch: fetchEvent };
}
