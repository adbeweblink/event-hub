"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/shared/lib/supabase";
import { parseLocalDate, WEEKDAYS } from "@/shared/lib/format";
import { EVENT_FORMATS } from "../constants";
import type {
  FYSystem, FiscalQuarter, EventType, EventFormat, EventStatus,
  RundownItemType, PersonStatus,
} from "../constants";

// ===== Data types =====

export interface RundownItem {
  id: string;
  type: RundownItemType;
  durationMin: number;
  speakerName: string;
  speakerStatus: PersonStatus;
  note: string;
}

export interface EventDraft {
  // Step 1
  fySystem: FYSystem;
  year: number;
  quarter: FiscalQuarter;
  name: string;
  type: EventType;
  format: EventFormat;
  eventUrl: string;
  // Step 4 (受眾 + 文案)
  subtitle: string;
  description: string;
  highlights: string;
  // Step 2
  expectedAttendees: number;
  venueIds: string[];       // 選的場地 ID（可多個候選）
  // Step 3
  month: number | null;
  tentativeDates: string[]; // 最多 3 個 YYYY-MM-DD
  confirmedDate: string;
  // Step 4
  audienceKeywords: string;
  audienceDescription: string; // AI 補完
  // Step 5
  setupTime: string;        // HH:MM
  startTime: string;        // HH:MM
  endTime: string;          // HH:MM
  rundown: RundownItem[];
  sponsorIds: string[];
  sponsorEntries: { sponsorId: string; role: string; fee: number; contactName: string; contactPhone: string }[];
  serviceIds: string[];
  serviceEntries: { serviceId: string; fee: number }[];
  suggestedSponsorFee: number | null;
  // Step 6
  keyVisualUrl: string;
  marketingChannels: string[];
  registrationMethod: string;
  promotionStartDate: string;
  // Step 7 — 行事曆邀請
  calendarEmails: string;     // 與會者郵件（逗號分隔）
  calendarSubject: string;    // 主旨
  calendarBody: string;       // 內文
  // Meta
  status: EventStatus;
  completionPercent: number;
  closingChecklist: { label: string; done: boolean }[];
}

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
function guessQuarter(): FiscalQuarter {
  // Adobe FY: Q1=12-2, Q2=3-5, Q3=6-8, Q4=9-11
  if (currentMonth >= 12 || currentMonth <= 2) return "Q1";
  if (currentMonth <= 5) return "Q2";
  if (currentMonth <= 8) return "Q3";
  return "Q4";
}

export const EMPTY_DRAFT: EventDraft = {
  fySystem: "adobe",
  year: currentYear,
  quarter: guessQuarter(),
  name: "",
  type: "seminar",
  format: "onsite",
  eventUrl: "",
  subtitle: "",
  description: "",
  highlights: "",
  expectedAttendees: 0,
  venueIds: [],
  month: null,
  tentativeDates: [],
  confirmedDate: "",
  audienceKeywords: "",
  audienceDescription: "",
  setupTime: "13:00",
  startTime: "14:00",
  endTime: "17:30",
  rundown: [],
  sponsorIds: [],
  sponsorEntries: [],
  serviceIds: [],
  serviceEntries: [],
  suggestedSponsorFee: null,
  keyVisualUrl: "",
  marketingChannels: [],
  registrationMethod: "",
  promotionStartDate: "",
  calendarEmails: "",
  calendarSubject: "",
  calendarBody: "",
  status: "draft",
  completionPercent: 0,
  closingChecklist: [],
};

export function useEventWizard() {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<EventDraft>(() => {
    if (typeof window === "undefined") return EMPTY_DRAFT;
    const stored = sessionStorage.getItem("event-hub:clone-draft");
    if (!stored) return EMPTY_DRAFT;
    sessionStorage.removeItem("event-hub:clone-draft");
    try {
      const cloned = JSON.parse(stored);
      return { ...EMPTY_DRAFT, ...cloned, status: "draft" as EventStatus, completionPercent: 0 };
    } catch {
      return EMPTY_DRAFT;
    }
  });

  const totalSteps = 8;

  const update = useCallback(<K extends keyof EventDraft>(key: K, value: EventDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateMany = useCallback((patch: Partial<EventDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const next = useCallback(() => setStep((s) => Math.min(s + 1, totalSteps)), []);
  const prev = useCallback(() => setStep((s) => Math.max(s - 1, 1)), []);
  const goTo = useCallback((s: number) => setStep(Math.max(1, Math.min(s, totalSteps))), []);

  // Auto-populate calendar fields when entering step 7 (only if empty)
  const calendarInitialized = useRef(false);
  useEffect(() => {
    if (step !== 8 || calendarInitialized.current) return;
    calendarInitialized.current = true;
    setDraft((prev) => {
      const format = EVENT_FORMATS.find((f) => f.value === prev.format);
      const subject = prev.calendarSubject || (prev.name ? `【活動邀請】${prev.name}` : "");
      const body = prev.calendarBody || [
        prev.name ? `活動名稱：${prev.name}` : "",
        `活動形式：${format?.label ?? ""}`,
        prev.tentativeDates.length > 0 ? `暫定日期：${prev.tentativeDates.map((d) => `${d}（${WEEKDAYS[parseLocalDate(d).getDay()]}）`).join("、")}` : "",
        prev.startTime && prev.endTime ? `時間：${prev.startTime} ~ ${prev.endTime}` : "",
        prev.venueIds.length > 0 ? `場地：${prev.venueIds.length} 個候選` : "",
        "",
        "詳細議程與報名資訊將另行通知。",
      ].filter(Boolean).join("\n");
      if (subject === prev.calendarSubject && body === prev.calendarBody) return prev;
      return { ...prev, calendarSubject: subject, calendarBody: body };
    });
  }, [step]);

  // Rundown helpers
  const addRundownItem = useCallback((item: Omit<RundownItem, "id">) => {
    setDraft((prev) => ({
      ...prev,
      rundown: [...prev.rundown, { ...item, id: `ri_${Date.now()}` }],
    }));
  }, []);

  const removeRundownItem = useCallback((id: string) => {
    setDraft((prev) => ({
      ...prev,
      rundown: prev.rundown.filter((r) => r.id !== id),
    }));
  }, []);

  const updateRundownItem = useCallback((id: string, patch: Partial<RundownItem>) => {
    setDraft((prev) => ({
      ...prev,
      rundown: prev.rundown.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  }, []);

  const moveRundownItem = useCallback((fromIdx: number, toIdx: number) => {
    setDraft((prev) => {
      const items = [...prev.rundown];
      const [moved] = items.splice(fromIdx, 1);
      items.splice(toIdx, 0, moved);
      return { ...prev, rundown: items };
    });
  }, []);

  // Compute rundown times
  function computeRundownTimes(startTime: string, items: RundownItem[]) {
    const [h, m] = startTime.split(":").map(Number);
    let totalMin = h * 60 + m;
    return items.map((item) => {
      const startH = Math.floor(totalMin / 60);
      const startM = totalMin % 60;
      totalMin += item.durationMin;
      const endH = Math.floor(totalMin / 60);
      const endM = totalMin % 60;
      return {
        ...item,
        startTime: `${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}`,
        endTime: `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`,
      };
    });
  }

  const rundownWithTimes = useMemo(
    () => computeRundownTimes(draft.setupTime || draft.startTime, draft.rundown),
    [draft.setupTime, draft.startTime, draft.rundown]
  );

  // Budget auto-calc

  /** 寫入 Supabase: events + event_venues + event_rundown */
  const createEvent = useCallback(async () => {
    const d = draft;
    // Validation: 主辦單位必填
    if (!d.name.trim()) {
      toast.error("請填寫活動名稱");
      return null;
    }
    const hasOrganizer = d.sponsorEntries.some((e) => e.role === "organizer" && e.sponsorId);
    if (!hasOrganizer) {
      toast.error("請先在「贊助與合作」設定主辦單位");
      return null;
    }
    const { data: event, error } = await supabase.from("events").insert({
      fy_system: d.fySystem,
      year: d.year,
      quarter: d.quarter,
      name: d.name || `${d.year} ${d.quarter} 活動`,
      type: d.type,
      format: d.format,
      event_url: d.eventUrl,
      status: "draft",
      subtitle: d.subtitle,
      description: d.description,
      highlights: d.highlights,
      audience_keywords: d.audienceKeywords,
      audience_description: d.audienceDescription,
      expected_attendees: d.expectedAttendees || null,
      tentative_dates: d.tentativeDates,
      confirmed_date: d.confirmedDate || null,
      setup_time: d.setupTime || null,
      start_time: d.startTime || null,
      end_time: d.endTime || null,
      key_visual_url: d.keyVisualUrl,
      marketing_channels: d.marketingChannels,
      registration_method: d.registrationMethod,
      promotion_start_date: d.promotionStartDate || null,
      calendar_emails: d.calendarEmails,
      calendar_subject: d.calendarSubject,
      calendar_body: d.calendarBody,
      completion_percent: Math.round(
        ([d.name, d.venueIds.length, d.tentativeDates.length, d.audienceDescription,
          d.rundown.length, d.sponsorEntries.length, d.marketingChannels.length,
          d.registrationMethod, d.confirmedDate, d.description]
          .filter(Boolean).length / 10) * 60
      ),
    }).select().single();

    if (error || !event) {
      toast.error("建立失敗");
      return null;
    }

    // Child table inserts — all independent, run in parallel
    const childInserts = [];
    if (d.venueIds.length > 0) {
      childInserts.push(supabase.from("event_venues").insert(
        d.venueIds.map((vid) => ({ event_id: event.id, venue_id: vid }))
      ).then());
    }
    if (d.rundown.length > 0) {
      childInserts.push(supabase.from("event_rundown").insert(
        d.rundown.map((r, i) => ({
          event_id: event.id, sort_order: i, type: r.type,
          duration_min: r.durationMin, speaker_name: r.speakerName,
          speaker_status: r.speakerStatus, note: r.note,
        }))
      ).then());
    }
    if (d.sponsorEntries.length > 0) {
      childInserts.push(supabase.from("event_sponsors").insert(
        d.sponsorEntries.filter((e) => e.sponsorId).map((e) => ({
          event_id: event.id, sponsor_id: e.sponsorId, role: e.role || "partner",
          fee: e.fee || null, contact_name: e.contactName, contact_phone: e.contactPhone,
        }))
      ).then());
    }
    if (d.serviceIds.length > 0) {
      childInserts.push(supabase.from("event_services").insert(
        d.serviceIds.map((sid) => ({ event_id: event.id, service_id: sid }))
      ).then());

      // Auto-create expenses from selected services (use serviceEntries for per-event pricing)
      const { data: svcRows } = await supabase.from("services").select("id, service_name, category, vendor_name, price").in("id", d.serviceIds);
      if (svcRows && svcRows.length > 0) {
        const feeMap = new Map(d.serviceEntries.map((e) => [e.serviceId, e.fee]));
        const expenseRows = svcRows
          .map((s: any) => {
            const fee = feeMap.get(s.id) ?? s.price ?? 0;
            return fee > 0 ? {
              event_id: event.id,
              category: s.category || "misc",
              description: s.service_name,
              amount: fee,
              tax_included: true,
              vendor_name: s.vendor_name || "",
              date: new Date().toISOString().slice(0, 10),
            } : null;
          })
          .filter(Boolean);
        if (expenseRows.length > 0) {
          childInserts.push(supabase.from("event_expenses").insert(expenseRows).then());
        }
      }
    }
    const results = await Promise.allSettled(childInserts);
    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      toast.warning(`活動已建立，但 ${failed.length} 項關聯資料寫入失敗`);
    } else {
      toast.success("活動已建立");
    }
    return event.id as string;
  }, [draft]);

  return {
    step, totalSteps,
    draft, update, updateMany,
    next, prev, goTo,
    addRundownItem, removeRundownItem, updateRundownItem, moveRundownItem,
    rundownWithTimes,
    createEvent,
  };
}
