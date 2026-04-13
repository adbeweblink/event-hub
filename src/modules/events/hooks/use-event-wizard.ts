"use client";

import { useState, useCallback } from "react";
import type {
  FiscalQuarter, EventType, EventFormat, EventStatus,
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

export interface EventPerson {
  id: string;
  role: "speaker" | "host" | "photographer" | "staff" | "other";
  name: string;
  status: PersonStatus;
  fee: number | null;
}

export interface BudgetLine {
  id: string;
  label: string;
  amount: number;
  source: "auto" | "manual"; // auto = 從場地/講者帶入, manual = 手動
}

export interface EventDraft {
  // Step 1
  year: number;
  quarter: FiscalQuarter;
  name: string;
  type: EventType;
  format: EventFormat;
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
  persons: EventPerson[];
  budgetLines: BudgetLine[];
  sponsorIds: string[];
  suggestedSponsorFee: number | null;
  // Step 6
  keyVisualUrl: string;
  marketingChannels: string[];
  registrationMethod: string;
  promotionStartDate: string;
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
  year: currentYear,
  quarter: guessQuarter(),
  name: "",
  type: "seminar",
  format: "onsite",
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
  persons: [],
  budgetLines: [],
  sponsorIds: [],
  suggestedSponsorFee: null,
  keyVisualUrl: "",
  marketingChannels: [],
  registrationMethod: "",
  promotionStartDate: "",
  status: "draft",
  completionPercent: 0,
  closingChecklist: [],
};

export function useEventWizard() {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<EventDraft>(EMPTY_DRAFT);

  const totalSteps = 7;

  const update = useCallback(<K extends keyof EventDraft>(key: K, value: EventDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateMany = useCallback((patch: Partial<EventDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const next = useCallback(() => setStep((s) => Math.min(s + 1, totalSteps)), []);
  const prev = useCallback(() => setStep((s) => Math.max(s - 1, 1)), []);
  const goTo = useCallback((s: number) => setStep(Math.max(1, Math.min(s, totalSteps))), []);

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

  const rundownWithTimes = computeRundownTimes(draft.startTime, draft.rundown);

  // Budget auto-calc
  const totalBudget = draft.budgetLines.reduce((s, b) => s + b.amount, 0);

  return {
    step, totalSteps,
    draft, update, updateMany,
    next, prev, goTo,
    addRundownItem, removeRundownItem, updateRundownItem,
    rundownWithTimes,
    totalBudget,
  };
}
