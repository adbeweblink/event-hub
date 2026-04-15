"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/shared/lib/supabase";

export interface AppSettings {
  // Local-only (sensitive, stays in localStorage)
  geminiApiKey: string;
  // Supabase settings table (shared across users)
  companyName: string;
  companyNameEn: string;
  companyTaxId: string;
  defaultFySystem: string;
  notificationEmail: string;
}

const LOCAL_KEY = "event-hub-settings";

const DEFAULTS: AppSettings = {
  geminiApiKey: "",
  companyName: "",
  companyNameEn: "",
  companyTaxId: "",
  defaultFySystem: "adobe",
  notificationEmail: "",
};

/** Maps Supabase settings key → AppSettings field */
const DB_KEY_MAP: Record<string, keyof AppSettings> = {
  company_name: "companyName",
  company_name_en: "companyNameEn",
  company_tax_id: "companyTaxId",
  default_fy_system: "defaultFySystem",
  notification_email: "notificationEmail",
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Read localStorage (geminiApiKey)
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings((prev) => ({ ...prev, geminiApiKey: parsed.geminiApiKey ?? "" }));
      }
    } catch {
      localStorage.removeItem(LOCAL_KEY);
    }

    // Read Supabase settings (company info — query all, not per-user)
    (async () => {
      const { data } = await supabase.from("settings").select("key, value");
      if (cancelled || !data) { setLoaded(true); return; }
      const patch: Partial<AppSettings> = {};
      for (const row of data) {
        const field = DB_KEY_MAP[row.key];
        if (field) (patch as any)[field] = row.value;
      }
      setSettings((prev) => ({ ...prev, ...patch }));
      setLoaded(true);
    })();

    return () => { cancelled = true; };
  }, []);

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      // Persist geminiApiKey to localStorage
      if (patch.geminiApiKey !== undefined) {
        localStorage.setItem(LOCAL_KEY, JSON.stringify({ geminiApiKey: next.geminiApiKey }));
      }
      return next;
    });
  }, []);

  return { settings, update, loaded };
}
